"use client";

import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { FaUser, FaBolt, FaRocket } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const RegisterUser: React.FC = () => {
  const { registerUser, isRegistering } = useChat();
  const [name, setName] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await registerUser(name);
      setName('');
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div className="min-h-screen gradient-bg cyber-grid flex items-center justify-center p-4">
      {/* Loading Overlay */}
      {isRegistering && (
        <LoadingSpinner
          fullScreen
          size="xl"
          message="Creating your account"
        />
      )}

      {/* Registration Card */}
      <div className="glass-dark rounded-2xl p-6 md:p-10 max-w-md w-full border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="text-6xl md:text-7xl mb-4 animate-float">💬</div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-green rounded-full neon-green animate-pulse"></div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="holographic">Welcome!</span>
          </h1>

          <p className="text-gray-400 text-sm md:text-base">
            Join the future of decentralized messaging
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2 flex items-center space-x-2">
              <FaUser />
              <span>Your Name</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-cyber-blue" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full glass text-white pl-12 pr-4 py-3 md:py-4 rounded-xl outline-none focus:ring-2 focus:ring-cyber-blue border border-white/10 transition-all"
                required
                disabled={isRegistering}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegistering || !name.trim()}
            className="w-full futuristic-btn py-3 md:py-4 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              {isRegistering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <FaRocket />
                  <span>Register (Gasless)</span>
                  <FaBolt className="animate-pulse" />
                </>
              )}
            </div>
          </button>
        </form>

        {/* Features List */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center space-x-3 glass p-3 rounded-lg border border-white/5">
            <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-cyan">
              <FaBolt className="text-sm" />
            </div>
            <span className="text-sm text-gray-300">No gas fees - completely free!</span>
          </div>

          <div className="flex items-center space-x-3 glass p-3 rounded-lg border border-white/5">
            <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-green">
              <FaUser className="text-sm" />
            </div>
            <span className="text-sm text-gray-300">Wallet-based identity</span>
          </div>

          <div className="flex items-center space-x-3 glass p-3 rounded-lg border border-white/5">
            <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-purple">
              <FaRocket className="text-sm" />
            </div>
            <span className="text-sm text-gray-300">Start chatting instantly</span>
          </div>
        </div>

        {/* Tech Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by <span className="text-cyber-blue">Sepolia</span> •
            Secured by <span className="text-cyber-purple">Blockchain</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
