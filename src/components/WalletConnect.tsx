import React from "react";
import { ethers } from "ethers";

// Add this block to declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletConnect({ onConnect, account, onError }: { onConnect: (provider: ethers.providers.Web3Provider, account: string) => void, account: string | null, onError?: (error: string) => void }) {
  async function connect() {
    if (!window.ethereum) {
      const msg = "MetaMask is not installed. Please install MetaMask and try again.";
      if (onError) onError(msg);
      else alert(msg);
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      onConnect(provider, address);
    } catch (err: any) {
      const msg = err?.message || "Failed to connect to MetaMask";
      if (onError) onError(msg);
      else alert(msg);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!account && (
        <button className="btn btn-primary" onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
} 