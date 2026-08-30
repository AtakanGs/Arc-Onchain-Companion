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

function verifyWebp(file, label, expectedBytes, expectedSha256) {
  const buffer = fs.readFileSync(file);
  const signature = buffer.subarray(0, 4).toString("ascii");
  const format = buffer.subarray(8, 12).toString("ascii");
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  if (signature !== "RIFF" || format !== "WEBP") {
    throw new Error(`${label}: invalid WebP signature (${signature}/${format})`);
  }
  if (buffer.length !== expectedBytes) {
    throw new Error(`${label}: expected ${expectedBytes} bytes, got ${buffer.length}`);
  }
  if (hash !== expectedSha256) {
    throw new Error(`${label}: SHA-256 mismatch. Expected ${expectedSha256}, got ${hash}`);
  }

  console.log(`✓ ${label}: ${buffer.length} bytes · ${hash}`);
}

const encoded = [
  readWrapped("part-00.txt"),
  readRaw("part-01a.b64"),
  readRaw("part-01b0.b64"),
  readRaw("part-01b1.b64"),
  readRaw("part-01b2.b64"),
  readRaw("part-01b3a.b64"),
  readRaw("part-01b3b.b64"),
  readRaw("part-01b3c0.b64"),
  readRaw("part-01b3c1.b64"),
  readRaw("part-01b3c2.b64"),
  readRaw("part-01b3c3.b64"),
  readRaw("part-01b3c4.b64"),
  readRaw("part-01b3d.b64"),
  readRaw("part-01c.b64"),
  readRaw("part-01d.b64"),
  ...Array.from({ length: 9 }, (_, offset) => readWrapped(`part-${String(offset + 2).padStart(2, "0")}.txt`)),
].join("");

const vexaBuffer = Buffer.from(encoded, "base64");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, vexaBuffer);
verifyWebp(outputFile, "Vexa Genesis static asset", EXPECTED_BYTES, EXPECTED_SHA256);

verifyWebp(
  path.join(outputDir, "noma-genesis.webp"),
  "Noma Genesis production art",
  47698,
  "882995a961876e3f7f1921aa924770c3ea1db68b75b0d141e42db26a7356d6a0",
);
