import { keccak256, toHex } from "viem";
import { DAILY_ACTIONS } from "./companion";

export type DailyMoment = {
  title: string;
  note: string;
  actionMask: number;
  actions: typeof DAILY_ACTIONS[number][];
};

const MOMENTS = [
  { title: "A curious day", note: "Your companion woke up ready to explore the signal around Arc." },
  { title: "Low battery", note: "A quieter day. A little care and recharge will go a long way." },
  { title: "Restless energy", note: "There is too much energy to sit still today." },
  { title: "Messy morning", note: "Some days begin with chaos. Reset the space and the mood." },
  { title: "Hungry for attention", note: "Your companion has been waiting for you." },
] as const;

export function utcDayIndex(date = new Date()) {
  return Math.floor(date.getTime() / 86_400_000);
}

export function dailyMoment(dna: `0x${string}`, day = utcDayIndex()): DailyMoment {
  const seed = BigInt(keccak256(toHex(`${dna}:${day}`)));
  const count = Number(seed % 2n) + 2;
  const start = Number((seed >> 8n) % BigInt(DAILY_ACTIONS.length));
  const step = Number((seed >> 16n) % 4n) + 1;
  const selected: typeof DAILY_ACTIONS[number][] = [];

  let cursor = start;
  while (selected.length < count) {
    const candidate = DAILY_ACTIONS[cursor % DAILY_ACTIONS.length];
    if (!selected.some((action) => action.key === candidate.key)) selected.push(candidate);
    cursor += step;
  }

  const actionMask = selected.reduce((mask, action) => mask | action.bit, 0);
  const moment = MOMENTS[Number((seed >> 24n) % BigInt(MOMENTS.length))];
  return { ...moment, actionMask, actions: selected };
}
