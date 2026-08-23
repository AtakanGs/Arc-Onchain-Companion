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
  {
    type: "function",
    name: "companion",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{
      name: "",
      type: "tuple",
      components: [
        { name: "bornOnArc", type: "uint64" },
        { name: "adoptedAt", type: "uint64" },
        { name: "xp", type: "uint32" },
        { name: "currentStreak", type: "uint16" },
        { name: "longestStreak", type: "uint16" },
        { name: "lastCareDay", type: "uint32" },
        { name: "archetype", type: "uint8" },
        { name: "family", type: "uint8" },
        { name: "evolutionPath", type: "uint8" },
        { name: "shields", type: "uint8" },
        { name: "milestoneFlags", type: "uint8" },
        { name: "dna", type: "bytes32" },
        { name: "name", type: "string" },
      ],
    }],
  },
  {
    type: "function",
    name: "levelOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "level", type: "uint256" }],
  },
  {
    type: "function",
    name: "completeDailyCare",
    stateMutability: "nonpayable",
    inputs: [{ name: "actionsMask", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function",
    name: "chooseEvolution",
    stateMutability: "nonpayable",
    inputs: [{ name: "path", type: "uint8" }],
    outputs: [],
  },
] as const;

export const arcCompanionAddress = process.env.NEXT_PUBLIC_ARC_COMPANION_ADDRESS as `0x${string}` | undefined;
