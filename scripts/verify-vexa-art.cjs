const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.join(__dirname, "..");
const sourceRoot = path.join(repoRoot, "assets-src", "vexa-genesis");
const outputDir = path.join(repoRoot, "public", "assets");
const outputFile = path.join(outputDir, "vexa-genesis.webp");

const EXPECTED_BYTES = 85070;
const EXPECTED_SHA256 = "45059ef3589e3b7a5ca2bd452a5480c4e11b39e156b446d5520e84577a9355b0";
const PART_COUNT = 11;

function extractBase64(source, file) {
  const prefix = 'const chunk = "';
  const start = source.indexOf(prefix);
  if (start === -1) {
    throw new Error(`${file}: missing chunk prefix`);
  }

  const remainder = source.slice(start + prefix.length);
  const match = remainder.match(/^[A-Za-z0-9+/=]+/);
  if (!match) {
    throw new Error(`${file}: no base64 payload found`);
  }
  return match[0];
}

const encoded = Array.from({ length: PART_COUNT }, (_, index) => {
  const file = `part-${String(index).padStart(2, "0")}.txt`;
  const source = fs.readFileSync(path.join(sourceRoot, file), "utf8");
  return extractBase64(source, file);
}).join("");

const buffer = Buffer.from(encoded, "base64");
const signature = buffer.subarray(0, 4).toString("ascii");
const format = buffer.subarray(8, 12).toString("ascii");
const hash = crypto.createHash("sha256").update(buffer).digest("hex");

if (signature !== "RIFF" || format !== "WEBP") {
  throw new Error(`Vexa Genesis: invalid WebP signature (${signature}/${format})`);
}
if (buffer.length !== EXPECTED_BYTES) {
  throw new Error(`Vexa Genesis: expected ${EXPECTED_BYTES} bytes, got ${buffer.length}`);
}
if (hash !== EXPECTED_SHA256) {
  throw new Error(`Vexa Genesis: SHA-256 mismatch. Expected ${EXPECTED_SHA256}, got ${hash}`);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, buffer);

const written = fs.readFileSync(outputFile);
const writtenHash = crypto.createHash("sha256").update(written).digest("hex");
if (written.length !== EXPECTED_BYTES || writtenHash !== EXPECTED_SHA256) {
  throw new Error("Vexa Genesis: generated static asset failed post-write verification");
}

console.log(`✓ Vexa Genesis static asset: ${written.length} bytes · ${writtenHash}`);
