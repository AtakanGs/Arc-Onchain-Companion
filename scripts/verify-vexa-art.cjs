const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const repoRoot = path.join(__dirname, "..");
const vexaSourceRoot = path.join(repoRoot, "assets-src", "vexa-genesis");
const nomaSourceRoot = path.join(repoRoot, "assets-src", "noma-genesis");
const outputDir = path.join(repoRoot, "public", "assets");
const vexaOutputFile = path.join(outputDir, "vexa-genesis.webp");
const nomaOutputFile = path.join(outputDir, "noma-genesis.webp");

const VEXA_EXPECTED_BYTES = 85070;
const VEXA_EXPECTED_SHA256 = "45059ef3589e3b7a5ca2bd452a5480c4e11b39e156b446d5520e84577a9355b0";
const NOMA_EXPECTED_BYTES = 47698;
const NOMA_EXPECTED_SHA256 = "882995a961876e3f7f1921aa924770c3ea1db68b75b0d141e42db26a7356d6a0";
const NOMA_CHUNK_LENGTH = 7950;

function readWrapped(root, file) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const prefix = 'const chunk = "';
  const start = source.indexOf(prefix);
  if (start === -1) throw new Error(`${file}: missing chunk prefix`);
  const match = source.slice(start + prefix.length).match(/^[A-Za-z0-9+/=]+/);
  if (!match) throw new Error(`${file}: no base64 payload found`);
  return match[0];
}

function readRaw(root, file) {
  const source = fs.readFileSync(path.join(root, file), "utf8").trim();
  if (!source || !/^[A-Za-z0-9+/=]+$/.test(source)) {
    throw new Error(`${file}: invalid raw base64 payload`);
  }
  return source;
}

function verifyWebp(file, label, expectedBytes, expectedSha256) {
  const buffer = fs.readFileSync(file);
  const signature = buffer.subarray(0, 4).toString("ascii");
  const format = buffer.subarray(8, 12).toString("ascii");
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  if (signature !== "RIFF" || format !== "WEBP") throw new Error(`${label}: invalid WebP signature (${signature}/${format})`);
  if (buffer.length !== expectedBytes) throw new Error(`${label}: expected ${expectedBytes} bytes, got ${buffer.length}`);
  if (hash !== expectedSha256) throw new Error(`${label}: SHA-256 mismatch. Expected ${expectedSha256}, got ${hash}`);
  console.log(`✓ ${label}: ${buffer.length} bytes · ${hash}`);
}

const vexaEncoded = [
  readWrapped(vexaSourceRoot, "part-00.txt"),
  readRaw(vexaSourceRoot, "part-01a.b64"),
  readRaw(vexaSourceRoot, "part-01b0.b64"), readRaw(vexaSourceRoot, "part-01b1.b64"), readRaw(vexaSourceRoot, "part-01b2.b64"),
  readRaw(vexaSourceRoot, "part-01b3a.b64"), readRaw(vexaSourceRoot, "part-01b3b.b64"),
  readRaw(vexaSourceRoot, "part-01b3c0.b64"), readRaw(vexaSourceRoot, "part-01b3c1.b64"), readRaw(vexaSourceRoot, "part-01b3c2.b64"), readRaw(vexaSourceRoot, "part-01b3c3.b64"), readRaw(vexaSourceRoot, "part-01b3c4.b64"),
  readRaw(vexaSourceRoot, "part-01b3d.b64"), readRaw(vexaSourceRoot, "part-01c.b64"), readRaw(vexaSourceRoot, "part-01d.b64"),
  ...Array.from({ length: 9 }, (_, offset) => readWrapped(vexaSourceRoot, `part-${String(offset + 2).padStart(2, "0")}.txt`)),
].join("");

const nomaChunks = Array.from({ length: 8 }, (_, index) => {
  const file = `part-${String(index).padStart(2, "0")}.b64`;
  const chunk = readRaw(nomaSourceRoot, file);
  console.log(`Noma ${file}: ${chunk.length} base64 chars`);
  if (chunk.length !== NOMA_CHUNK_LENGTH) throw new Error(`${file}: expected ${NOMA_CHUNK_LENGTH} base64 chars, got ${chunk.length}`);
  return chunk;
});
const nomaEncoded = nomaChunks.join("");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(vexaOutputFile, Buffer.from(vexaEncoded, "base64"));
fs.writeFileSync(nomaOutputFile, Buffer.from(nomaEncoded, "base64"));
verifyWebp(vexaOutputFile, "Vexa Genesis static asset", VEXA_EXPECTED_BYTES, VEXA_EXPECTED_SHA256);
verifyWebp(nomaOutputFile, "Noma Genesis production art", NOMA_EXPECTED_BYTES, NOMA_EXPECTED_SHA256);
