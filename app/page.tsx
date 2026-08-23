"use client";

import { useMemo, useState } from "react";
import { keccak256, toHex } from "viem";
import { ARCHETYPES, FAMILIES } from "../lib/companion";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

type Option = { label: string; archetype: number };
type Question = { title: string; options: Option[] };
type BirthState = { status: "idle" | "loading" | "found" | "new" | "unavailable"; timestamp?: number };

const QUESTIONS: Question[] = [
  {
    title: "You arrive early in a new ecosystem. What do you do first?",
    options: [
      { label: "Open the docs and start building", archetype: 0 },
      { label: "Try every app I can find", archetype: 1 },
      { label: "Look for the story worth sharing", archetype: 2 },
    ],
  },
  {
    title: "Which Web3 room pulls you in fastest?",
    options: [
      { label: "Hackathon", archetype: 0 },
      { label: "Community meetup", archetype: 3 },
      { label: "Research / technical AMA", archetype: 4 },
    ],
  },
  {
    title: "What makes an ecosystem memorable?",
    options: [
      { label: "Things I discovered before everyone else", archetype: 1 },
      { label: "People I met and helped", archetype: 3 },
      { label: "Ideas I turned into something visible", archetype: 2 },
    ],
  },
  {
    title: "A new protocol launches tonight. Your instinct is to…",
    options: [
      { label: "Understand how it works first", archetype: 4 },
      { label: "Test the limits", archetype: 5 },
      { label: "Build something on top of it", archetype: 0 },
    ],
  },
  {
    title: "What keeps you coming back?",
    options: [
      { label: "Discovery", archetype: 1 },
      { label: "Creating", archetype: 2 },
      { label: "Challenge", archetype: 5 },
    ],
  },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatBirthDate(timestamp?: number) {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(timestamp * 1000));
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [step, setStep] = useState<"landing" | "quiz" | "reveal">("landing");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [birth, setBirth] = useState<BirthState>({ status: "idle" });
  const [error, setError] = useState("");

  const result = useMemo(() => {
    if (!address || answers.length !== QUESTIONS.length) return null;
    const counts = ARCHETYPES.map((_, index) => answers.filter((answer) => answer === index).length);
    const archetypeIndex = counts.reduce((best, count, index) => count > counts[best] ? index : best, 0);
    const dna = keccak256(toHex(address.toLowerCase()));
    const familyIndex = Number(BigInt(dna) % 3n);
    return { archetype: ARCHETYPES[archetypeIndex], family: FAMILIES[familyIndex], dna };
  }, [address, answers]);

  async function resolveBirth(walletAddress: string) {
    setBirth({ status: "loading" });
    try {
      const response = await fetch(`/api/arc-birth?address=${encodeURIComponent(walletAddress)}`);
      const payload = await response.json() as { bornOnArc?: number | null; available?: boolean };
      if (payload.bornOnArc) {
        setBirth({ status: "found", timestamp: payload.bornOnArc });
      } else if (payload.available) {
        setBirth({ status: "new" });
      } else {
        setBirth({ status: "unavailable" });
      }
    } catch {
      setBirth({ status: "unavailable" });
    }
  }

  async function connect() {
    setError("");
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!ethereum) {
      setError("No injected wallet found. Open the app in a compatible wallet or install one first.");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts[0]) throw new Error("No wallet account returned");

      try {
        await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x4cef52" }] });
      } catch {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x4cef52",
            chainName: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
            rpcUrls: ["https://rpc.testnet.arc.network"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          }],
        });
      }

      setAddress(accounts[0]);
      setStep("quiz");
      void resolveBirth(accounts[0]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wallet connection was cancelled.");
    }
  }

  function answer(archetype: number) {
    const nextAnswers = [...answers, archetype];
    setAnswers(nextAnswers);
    if (questionIndex === QUESTIONS.length - 1) {
      setStep("reveal");
    } else {
      setQuestionIndex((current) => current + 1);
    }
  }

  function restartQuiz() {
    setAnswers([]);
    setQuestionIndex(0);
    setStep("quiz");
  }

  function birthLabel() {
    if (birth.status === "loading") return "Finding your beginning…";
    if (birth.status === "found") return formatBirthDate(birth.timestamp);
    if (birth.status === "new") return "Your adoption will mark day one";
    if (birth.status === "unavailable") return "History temporarily unavailable";
    return "Not resolved yet";
  }

  return (
    <main className="shell">
      <nav className="nav">
        <strong>ARC COMPANION</strong>
        {address ? <span className="network">{shortAddress(address)} · Arc Testnet</span> : <span className="network">Arc Testnet</span>}
      </nav>

      {step === "landing" && (
        <section className="hero">
          <div className="copy">
            <p className="eyebrow">YOUR ARC JOURNEY, BROUGHT TO LIFE</p>
            <h1>Meet the companion shaped by your history.</h1>
            <p className="lede">Your first Arc activity marks their beginning. Your Web3 personality shapes who they are. What you do next shapes who they become.</p>
            <button onClick={connect}>Discover my companion</button>
            {error && <p className="errorText">{error}</p>}
            <p className="micro">Built on Arc Testnet · Daily state lives onchain</p>
          </div>
          <CompanionVisual label="Your companion is waiting." />
        </section>
      )}

      {step === "quiz" && (
        <section className="onboarding">
          <div className="quizPanel">
            <div className="quizTopline"><span>WEB3 PERSONALITY</span><span>{questionIndex + 1} / {QUESTIONS.length}</span></div>
            <div className="progress"><i style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} /></div>
            <h2>{QUESTIONS[questionIndex].title}</h2>
            <div className="optionGrid">
              {QUESTIONS[questionIndex].options.map((option) => (
                <button className="optionButton" key={option.label} onClick={() => answer(option.archetype)}>{option.label}</button>
              ))}
            </div>
            <p className="micro">No answer gives you an advantage. It only shapes your companion&apos;s genesis identity.</p>
          </div>
          <CompanionVisual label={birth.status === "loading" ? "Finding your Arc beginning…" : "Reading your signal…"} />
        </section>
      )}

      {step === "reveal" && result && (
        <section className="onboarding revealSection">
          <div className="quizPanel revealCopy">
            <p className="eyebrow">GENESIS SIGNAL FOUND</p>
            <h2>Meet your {result.family}.</h2>
            <p className="lede">Your answers point to a <strong>{result.archetype}</strong> nature. Your wallet deterministically selected the {result.family} family.</p>
            <div className="genesisFacts">
              <div><span>ARCHETYPE</span><strong>{result.archetype}</strong></div>
              <div><span>FAMILY</span><strong>{result.family}</strong></div>
              <div><span>BORN ON ARC</span><strong>{birthLabel()}</strong></div>
            </div>
            {birth.status === "unavailable" && <p className="micro">We never invent an Arc birth date. If the explorer history service is unavailable, you can retry later and the app will keep the value unset.</p>}
            {birth.status === "new" && <p className="micro">No prior Arc transaction was found. When you mint your companion, that first Arc moment becomes its beginning.</p>}
            <button onClick={restartQuiz}>Retake personality</button>
          </div>
          <CompanionVisual label={`${result.family} · ${result.archetype}`} active />
        </section>
      )}

      <section className="principles">
        <article><strong>01</strong><span>History</span><p>Your real Arc beginning becomes part of the companion.</p></article>
        <article><strong>02</strong><span>Care</span><p>A short daily moment becomes one persistent onchain update.</p></article>
        <article><strong>03</strong><span>Growth</span><p>Streaks, choices and Arc achievements change the visual identity.</p></article>
      </section>
    </main>
  );
}

function CompanionVisual({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className={`companionCard ${active ? "active" : ""}`} aria-label="Companion visual prototype">
      <div className="orb" />
      <div className="placeholderBody">
        <div className="ear left" /><div className="ear right" />
        <div className="face"><span className="eye" /><span className="eye" /></div>
      </div>
      <div className="cardMeta"><span>GENESIS FORM</span><strong>{label}</strong></div>
    </div>
  );
}
