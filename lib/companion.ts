export const ARCHETYPES = [
  "Builder",
  "Explorer",
  "Creator",
  "Connector",
  "Researcher",
  "Challenger",
] as const;

export const FAMILIES = ["Vexa", "Noma", "Koru"] as const;

export const DAILY_ACTIONS = [
  { key: "feed", label: "Feed", bit: 1 },
  { key: "care", label: "Care", bit: 2 },
  { key: "play", label: "Play", bit: 4 },
  { key: "clean", label: "Clean", bit: 8 },
  { key: "recharge", label: "Recharge", bit: 16 },
] as const;

export function familyFromDna(dna: bigint) {
  return FAMILIES[Number(dna % 3n)];
}
