const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");
const assetsDir = path.join(repoRoot, "public", "assets");
const files = [
  "koru-genesis.webp",
  "koraya.webp",
  "korvax.webp",
  "koralith.webp",
  "korvex.webp",
];

function verifyWebp(file) {
  const fullPath = path.join(assetsDir, file);
  if (!fs.existsSync(fullPath)) throw new Error(`${file}: missing production asset`);
  const buffer = fs.readFileSync(fullPath);
  if (buffer.length < 10_000) throw new Error(`${file}: unexpectedly small (${buffer.length} bytes)`);
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff !== "RIFF" || webp !== "WEBP") throw new Error(`${file}: invalid WebP signature (${riff}/${webp})`);
  console.log(`✓ ${file}: ${buffer.length} bytes`);
  return buffer;
}

const verified = Object.fromEntries(files.map((file) => [file, verifyWebp(file)]));

// Korvex is intentionally locked to the exact Korvax visual for this production release.
if (!verified["korvax.webp"].equals(verified["korvex.webp"])) {
  throw new Error("korvex.webp must match the locked Korvax production visual");
}

// The harmony branch must remain visually distinct from the guardian branch.
if (verified["koralith.webp"].equals(verified["korvax.webp"])) {
  throw new Error("koralith.webp unexpectedly matches korvax.webp");
}

console.log("✓ Koru family production art verified");
