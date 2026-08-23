"use client";

import { useState } from "react";

export default function Home() {
  const [connected, setConnected] = useState(false);

  async function connect() {
    const ethereum = (window as Window & { ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown> } }).ethereum;
    if (!ethereum) {
      alert("No injected wallet found. Install or open a compatible wallet.");
      return;
    }

    await ethereum.request({ method: "eth_requestAccounts" });
    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x4cef52" }] });
    } catch {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x4cef52",
          chainName: "Arc Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: ["https://rpc.testnet.arc.io"],
          blockExplorerUrls: ["https://testnet.arcscan.app"],
        }],
      });
    }

    setConnected(true);
  }

  return (
    <main className="shell">
      <nav className="nav"><strong>ARC COMPANION</strong><span className="network">Arc Testnet</span></nav>
      <section className="hero">
        <div className="copy">
          <p className="eyebrow">YOUR ARC JOURNEY, BROUGHT TO LIFE</p>
          <h1>Meet the companion shaped by your history.</h1>
          <p className="lede">Your first Arc activity marks their beginning. Your Web3 personality shapes who they are. What you do next shapes who they become.</p>
          <button onClick={connect}>{connected ? "Wallet connected" : "Discover my companion"}</button>
          <p className="micro">Built on Arc Testnet · Daily state lives onchain</p>
        </div>
        <div className="companionCard" aria-label="Companion visual placeholder">
          <div className="orb" />
          <div className="placeholderBody"><div className="ear left" /><div className="ear right" /><div className="face"><span className="eye" /><span className="eye" /></div></div>
          <div className="cardMeta"><span>GENESIS FORM</span><strong>Your companion is waiting.</strong></div>
        </div>
      </section>
      <section className="principles">
        <article><strong>01</strong><span>History</span><p>Your Arc beginning becomes part of the companion.</p></article>
        <article><strong>02</strong><span>Care</span><p>A short daily moment becomes one persistent onchain update.</p></article>
        <article><strong>03</strong><span>Growth</span><p>Streaks, choices and Arc achievements change the visual identity.</p></article>
      </section>
    </main>
  );
}
