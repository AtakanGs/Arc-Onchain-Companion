"use client";

import { useMemo, useState } from "react";
import { createWalletClient, custom } from "viem";
import { arcTestnet } from "viem/chains";
import { arcPublicClient } from "../../lib/arc";
import { ARCHETYPES, FAMILIES } from "../../lib/companion";
import { arcCompanionAbi, arcCompanionAddress } from "../../lib/contract";
import { dailyMoment, utcDayIndex } from "../../lib/daily";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

type CompanionState = {
  bornOnArc: bigint;
  adoptedAt: bigint;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastCareDay: number;
  archetype: number;
  family: number;
  evolutionPath: number;
  shields: number;
  milestoneFlags: number;
  dna: `0x${string}`;
  name: string;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function birthDate(timestamp: bigint) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Number(timestamp) * 1000));
}

export default function CompanionHome() {
  const [address, setAddress] = useState<`0x${string}` | "">("");
  const [tokenId, setTokenId] = useState<bigint>(0n);
  const [companion, setCompanion] = useState<CompanionState | null>(null);
  const [level, setLevel] = useState(1n);
  const [status, setStatus] = useState<"idle" | "loading" | "care" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");

  const moment = useMemo(() => companion ? dailyMoment(companion.dna) : null, [companion]);
  const completedToday = companion ? companion.lastCareDay === utcDayIndex() : false;

  async function refresh(owner: `0x${string}`) {
    if (!arcCompanionAddress) {
      setStatus("error");
      setMessage("The Arc Companion contract has not been configured yet.");
      return;
    }

    setStatus("loading");
    try {
      const id = await arcPublicClient.readContract({
        address: arcCompanionAddress,
        abi: arcCompanionAbi,
        functionName: "companionOf",
        args: [owner],
      });

      if (id === 0n) {
        setStatus("error");
        setMessage("No companion is attached to this wallet yet. Complete the genesis flow first.");
        return;
      }

      const [rawCompanion, rawLevel] = await Promise.all([
        arcPublicClient.readContract({
          address: arcCompanionAddress,
          abi: arcCompanionAbi,
          functionName: "companion",
          args: [id],
        }),
        arcPublicClient.readContract({
          address: arcCompanionAddress,
          abi: arcCompanionAbi,
          functionName: "levelOf",
          args: [id],
        }),
      ]);

      setTokenId(id);
      setLevel(rawLevel);
      setCompanion({
        ...rawCompanion,
        xp: Number(rawCompanion.xp),
        currentStreak: Number(rawCompanion.currentStreak),
        longestStreak: Number(rawCompanion.longestStreak),
        lastCareDay: Number(rawCompanion.lastCareDay),
        archetype: Number(rawCompanion.archetype),
        family: Number(rawCompanion.family),
        evolutionPath: Number(rawCompanion.evolutionPath),
        shields: Number(rawCompanion.shields),
        milestoneFlags: Number(rawCompanion.milestoneFlags),
      });
      setStatus("ready");
      setMessage("");
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Could not load companion state.");
    }
  }

  async function connect() {
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      setStatus("error");
      setMessage("No injected wallet found.");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
      const owner = accounts[0];
      if (!owner) throw new Error("No wallet account returned");
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x4cef52" }] });
      setAddress(owner);
      await refresh(owner);
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Wallet connection failed.");
    }
  }

  async function completeCare() {
    if (!address || !moment || !arcCompanionAddress || completedToday) return;
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) return;

    try {
      setStatus("care");
      const walletClient = createWalletClient({
        account: address,
        chain: arcTestnet,
        transport: custom(ethereum),
      });
      const hash = await walletClient.writeContract({
        address: arcCompanionAddress,
        abi: arcCompanionAbi,
        functionName: "completeDailyCare",
        args: [moment.actionMask],
      });
      await arcPublicClient.waitForTransactionReceipt({ hash });
      await refresh(address);
      setMessage("Today is saved on Arc ✓");
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Daily care transaction failed.");
    }
  }

  if (!address || !companion) {
    return (
      <main className="shell">
        <nav className="nav"><strong>ARC COMPANION</strong><span className="network">Companion Home</span></nav>
        <section className="homeEmpty">
          <p className="eyebrow">RETURN TO YOUR COMPANION</p>
          <h1>Your Arc day starts here.</h1>
          <p className="lede">Connect the wallet that owns your soulbound companion. The app will read its latest state directly from Arc.</p>
          <button onClick={connect} disabled={status === "loading"}>{status === "loading" ? "Reading Arc…" : "Connect wallet"}</button>
          {message && <p className="errorText">{message}</p>}
          {status === "error" && tokenId === 0n && <a className="textLink" href="/">Return to genesis</a>}
        </section>
      </main>
    );
  }

  const family = FAMILIES[companion.family] ?? "Unknown";
  const archetype = ARCHETYPES[companion.archetype] ?? "Unknown";

  return (
    <main className="shell">
      <nav className="nav"><strong>ARC COMPANION</strong><span className="network">{shortAddress(address)} · Arc Testnet</span></nav>
      <section className="homeGrid">
        <div className="homeCreature">
          <div className="companionCard active homeCard">
            <div className="orb" />
            <div className="placeholderBody"><div className="ear left" /><div className="ear right" /><div className="face"><span className="eye" /><span className="eye" /></div></div>
            <div className="cardMeta"><span>{family.toUpperCase()} · LEVEL {level.toString()}</span><strong>{companion.name}</strong></div>
          </div>
        </div>

        <div className="dailyPanel">
          <div className="quizTopline"><span>DAILY MOMENT</span><span>{completedToday ? "COMPLETE" : "READY"}</span></div>
          <h2>{completedToday ? `${companion.name} is settled for today.` : moment?.title}</h2>
          <p className="lede">{completedToday ? "Come back after the next UTC reset. Your streak and progress are already stored on Arc." : moment?.note}</p>

          {!completedToday && moment && (
            <div className="dailyActions">
              {moment.actions.map((action) => <div key={action.key}><span>{action.label}</span><small>Today</small></div>)}
            </div>
          )}

          <div className="statsGrid">
            <div><span>STREAK</span><strong>🔥 {companion.currentStreak}</strong></div>
            <div><span>XP</span><strong>{companion.xp}</strong></div>
            <div><span>SHIELDS</span><strong>{companion.shields} / 2</strong></div>
            <div><span>BORN ON ARC</span><strong>{birthDate(companion.bornOnArc)}</strong></div>
          </div>

          {!completedToday && <button onClick={completeCare} disabled={status === "care"}>{status === "care" ? "Saving on Arc…" : "Complete today’s care"}</button>}
          {message && <p className={status === "error" ? "errorText" : "successText"}>{message}</p>}
          <p className="micro">{archetype} · Token #{tokenId.toString()} · Daily reset uses UTC for deterministic onchain streaks.</p>
        </div>
      </section>
    </main>
  );
}
