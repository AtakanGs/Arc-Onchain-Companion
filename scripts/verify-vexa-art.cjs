const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..", "lib", "vexa-web");

const assets = [
  {
    name: "Vexa Genesis",
    files: ["vexa-0.ts", "vexa-1.ts", "vexa-2.ts", "vexa-3.ts"],
    bytes: 28788,
    sha256: "6b80832a952acc43456864ba3eee95536a633126de779b281939a100b377e418",
  },
  {
    name: "Veyra preview",
    files: ["veyra-0.ts", "veyra-1.ts"],
    bytes: 12540,
    sha256: "2aca2680255eafa1b498455ad092a13fa628b0156b2cde7632ab009721cf5743",
  },
  {
    name: "Vexus preview",
    files: ["vexus-0.ts", "vexus-1.ts"],
    bytes: 12712,
    sha256: "a6bcd95a5571b619c3a45dcf8847c6b205022bfd9116365231aa2b6a2eea740d",
  },
];

function readChunk(file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const match = source.match(/const chunk = "([A-Za-z0-9+/=]+)";/);
  if (!match) throw new Error(`Could not read base64 chunk from ${file}`);
  return match[1];
}

for (const asset of assets) {
  const encoded = asset.files.map(readChunk).join("");
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
