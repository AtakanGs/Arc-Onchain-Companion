const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const libRoot = path.join(__dirname, "..", "lib");

const assets = [
  {
    name: "Vexa Genesis",
    root: path.join(libRoot, "vexa-source"),
    files: [
      "part-00.ts", "part-01.ts", "part-02.ts", "part-03.ts", "part-04.ts", "part-05.ts",
      "part-06.ts", "part-07.ts", "part-08.ts", "part-09.ts", "part-10.ts",
    ],
    bytes: 85070,
    sha256: "45059ef3589e3b7a5ca2bd452a5480c4e11b39e156b446d5520e84577a9355b0",
  },
  {
    name: "Veyra preview",
    root: path.join(libRoot, "vexa-web"),
    files: ["veyra-0.ts", "veyra-1.ts"],
    bytes: 12540,
    sha256: "2aca2680255eafa1b498455ad092a13fa628b0156b2cde7632ab009721cf5743",
  },
  {
    name: "Vexus preview",
    root: path.join(libRoot, "vexa-web"),
    files: ["vexus-0.ts", "vexus-1.ts"],
    bytes: 12712,
    sha256: "a6bcd95a5571b619c3a45dcf8847c6b205022bfd9116365231aa2b6a2eea740d",
  },
];

function readChunk(root, file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const match = source.match(/const chunk = "([A-Za-z0-9+/=]+)";/);
  if (!match) throw new Error(`Could not read base64 chunk from ${file}`);
  return match[1];
}

for (const asset of assets) {
  const encoded = asset.files.map((file) => readChunk(asset.root, file)).join("");
  const buffer = Buffer.from(encoded, "base64");
  const signature = buffer.subarray(0, 4).toString("ascii");
  const format = buffer.subarray(8, 12).toString("ascii");
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  if (signature !== "RIFF" || format !== "WEBP") {
    throw new Error(`${asset.name}: invalid WebP signature (${signature}/${format})`);
  }
  if (buffer.length !== asset.bytes) {
    throw new Error(`${asset.name}: expected ${asset.bytes} bytes, got ${buffer.length}`);
  }
  if (hash !== asset.sha256) {
    throw new Error(`${asset.name}: SHA-256 mismatch. Expected ${asset.sha256}, got ${hash}`);
  }

  console.log(`✓ ${asset.name}: ${buffer.length} bytes · ${hash}`);
}
