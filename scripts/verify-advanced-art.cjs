const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const assetsDir = path.join(__dirname, "..", "public", "assets");
const files = ["nymora.webp", "nymoria.webp", "noryx.webp", "noryth.webp", "veyrion.webp", "vexaris.webp"];
const hashes = new Map();

for (const file of files) {
  const fullPath = path.join(assetsDir, file);
  if (!fs.existsSync(fullPath)) throw new Error(`${file}: missing locked production asset`);
  const buffer = fs.readFileSync(fullPath);
  if (buffer.length < 7_000) throw new Error(`${file}: unexpectedly small (${buffer.length} bytes)`);
  if (buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error(`${file}: invalid WebP signature`);
  }
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  if (hashes.has(hash)) throw new Error(`${file}: duplicates ${hashes.get(hash)}`);
  hashes.set(hash, file);
  console.log(`✓ ${file}: ${buffer.length} bytes · ${hash.slice(0, 12)}`);
}

console.log("✓ Locked Noma and Vexa Ascended artwork verified");
