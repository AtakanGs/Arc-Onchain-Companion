const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAY = 24 * 60 * 60;

async function nextDay(days = 1) {
  await ethers.provider.send("evm_increaseTime", [DAY * days]);
  await ethers.provider.send("evm_mine", []);
}

describe("ArcCompanion", function () {
  async function deploy() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ArcCompanion");
    const contract = await Factory.deploy("https://example.com/api/metadata/");
    await contract.waitForDeployment();
    return { contract, owner, alice, bob };
  }

  it("mints one deterministic soulbound companion per wallet", async function () {
    const { contract, alice, bob } = await deploy();
    const block = await ethers.provider.getBlock("latest");

    await contract.connect(alice).mintCompanion(block.timestamp - DAY, 1, "Kiro");
    const tokenId = await contract.companionOf(alice.address);
    expect(tokenId).to.equal(1n);

    const c = await contract.companion(tokenId);
    expect(c.name).to.equal("Kiro");
    expect(c.family).to.be.lessThan(3n);

    await expect(contract.connect(alice).mintCompanion(block.timestamp - DAY, 1, "KiroTwo"))
      .to.be.revertedWithCustomError(contract, "AlreadyHasCompanion");

    await expect(contract.connect(alice).transferFrom(alice.address, bob.address, tokenId))
      .to.be.revertedWithCustomError(contract, "Soulbound");
  });

  it("allows 2-3 daily actions and blocks duplicate daily care", async function () {
    const { contract, alice } = await deploy();
    const block = await ethers.provider.getBlock("latest");
    await contract.connect(alice).mintCompanion(block.timestamp - DAY, 2, "Lumi");

    await contract.connect(alice).completeDailyCare(1 | 2 | 4);
    const tokenId = await contract.companionOf(alice.address);
    const c = await contract.companion(tokenId);
    expect(c.currentStreak).to.equal(1n);
    expect(c.xp).to.equal(130n);

    await expect(contract.connect(alice).completeDailyCare(1 | 2))
      .to.be.revertedWithCustomError(contract, "AlreadyCompletedToday");
  });

  it("builds a streak and grants a shield at day 7", async function () {
    const { contract, alice } = await deploy();
    const block = await ethers.provider.getBlock("latest");
    await contract.connect(alice).mintCompanion(block.timestamp - DAY, 0, "Nox");

    for (let i = 0; i < 7; i++) {
      if (i > 0) await nextDay();
      await contract.connect(alice).completeDailyCare(1 | 2);
    }

    const tokenId = await contract.companionOf(alice.address);
    const c = await contract.companion(tokenId);
    expect(c.currentStreak).to.equal(7n);
    expect(c.shields).to.equal(1n);
    expect(c.milestoneFlags & 1n).to.equal(1n);
  });

  it("uses a shield to survive one missed UTC day", async function () {
    const { contract, alice } = await deploy();
    const block = await ethers.provider.getBlock("latest");
    await contract.connect(alice).mintCompanion(block.timestamp - DAY, 0, "Nova");

    for (let i = 0; i < 7; i++) {
      if (i > 0) await nextDay();
      await contract.connect(alice).completeDailyCare(1 | 2);
    }

    await nextDay(2);
    await contract.connect(alice).completeDailyCare(1 | 4);

    const tokenId = await contract.companionOf(alice.address);
    const c = await contract.companion(tokenId);
    expect(c.currentStreak).to.equal(8n);
    expect(c.shields).to.equal(0n);
  });

  it("unlocks one of two permanent evolution paths after enough XP", async function () {
    const { contract, alice } = await deploy();
    const block = await ethers.provider.getBlock("latest");
    await contract.connect(alice).mintCompanion(block.timestamp - DAY, 3, "Vexa");

    for (let i = 0; i < 8; i++) {
      if (i > 0) await nextDay();
      await contract.connect(alice).completeDailyCare(1 | 2 | 4);
    }

    const tokenId = await contract.companionOf(alice.address);
    await contract.connect(alice).chooseEvolution(1);
    const c = await contract.companion(tokenId);
    expect(c.evolutionPath).to.equal(1n);

    await expect(contract.connect(alice).chooseEvolution(2))
      .to.be.revertedWithCustomError(contract, "EvolutionAlreadyChosen");
  });
});
