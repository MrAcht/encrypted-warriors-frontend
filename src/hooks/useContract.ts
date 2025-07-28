import { useMemo } from "react";
import { ethers } from "ethers";
import abi from "../abi/EncryptedWarriors.json";

export function useContract(provider: ethers.providers.Web3Provider | null, contractAddress: string) {
  return useMemo(() => {
    if (!provider || !contractAddress) return null;
    const signer = provider.getSigner();
    // The full artifact is an object, but ethers.Contract needs only the abi array.
    return new ethers.Contract(contractAddress, abi.abi, signer);
  }, [provider, contractAddress]);
} 