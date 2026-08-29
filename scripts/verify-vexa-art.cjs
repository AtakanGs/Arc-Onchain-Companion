const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.join(__dirname, "..");
const webRoot = path.join(repoRoot, "lib", "vexa-web");

function verifyWebP(name, buffer, bytes, sha256) {
  const signature = buffer.subarray(0, 4).toString("ascii");
  const format = buffer.subarray(8, 12).toString("ascii");
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  if (signature !== "RIFF" || format !== "WEBP") {
    throw new Error(`${name}: invalid WebP signature (${signature}/${format})`);
  }
  if (buffer.length !== bytes) {
    throw new Error(`${name}: expected ${bytes} bytes, got ${buffer.length}`);
  }
  if (hash !== sha256) {
    throw new Error(`${name}: SHA-256 mismatch. Expected ${sha256}, got ${hash}`);
  }

  console.log(`✓ ${name}: ${buffer.length} bytes · ${hash}`);
}

const vexaGenesis = fs.readFileSync(path.join(repoRoot, "public", "assets", "vexa-genesis.webp"));
verifyWebP(
  "Vexa Genesis static asset",
  vexaGenesis,
  46714,
  "75e4d25ceba1e3f1cfea44dc59449c5442b4a2a1ab534f15e664ba63657fa2e6",
);

function readChunk(file) {
  const source = fs.readFileSync(path.join(webRoot, file), "utf8");
  const match = source.match(/const chunk = "([A-Za-z0-9+/=]+)";/);
  if (!match) throw new Error(`Could not read base64 chunk from ${file}`);
  return match[1];
}

for (const asset of [
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
]) {
  const encoded = asset.files.map(readChunk).join("");
  verifyWebP(asset.name, Buffer.from(encoded, "base64"), asset.bytes, asset.sha256);
}
