"use client";

import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useChat } from '../context/ChatContext';
import { FaWallet, FaUser, FaBolt } from 'react-icons/fa';

const Header: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const { currentUser } = useChat();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="glass-dark border-b border-white/10 px-4 md:px-6 py-4 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="relative">
            <div className="text-3xl md:text-4xl animate-float">💬</div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-green rounded-full neon-green animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold holographic">
              Blockchain WhatsApp
            </h1>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-cyan-400">
              <FaBolt className="animate-pulse" />
              <span className="hidden sm:inline">Gasless Messaging • </span>
              <span className="text-cyber-blue">Sepolia</span>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {isConnected && currentUser ? (
            <>
              <div className="hidden md:flex items-center space-x-2 glass px-4 py-2 rounded-xl border border-cyber-blue/30">
                <div className="w-8 h-8 bg-gradient-cyber rounded-full flex items-center justify-center neon-cyan">
                  <FaUser className="text-sm" />
                </div>
                <span className="font-medium text-sm">{currentUser.name}</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="glass hover:glass-dark px-3 md:px-4 py-2 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/60 group"
              >
                <div className="flex items-center space-x-2">
                  <FaWallet className="text-red-400 group-hover:animate-pulse" />
                  <span className="text-xs md:text-sm hidden sm:inline">{formatAddress(account!)}</span>
                </div>
              </button>
            </>
          ) : isConnected ? (
            <button
              onClick={disconnectWallet}
              className="glass hover:glass-dark px-3 md:px-4 py-2 rounded-xl transition-all duration-300 border border-red-500/30"
            >
              <div className="flex items-center space-x-2">
                <FaWallet className="text-red-400" />
                <span className="text-xs md:text-sm">{formatAddress(account!)}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="futuristic-btn px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base text-white shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <FaWallet className="text-lg" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
