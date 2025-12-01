"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Import contract ABIs and addresses
import BlockchainWhatsAppABI from '../config/BlockchainWhatsApp.json';
import MinimalForwarderABI from '../config/MinimalForwarder.json';
import contractsConfig from '../config/contracts.json';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  contract: ethers.Contract | null;
  forwarder: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendGaslessTransaction: (functionName: string, args: any[]) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [forwarder, setForwarder] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const SEPOLIA_CHAIN_ID = 11155111;

  // Initialize contracts
  const initializeContracts = async (provider: ethers.BrowserProvider, signer: ethers.Signer) => {
    try {
      const whatsappContract = new ethers.Contract(
        contractsConfig.contracts.BlockchainWhatsApp,
        BlockchainWhatsAppABI,
        signer
      );

      const forwarderContract = new ethers.Contract(
        contractsConfig.contracts.MinimalForwarder,
        MinimalForwarderABI,
        signer
      );

      setContract(whatsappContract);
      setForwarder(forwarderContract);
    } catch (error) {
      console.error("Error initializing contracts:", error);
      toast.error("Failed to initialize contracts");
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    setIsLoading(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      // Check if on Sepolia
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            toast.error("Please add Sepolia network to MetaMask");
          }
          throw switchError;
        }
      }

      const web3Signer = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(SEPOLIA_CHAIN_ID);
      setIsConnected(true);

      await initializeContracts(web3Provider, web3Signer);

      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setForwarder(null);
    setIsConnected(false);
    toast.success("Wallet disconnected");
  };

  // Send gasless transaction using ERC-2771
  const sendGaslessTransaction = async (functionName: string, args: any[]) => {
    if (!contract || !forwarder || !signer || !account) {
      toast.error("Please connect your wallet first");
      throw new Error("Wallet not connected");
    }

    try {
      // Get the function signature
      const functionFragment = contract.interface.getFunction(functionName);
      if (!functionFragment) {
        throw new Error(`Function ${functionName} not found`);
      }

      // Encode the function call
      const data = contract.interface.encodeFunctionData(functionName, args);

      // Get nonce from forwarder
      const nonce = await forwarder.getNonce(account);

      // Create the forward request (convert BigInt to Number for JSON serialization)
      const request = {
        from: account,
        to: await contract.getAddress(),
        value: 0,
        gas: 1000000,
        nonce: Number(nonce), // Convert BigInt to Number
        data: data,
      };

      // Create EIP-712 domain
      const domain = {
        name: 'MinimalForwarder',
        version: '0.0.1',
        chainId: chainId,
        verifyingContract: await forwarder.getAddress(),
      };

      const types = {
        ForwardRequest: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'gas', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      };

      // Sign the request (USER ONLY SIGNS - NO GAS!)
      const signature = await signer.signTypedData(domain, types, request);

      // Send to relayer service (DEVELOPER PAYS GAS)
      const relayerUrl = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3001';
      const response = await fetch(`${relayerUrl}/relay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request, signature }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Relayer failed to execute transaction');
      }

      const result = await response.json();

      // Return mock receipt-like object
      return {
        hash: result.txHash,
        gasUsed: result.gasUsed,
        status: 1,
      };
    } catch (error: any) {
      console.error("Gasless transaction error:", error);
      throw error;
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          toast("Account changed");
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const value = {
    account,
    chainId,
    contract,
    forwarder,
    provider,
    signer,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    sendGaslessTransaction,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
