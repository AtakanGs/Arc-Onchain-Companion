"use client";

import { useMemo, useState } from "react";
import { AppKit, type SwapParams } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

const ARC_CHAIN_ID_HEX = "0x4CEF52";
const kit = new AppKit();

type Estimate = {
  estimatedOutput?: { amount?: string; token?: string };
  stopLimit?: { amount?: string; token?: string };
  fees?: Array<{ token?: string; amount?: string; type?: string }>;
};

type SwapResult = {
  txHash?: string;
  explorerUrl?: string;
  amountOut?: string;
  progress?: { status?: string; substatus?: string; substatusMessage?: string };
};

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

function errorMessage(cause: unknown) {
  return cause instanceof Error ? cause.message : "The Arc Testnet swap could not be completed.";
}

export default function ArcSwapQuestPage() {
  const [amount, setAmount] = useState("1.00");
  const [slippageBps, setSlippageBps] = useState(100);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [result, setResult] = useState<SwapResult | null>(null);
  const [status, setStatus] = useState<"idle" | "estimating" | "swapping" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const validAmount = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 100;
  }, [amount]);

  async function adapterAndParams() {
    if (!window.ethereum) throw new Error("No injected EVM wallet was found.");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_CHAIN_ID_HEX }] });

    const adapter = await createViemAdapterFromProvider({ provider: window.ethereum });
    const params: SwapParams = {
      from: { adapter, chain: "Arc_Testnet" },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: amount,
      config: { slippageBps },
    };
    return params;
  }

  async function getEstimate() {
    if (!validAmount) return;
    try {
      setStatus("estimating");
      setMessage("");
      setResult(null);
      const params = await adapterAndParams();
      const nextEstimate = await kit.estimateSwap(params);
      setEstimate(nextEstimate as Estimate);
      setStatus("idle");
    } catch (cause) {
      setStatus("error");
      setMessage(errorMessage(cause));
    }
  }

  async function executeSwap() {
    if (!estimate || !validAmount) return;
    try {
      setStatus("swapping");
      setMessage("");
      const params = await adapterAndParams();
      const nextResult = await kit.swap(params) as SwapResult;
      const completed = nextResult.progress?.status === "DONE" || nextResult.progress?.substatus === "COMPLETED";
      if (!nextResult.txHash || !completed) throw new Error(nextResult.progress?.substatusMessage || "Swap returned without a verified completed transaction.");
      setResult(nextResult);
      setStatus("done");
      window.localStorage.setItem(`arc-companion:swap-quest:${nextResult.txHash}`, "verified");
    } catch (cause) {
      setStatus("error");
      setMessage(errorMessage(cause));
    }
  }

  return (
    <main className="shell">
      <nav className="nav"><strong>ARC COMPANION</strong><span className="network">ARC SWAP QUEST · TESTNET</span></nav>
      <section className="homeEmpty" style={{ maxWidth: 780 }}>
        <p className="eyebrow">REAL ONCHAIN QUEST</p>
        <h1>Swap USDC to EURC.</h1>
        <p className="lede">This quest uses Circle App Kit with your injected browser wallet. It first requests a live Arc Testnet estimate; the swap button stays unavailable until a quote exists.</p>

        <div className="statsGrid" style={{ marginTop: 28 }}>
          <label><span>AMOUNT IN · USDC</span><input value={amount} onChange={(event) => { setAmount(event.target.value); setEstimate(null); }} inputMode="decimal" /></label>
          <label><span>SLIPPAGE</span><select value={slippageBps} onChange={(event) => { setSlippageBps(Number(event.target.value)); setEstimate(null); }}><option value={50}>0.5%</option><option value={100}>1.0%</option><option value={200}>2.0%</option><option value={300}>3.0%</option></select></label>
        </div>

        <button onClick={getEstimate} disabled={!validAmount || status === "estimating" || status === "swapping"}>{status === "estimating" ? "Getting live quote…" : "Get live quote"}</button>

        {estimate && (
          <div className="chosenEvolution" style={{ marginTop: 24 }}>
            <div><span>ESTIMATED OUTPUT</span><strong>{estimate.estimatedOutput?.amount ?? "—"} {estimate.estimatedOutput?.token ?? "EURC"}</strong><p>Quoted by Circle App Kit on Arc Testnet.</p></div>
            <div><span>MINIMUM / STOP LIMIT</span><strong>{estimate.stopLimit?.amount ?? "SDK protected"} {estimate.stopLimit?.token ?? "EURC"}</strong><p>{slippageBps / 100}% slippage tolerance.</p></div>
          </div>
        )}

        {estimate && !result && <button onClick={executeSwap} disabled={status === "swapping"}>{status === "swapping" ? "Confirm in wallet…" : `Swap ${amount} USDC → EURC`}</button>}

        {result && (
          <div className="evolutionConfirm" style={{ marginTop: 24 }}>
            <div><span>QUEST VERIFIED</span><strong>{result.amountOut ?? estimate?.estimatedOutput?.amount ?? "—"} EURC received</strong><p>The App Kit result reported a completed Arc Testnet transaction.</p></div>
            {result.explorerUrl && <a className="textLink" href={result.explorerUrl} target="_blank" rel="noreferrer">Verify on ArcScan ↗</a>}
          </div>
        )}

        {message && <p className="errorText">{message}</p>}
        <p className="micro">Arc Testnet liquidity can be unstable. Review the live quote before signing. This page never simulates success: quest completion requires a returned transaction hash and completed App Kit status.</p>
        <a className="textLink" href="/home">Return to Companion Home</a>
      </section>
    </main>
  );
}
