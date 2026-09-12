"use client";

import { useMemo, useState } from "react";
import { AppKit, type SwapParams } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";
import styles from "./swap.module.css";

const ARC_CHAIN_ID_HEX = "0x4CEF52";
const kit = new AppKit();
const SLIPPAGE_PRESETS = [0.5, 1, 2] as const;

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

function formatRate(amountIn: string, amountOut?: string) {
  const input = Number(amountIn);
  const output = Number(amountOut);
  if (!Number.isFinite(input) || input <= 0 || !Number.isFinite(output) || output <= 0) return "Available after quote";
  return `1 USDC = ${(output / input).toFixed(4)} EURC`;
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function ArcSwapQuestPage() {
  const [amount, setAmount] = useState("1.00");
  const [slippagePct, setSlippagePct] = useState("0.5");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [result, setResult] = useState<SwapResult | null>(null);
  const [status, setStatus] = useState<"idle" | "estimating" | "swapping" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const validAmount = useMemo(() => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 100;
  }, [amount]);

  const slippageValue = Number(slippagePct);
  const validSlippage = Number.isFinite(slippageValue) && slippageValue >= 0.1 && slippageValue <= 5;
  const slippageBps = validSlippage ? Math.round(slippageValue * 100) : 50;

  const outputAmount = estimate?.estimatedOutput?.amount;
  const outputToken = estimate?.estimatedOutput?.token ?? "EURC";
  const minimumAmount = estimate?.stopLimit?.amount;
  const minimumToken = estimate?.stopLimit?.token ?? "EURC";
  const rate = formatRate(amount, outputAmount);
  const feeSummary = estimate?.fees?.length
    ? estimate.fees.map((fee) => `${fee.amount ?? "—"} ${fee.token ?? ""}${fee.type ? ` · ${fee.type}` : ""}`).join(", ")
    : "Included in live quote";

  function resetQuote() {
    setEstimate(null);
    setResult(null);
    setMessage("");
    setStatus("idle");
  }

  function updateSlippage(value: string) {
    setSlippagePct(value);
    resetQuote();
  }

  async function adapterAndParams() {
    if (!window.ethereum) throw new Error("No injected EVM wallet was found.");
    if (!validSlippage) throw new Error("Set slippage between 0.1% and 5%.");
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
    if (!validAmount || !validSlippage) return;
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
    if (!estimate || !validAmount || !validSlippage) return;
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

      <section className={styles.page}>
        <div className={styles.intro}>
          <p className="eyebrow">REAL ONCHAIN QUEST</p>
          <h1>Swap USDC to EURC.</h1>
          <p className="lede">Use Circle App Kit on Arc Testnet to fetch a live quote and complete a real onchain swap. Nothing is simulated: the quest is verified only after App Kit returns a completed transaction and transaction hash.</p>
          <div className={styles.trustRow}>
            <span className={styles.trustPill}><i className={styles.trustDot} />Circle App Kit</span>
            <span className={styles.trustPill}>Arc Testnet</span>
            <span className={styles.trustPill}>Live quote required</span>
          </div>
          <a className={styles.backLink} href="/home">← Return to Companion Home</a>
        </div>

        <div className={styles.swapShell}>
          <div className={styles.swapHeader}>
            <div className={styles.swapHeaderTitle}>
              <strong>Swap Quest</strong>
              <span>USDC → EURC · Arc Testnet</span>
            </div>
            <span className={styles.headerBadge}>Stable pair</span>
          </div>

          <div className={styles.slippagePanel}>
            <div className={styles.slippageTopline}>
              <div>
                <strong>Slippage tolerance</strong>
                <span>0.5% is the default for this stable pair.</span>
              </div>
              <span className={styles.slippageCurrent}>{validSlippage ? `${formatPercent(slippageValue)}%` : "Invalid"}</span>
            </div>
            <div className={styles.slippageControls}>
              <div className={styles.slippagePresets}>
                {SLIPPAGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${styles.slippagePreset} ${slippageValue === preset ? styles.slippagePresetActive : ""}`}
                    onClick={() => updateSlippage(String(preset))}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              <label className={`${styles.customSlippage} ${!validSlippage ? styles.customSlippageInvalid : ""}`}>
                <span>Custom</span>
                <input
                  value={slippagePct}
                  onChange={(event) => updateSlippage(event.target.value)}
                  inputMode="decimal"
                  aria-label="Custom slippage percentage"
                  placeholder="0.5"
                />
                <b>%</b>
              </label>
            </div>
            {!validSlippage && <p className={styles.slippageError}>Enter a slippage value between 0.1% and 5%.</p>}
          </div>

          <div className={styles.tokenPanel}>
            <div className={styles.tokenTopline}><span>You pay</span><span>USDC</span></div>
            <div className={styles.tokenRow}>
              <input
                className={styles.amountInput}
                value={amount}
                onChange={(event) => { setAmount(event.target.value); resetQuote(); }}
                inputMode="decimal"
                aria-label="USDC amount to swap"
                placeholder="0.00"
              />
              <div className={styles.tokenPill}><i className={styles.tokenIcon}>$</i>USDC</div>
            </div>
          </div>

          <div className={styles.flowButton} aria-hidden="true">↓</div>

          <div className={styles.tokenPanel}>
            <div className={styles.tokenTopline}><span>You receive</span><span>Estimated</span></div>
            <div className={styles.tokenRow}>
              <div className={`${styles.receiveValue} ${!outputAmount ? styles.muted : ""}`}>{outputAmount ?? "—"}</div>
              <div className={styles.tokenPill}><i className={`${styles.tokenIcon} ${styles.tokenIconEurc}`}>€</i>{outputToken}</div>
            </div>
          </div>

          <div className={styles.quoteSection}>
            <div className={styles.quoteHeader}>
              <span>Live quote details</span>
              {estimate ? <span className={styles.statusReady}>Quote ready</span> : <span>Waiting for quote</span>}
            </div>
            <div className={styles.quoteGrid}>
              <div className={styles.quoteRow}><span>Rate</span><strong>{rate}</strong></div>
              <div className={styles.quoteRow}><span>Minimum received</span><strong>{minimumAmount ? `${minimumAmount} ${minimumToken}` : "Available after quote"}</strong></div>
              <div className={styles.quoteRow}><span>Slippage tolerance</span><strong>{validSlippage ? `${formatPercent(slippageValue)}%` : "Invalid"}</strong></div>
              <div className={styles.quoteRow}><span>Route</span><strong>Circle App Kit</strong></div>
              {estimate && <div className={styles.quoteRow}><span>Fees</span><strong>{feeSummary}</strong></div>}
            </div>
          </div>

          {!estimate && !result && (
            <button className={styles.primaryButton} onClick={getEstimate} disabled={!validAmount || !validSlippage || status === "estimating" || status === "swapping"}>
              {status === "estimating" ? "Fetching live quote…" : !validSlippage ? "Set valid slippage" : validAmount ? "Get live quote" : "Enter an amount"}
            </button>
          )}

          {estimate && !result && (
            <button className={styles.primaryButton} onClick={executeSwap} disabled={!validSlippage || status === "swapping"}>
              {status === "swapping" ? "Confirm in wallet…" : `Swap ${amount} USDC → ${outputToken}`}
            </button>
          )}

          {result && (
            <div className={styles.success}>
              <span>QUEST VERIFIED</span>
              <strong>{result.amountOut ?? outputAmount ?? "—"} EURC received</strong>
              {result.explorerUrl && <a href={result.explorerUrl} target="_blank" rel="noreferrer">Verify transaction on ArcScan ↗</a>}
            </div>
          )}

          {message && <div className={styles.error}>{message}</div>}
          <p className={styles.disclaimer}>Arc Testnet liquidity can vary. Always review the live output, minimum received and slippage before signing. Quest completion requires a returned transaction hash and completed App Kit status.</p>
        </div>
      </section>
    </main>
  );
}
