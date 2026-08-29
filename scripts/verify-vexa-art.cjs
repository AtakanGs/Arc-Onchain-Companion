const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.join(__dirname, "..");
const sourceRoot = path.join(repoRoot, "assets-src", "vexa-genesis");
const outputDir = path.join(repoRoot, "public", "assets");
const outputFile = path.join(outputDir, "vexa-genesis.webp");

const EXPECTED_BYTES = 85070;
const EXPECTED_SHA256 = "45059ef3589e3b7a5ca2bd452a5480c4e11b39e156b446d5520e84577a9355b0";

function readWrapped(file) {
  const source = fs.readFileSync(path.join(sourceRoot, file), "utf8");
  const prefix = 'const chunk = "';
  const start = source.indexOf(prefix);
  if (start === -1) throw new Error(`${file}: missing chunk prefix`);
  const match = source.slice(start + prefix.length).match(/^[A-Za-z0-9+/=]+/);
  if (!match) throw new Error(`${file}: no base64 payload found`);
  return match[0];
}

function readRaw(file) {
  const source = fs.readFileSync(path.join(sourceRoot, file), "utf8").trim();
  if (!source || !/^[A-Za-z0-9+/=]+$/.test(source)) {
    throw new Error(`${file}: invalid raw base64 payload`);
  }
  return source;
}

const encoded = [
  readWrapped("part-00.txt"),
  readRaw("part-01a.b64"),
  readRaw("part-01b0.b64"),
  readRaw("part-01b1.b64"),
  readRaw("part-01b2.b64"),
  readRaw("part-01b3a.b64"),
  readRaw("part-01b3b.b64"),
  readRaw("part-01b3c.b64"),
  readRaw("part-01b3d.b64"),
  readRaw("part-01c.b64"),
  readRaw("part-01d.b64"),
  ...Array.from({ length: 9 }, (_, offset) => readWrapped(`part-${String(offset + 2).padStart(2, "0")}.txt`)),
].join("");

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
