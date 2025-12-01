'use client'

import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { useChat } from '../context/ChatContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import RegisterUser from '../components/RegisterUser'
import GroupModal from '../components/GroupModal'
import { FaPlus } from 'react-icons/fa'

export default function Home() {
  const { isConnected, connectWallet } = useWeb3()
  const { currentUser, isLoadingUser } = useChat()
  const [showGroupModal, setShowGroupModal] = useState(false)

  // Show connect wallet screen
  if (!isConnected) {
    return (
      <div className="min-h-screen gradient-bg cyber-grid flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          {/* Animated Icon */}
          <div className="relative inline-block mb-8">
            <div className="text-8xl md:text-9xl animate-float">💬</div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyber-green rounded-full neon-green animate-pulse"></div>
            <div
              className="absolute -bottom-3 -left-3 w-6 h-6 bg-cyber-blue rounded-full neon-cyan animate-pulse"
              style={{ animationDelay: '0.5s' }}
            ></div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="holographic">Gasless Messaging DApp</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg mx-auto">
            The future of decentralized messaging with{' '}
            <span className="text-cyber-green font-semibold">gasless transactions</span> on Sepolia
          </p>

          {/* Connect Button */}
          <button
            onClick={connectWallet}
            className="futuristic-btn px-8 md:px-12 py-4 md:py-5 rounded-xl font-semibold text-lg md:text-xl text-white shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <span>Connect Wallet to Start</span>
              <span className="text-2xl">🚀</span>
            </div>
          </button>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-cyber-green font-semibold">No Gas Fees</p>
              <p className="text-gray-400 text-xs mt-1">Completely free for users</p>
            </div>
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="text-3xl mb-2">🔗</div>
              <p className="text-cyber-blue font-semibold">On-Chain Storage</p>
              <p className="text-gray-400 text-xs mt-1">Messages stored on blockchain</p>
            </div>
            <div className="glass p-4 rounded-xl border border-white/5">
              <div className="text-3xl mb-2">🛡️</div>
              <p className="text-cyber-purple font-semibold">Decentralized</p>
              <p className="text-gray-400 text-xs mt-1">Censorship-resistant</p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-8 text-xs text-gray-500">
            <p>
              Powered by <span className="text-cyber-blue">Sepolia</span> • Built with{' '}
              <span className="text-cyber-purple">ERC-2771</span> • Secured by{' '}
              <span className="text-cyber-green">Blockchain</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen gradient-bg cyber-grid">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            {/* Futuristic Spinner */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-cyber-blue border-r-cyber-purple animate-spin"></div>
              <div
                className="w-24 h-24 absolute inset-0 rounded-full border-4 border-transparent border-b-cyber-green animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
              ></div>
              <div className="w-24 h-24 absolute inset-0 rounded-full bg-gradient-cyber opacity-20 blur-md animate-pulse"></div>
            </div>
            <p className="text-white text-xl font-semibold animate-pulse">
              Loading your account...
            </p>
            <p className="text-cyan-400 text-sm mt-2">Connecting to blockchain</p>
          </div>
        </div>
      </div>
    )
  }

  // Show registration screen if user not registered
  if (!currentUser) {
    return <RegisterUser />
  }

  // Main app
  return (
    <div className="h-screen flex flex-col bg-cyber-dark">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>

      {/* Floating Create Group Button */}
      <button
        onClick={() => setShowGroupModal(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-cyber text-white p-4 md:p-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 neon-purple z-40 group"
        title="Create Group"
      >
        <FaPlus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Group Modal */}
      <GroupModal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} />
    </div>
  )
}
