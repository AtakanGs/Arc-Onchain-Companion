const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const assetsDir = path.join(__dirname, "..", "public", "assets");
const locked = [
  { file: "nymora.webp", bytes: 9010, sha256: "bcb90fd19fddf2843cc89761a19df58047eae678826739a2b07d316ffebd784c" },
  { file: "nymoria.webp", bytes: 11732, sha256: "f393a9fa021172f387d5bf2c7882f1812e7fbdaaf4403b20eca46735427d5be4" },
  { file: "noryx.webp", bytes: 11030, sha256: "2e6c87c56a426bc411a56e8ccd000193150e8395d16dfd591fd033abc453571f" },
  { file: "noryth.webp", bytes: 12029, sha256: "cc4cf01cace59564a2972f7cb4aa62ab58fe118074c10af978f6961d2881fd8d" },
];

for (const asset of locked) {
  const file = path.join(assetsDir, asset.file);
  if (!fs.existsSync(file)) throw new Error(`${asset.file}: missing locked Noma production art`);
  const buffer = fs.readFileSync(file);
  if (buffer.length !== asset.bytes) throw new Error(`${asset.file}: byte length changed (${buffer.length} !== ${asset.bytes})`);
  if (buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error(`${asset.file}: invalid WebP signature`);
  }
  const digest = crypto.createHash("sha256").update(buffer).digest("hex");
  if (digest !== asset.sha256) throw new Error(`${asset.file}: locked art hash changed (${digest} !== ${asset.sha256})`);
  console.log(`✓ ${asset.file}: locked Noma production art verified`);
}
