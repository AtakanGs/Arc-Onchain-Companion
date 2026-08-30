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
const NOMA_CHUNK_SHA256 = [
  "7aeb26f6750838ccab76efc92f08f52bd9e9204d3ba05715c78c5e836c0ffcd2",
  "e5fb1b05346fd627080a4c6144fc2c6e3e83ca787961051565de9fad1baf5669",
  "4d997a390663d9485cd7e18aa85e03595d584d6327610334074f5b737c4c67b4",
  "d13c4558332c6022e41452244d10e45120ff82f8f2156d213c88a4332ed228e9",
  "3e7bf86efc8d0d23f0787e7a4bc435217681329d101776170c0a741838e06e4a",
  "149e77918439b8e1eae270a50c2761926b127b911b15a171fd2613b059700b4f",
  "9a3e9ef08f7f0ec7316d81921efd10412691dd8115254817276e6aa07c68a4d4",
  "bc10608a7b10fba297d7e1cc37a0703140634f73b4b28c8604629cab530fd179",
];

function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
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
  if (!source || !/^[A-Za-z0-9+/=]+$/.test(source)) throw new Error(`${file}: invalid raw base64 payload`);
  return source;
}
function verifyWebp(file, label, expectedBytes, expectedSha256) {
  const buffer = fs.readFileSync(file);
  const signature = buffer.subarray(0, 4).toString("ascii");
  const format = buffer.subarray(8, 12).toString("ascii");
  const hash = sha256(buffer);
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

const firstNomaChunk = ["part-00a.b64", "part-00b.b64", "part-00c.b64", "part-00d.b64"].map((file) => readRaw(nomaSourceRoot, file)).join("");
const nomaChunks = [firstNomaChunk, ...Array.from({ length: 7 }, (_, index) => readRaw(nomaSourceRoot, `part-${String(index + 1).padStart(2, "0")}.b64`))];
nomaChunks.forEach((chunk, index) => {
  if (chunk.length !== 7950) throw new Error(`Noma chunk ${index}: expected 7950 base64 chars, got ${chunk.length}`);
  const hash = sha256(chunk);
  if (hash !== NOMA_CHUNK_SHA256[index]) throw new Error(`Noma chunk ${index}: SHA-256 mismatch. Expected ${NOMA_CHUNK_SHA256[index]}, got ${hash}`);
  console.log(`✓ Noma source chunk ${index}: ${hash}`);
});
const nomaEncoded = nomaChunks.join("");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(vexaOutputFile, Buffer.from(vexaEncoded, "base64"));
fs.writeFileSync(nomaOutputFile, Buffer.from(nomaEncoded, "base64"));
verifyWebp(vexaOutputFile, "Vexa Genesis static asset", VEXA_EXPECTED_BYTES, VEXA_EXPECTED_SHA256);
verifyWebp(nomaOutputFile, "Noma Genesis production art", NOMA_EXPECTED_BYTES, NOMA_EXPECTED_SHA256);
