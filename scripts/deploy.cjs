const hre = require("hardhat");

async function main() {
  const baseUri = process.env.METADATA_BASE_URI || "https://example.com/api/metadata/";
  const ArcCompanion = await hre.ethers.getContractFactory("ArcCompanion");
  const contract = await ArcCompanion.deploy(baseUri);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ArcCompanion deployed:", address);
  console.log("ArcScan:", `https://testnet.arcscan.app/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
