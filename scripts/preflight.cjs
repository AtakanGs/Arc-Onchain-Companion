const hre = require("hardhat");

async function main() {
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 5042002n) {
    throw new Error(`Wrong network: expected Arc Testnet 5042002, received ${network.chainId}`);
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured. Set DEPLOYER_PRIVATE_KEY in the local .env file.");
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Network: Arc Testnet (5042002)");
  console.log("Deployer:", deployer.address);
  console.log("Native gas USDC:", hre.ethers.formatUnits(balance, 18));

  if (balance === 0n) {
    throw new Error("Deployer has no Arc Testnet native USDC for gas. Fund it from the Circle Faucet first.");
  }

  console.log("Preflight: OK");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
