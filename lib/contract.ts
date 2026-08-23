export const arcCompanionAbi = [
  {
    type: "function",
    name: "mintCompanion",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bornOnArc", type: "uint64" },
      { name: "archetype", type: "uint8" },
      { name: "companionName", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "companionOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;

export const arcCompanionAddress = process.env.NEXT_PUBLIC_ARC_COMPANION_ADDRESS as `0x${string}` | undefined;
