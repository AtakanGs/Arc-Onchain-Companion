"use client";

import { useMemo, useState } from "react";
import { createWalletClient, custom } from "viem";
import { arcTestnet } from "viem/chains";
import { CompanionVisual, type CompanionReaction } from "../../components/CompanionVisual";
import { arcPublicClient } from "../../lib/arc";
import { ARCHETYPES, FAMILIES } from "../../lib/companion";
import { arcCompanionAbi, arcCompanionAddress } from "../../lib/contract";
import { dailyMoment, utcDayIndex } from "../../lib/daily";
import { veyraPreviewArt, vexusPreviewArt } from "../../lib/vexa-evolution-art";

type EthereumProvider = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
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

type Status = "idle" | "loading" | "care" | "evolution" | "ready" | "error";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function birthDate(timestamp: bigint) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Number(timestamp) * 1000));
}

export default function CompanionHome() {
  const [address, setAddress] = useState<`0x${string}` | "">("");
  const [tokenId, setTokenId] = useState<bigint>(0n);
  const [companion, setCompanion] = useState<CompanionState | null>(null);
  const [level, setLevel] = useState(1n);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [reaction, setReaction] = useState<CompanionReaction>("idle");
  const [pendingEvolution, setPendingEvolution] = useState<0 | 1 | 2>(0);

  const moment = useMemo(() => companion ? dailyMoment(companion.dna) : null, [companion]);
  const completedToday = companion ? companion.lastCareDay === utcDayIndex() : false;
  const allActionsDone = Boolean(moment && moment.actions.every((action) => selectedActions.includes(action.key)));

  async function refresh(owner: `0x${string}`) {
    if (!arcCompanionAddress) {
      setStatus("error");
      setMessage("The Arc Companion contract has not been configured yet.");
      return;
    }

    setStatus("loading");
    try {
      const id = await arcPublicClient.readContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "companionOf", args: [owner] });
      if (id === 0n) {
        setStatus("error");
        setMessage("No companion is attached to this wallet yet. Complete the genesis flow first.");
        return;
      }

      const [rawCompanion, rawLevel] = await Promise.all([
        arcPublicClient.readContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "companion", args: [id] }),
        arcPublicClient.readContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "levelOf", args: [id] }),
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

  function performAction(key: string) {
    if (completedToday || selectedActions.includes(key)) return;
    setSelectedActions((current) => [...current, key]);
    setReaction(key as CompanionReaction);
    window.setTimeout(() => setReaction("idle"), 900);
  }

  async function completeCare() {
    if (!address || !moment || !arcCompanionAddress || completedToday || !allActionsDone) return;
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) return;

    try {
      setStatus("care");
      const walletClient = createWalletClient({ account: address, chain: arcTestnet, transport: custom(ethereum) });
      const hash = await walletClient.writeContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "completeDailyCare", args: [moment.actionMask] });
      await arcPublicClient.waitForTransactionReceipt({ hash });
      setSelectedActions([]);
      setReaction("idle");
      await refresh(address);
      setMessage("Today is saved on Arc ✓");
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Daily care transaction failed.");
    }
  }

  async function chooseEvolution(path: 1 | 2) {
    if (!address || !arcCompanionAddress || !companion || companion.xp < 1000 || companion.evolutionPath !== 0) return;
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) return;

    try {
      setStatus("evolution");
      const walletClient = createWalletClient({ account: address, chain: arcTestnet, transport: custom(ethereum) });
      const hash = await walletClient.writeContract({ address: arcCompanionAddress, abi: arcCompanionAbi, functionName: "chooseEvolution", args: [path] });
      await arcPublicClient.waitForTransactionReceipt({ hash });
      setPendingEvolution(0);
      await refresh(address);
      setMessage(path === 1 ? "Veyra path awakened on Arc ✓" : "Vexus path awakened on Arc ✓");
    } catch (cause) {
      setStatus("error");
      setMessage(cause instanceof Error ? cause.message : "Evolution transaction failed.");
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
  const isVexa = family === "Vexa";
  const evolutionUnlocked = companion.xp >= 1000;
  const ascendedReached = (companion.milestoneFlags & 4) !== 0;
  const evolvedName = companion.evolutionPath === 1 ? "Veyra" : companion.evolutionPath === 2 ? "Vexus" : "Vexa";
  const ascendedName = companion.evolutionPath === 1 ? "Veyrion" : companion.evolutionPath === 2 ? "Vexaris" : "Unknown";
  const xpProgress = Math.min(companion.xp, 1000);

  return (
    <main className="shell">
      <nav className="nav"><strong>ARC COMPANION</strong><span className="network">{shortAddress(address)} · Arc Testnet</span></nav>
      <section className="homeGrid">
        <div className="homeCreature">
          <CompanionVisual
            label={`${companion.name} · Level ${level.toString()}`}
            mode="awake"
            familyIndex={companion.family}
            archetypeIndex={companion.archetype}
            evolutionPath={isVexa ? companion.evolutionPath : 0}
            reaction={isVexa ? reaction : "idle"}
          />
        </div>

        <div className="dailyPanel">
          <div className="quizTopline"><span>DAILY MOMENT</span><span>{completedToday ? "COMPLETE" : allActionsDone ? "READY TO SAVE" : "READY"}</span></div>
          <h2>{completedToday ? `${companion.name} is settled for today.` : moment?.title}</h2>
          <p className="lede">{completedToday ? "Come back after the next UTC reset. Your streak and progress are already stored on Arc." : moment?.note}</p>

          {!completedToday && moment && (
            <div className="dailyActions">
              {moment.actions.map((action) => {
                const done = selectedActions.includes(action.key);
                return (
                  <button className={`dailyAction ${done ? "done" : ""}`} key={action.key} onClick={() => performAction(action.key)} disabled={done || status === "care"}>
                    <span>{action.label}</span><small>{done ? "DONE" : "DO NOW"}</small>
                  </button>
                );
              })}
            </div>
          )}

          <div className="statsGrid">
            <div><span>STREAK</span><strong>🔥 {companion.currentStreak}</strong></div>
            <div><span>XP</span><strong>{companion.xp}</strong></div>
            <div><span>SHIELDS</span><strong>{companion.shields} / 2</strong></div>
            <div><span>BORN ON ARC</span><strong>{birthDate(companion.bornOnArc)}</strong></div>
          </div>

          {!completedToday && (
            <button onClick={completeCare} disabled={status === "care" || !allActionsDone}>
              {status === "care" ? "Saving on Arc…" : allActionsDone ? "Save today on Arc" : "Complete the actions above"}
            </button>
          )}
          {message && <p className={status === "error" ? "errorText" : "successText"}>{message}</p>}
          <p className="micro">{archetype} · Token #{tokenId.toString()} · Daily reset uses UTC for deterministic onchain streaks.</p>
        </div>
      </section>

      {isVexa && (
        <section className="evolutionPanel">
          <div className="evolutionHeader">
            <div><p className="eyebrow">VEXA EVOLUTION</p><h2>{companion.evolutionPath === 0 ? "One origin. Two permanent paths." : `${evolvedName} has awakened.`}</h2></div>
            {companion.evolutionPath === 0 && <span className={`evolutionLock ${evolutionUnlocked ? "unlocked" : ""}`}>{evolutionUnlocked ? "UNLOCKED" : `${xpProgress} / 1000 XP`}</span>}
          </div>

          {companion.evolutionPath === 0 ? (
            <>
              <p className="lede">Reach 1,000 XP to make a permanent onchain choice. Preview both paths now; the full Ascended form stays hidden until your journey earns it.</p>
              <div className="evolutionProgress"><i style={{ width: `${(xpProgress / 1000) * 100}%` }} /></div>
              <div className="pathGrid">
                <article className={`pathCard ${pendingEvolution === 1 ? "selected" : ""}`}>
                  <img src={veyraPreviewArt} alt="Veyra evolution preview" />
                  <span>PATH 01 · HARMONY</span><h3>Veyra</h3><p>Graceful, intuitive and fluid. Arc energy becomes part of movement.</p>
                  <strong>Ascended target: Veyrion</strong>
                  <button onClick={() => setPendingEvolution(1)} disabled={!evolutionUnlocked || status === "evolution"}>{evolutionUnlocked ? "Preview Veyra path" : "Locked until 1,000 XP"}</button>
                </article>
                <article className={`pathCard ${pendingEvolution === 2 ? "selected" : ""}`}>
                  <img src={vexusPreviewArt} alt="Vexus evolution preview" />
                  <span>PATH 02 · RIFT</span><h3>Vexus</h3><p>Fierce, instinctive and powerful. Rift energy reshapes its hunting form.</p>
                  <strong>Ascended target: Vexaris</strong>
                  <button onClick={() => setPendingEvolution(2)} disabled={!evolutionUnlocked || status === "evolution"}>{evolutionUnlocked ? "Preview Vexus path" : "Locked until 1,000 XP"}</button>
                </article>
              </div>
              {pendingEvolution !== 0 && (
                <div className="evolutionConfirm">
                  <div><span>PERMANENT ONCHAIN CHOICE</span><strong>Awaken {pendingEvolution === 1 ? "Veyra" : "Vexus"}?</strong><p>This path cannot be changed after the transaction is confirmed.</p></div>
                  <div className="confirmActions"><button className="secondaryButton" onClick={() => setPendingEvolution(0)} disabled={status === "evolution"}>Cancel</button><button onClick={() => chooseEvolution(pendingEvolution as 1 | 2)} disabled={status === "evolution"}>{status === "evolution" ? "Awakening on Arc…" : `Choose ${pendingEvolution === 1 ? "Veyra" : "Vexus"}`}</button></div>
                </div>
              )}
            </>
          ) : (
            <div className="chosenEvolution">
              <div><span>CURRENT FORM</span><strong>{evolvedName}</strong><p>Your permanent evolution path is stored on Arc.</p></div>
              <div><span>ASCENDED DESTINY</span><strong>{ascendedName}</strong><p>{ascendedReached ? "The 100-day milestone is complete. Ascended presentation is ready for a future visual release." : "Reach the 100-day milestone to unlock the Ascended chapter. Its full form remains concealed until then."}</p></div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
