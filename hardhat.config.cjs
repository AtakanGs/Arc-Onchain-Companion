require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 500 },
      evmVersion: "cancun"
    }
  },
  networks: {
    arcTestnet: {
      url: process.env.ARC_RPC_URL || "https://rpc.testnet.arc.io",
      chainId: 5042002,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : []
    }
  },
  mocha: { timeout: 60000 }
};
