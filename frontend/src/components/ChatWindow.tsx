"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useWeb3 } from '../context/Web3Context';
import { FaPaperPlane } from 'react-icons/fa';

const ChatWindow: React.FC = () => {
  const { account } = useWeb3();
  const {
    selectedChat,
    selectedGroup,
    messages,
    sendMessage,
    sendGroupMessage,
    userGroups,
    isSending,
  } = useChat();

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      if (selectedChat) {
        await sendMessage(selectedChat, messageText);
      } else if (selectedGroup !== null) {
        await sendGroupMessage(selectedGroup, messageText);
      }
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGroupName = () => {
    if (selectedGroup !== null) {
      const group = userGroups.find((g) => g.groupId === selectedGroup);
      return group?.group.name || 'Unknown Group';
    }
    return '';
  };

  if (!selectedChat && selectedGroup === null) {
    return (
      <div className="flex-1 glass-dark flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div className="text-7xl md:text-8xl animate-float">💬</div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyber-blue rounded-full neon-cyan animate-pulse"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 holographic">Welcome to Blockchain WhatsApp</h2>
          <p className="text-gray-400 mb-8">Select a chat or group to start messaging</p>
          <div className="space-y-3 text-sm">
            <div className="glass p-3 rounded-xl border border-white/5 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-green">
                ⚡
              </div>
              <span className="text-gray-300">All transactions are gasless</span>
            </div>
            <div className="glass p-3 rounded-xl border border-white/5 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-cyan">
                🔗
              </div>
              <span className="text-gray-300">Messages stored on Sepolia blockchain</span>
            </div>
            <div className="glass p-3 rounded-xl border border-white/5 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-cyber rounded-lg flex items-center justify-center neon-purple">
                🛡️
              </div>
              <span className="text-gray-300">Decentralized and censorship-resistant</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col glass-dark">
      {/* Chat Header */}
      <div className="glass-dark px-4 md:px-6 py-4 border-b border-white/10 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold neon-green">
              {selectedChat
                ? selectedChat.slice(2, 4).toUpperCase()
                : selectedGroup !== null
                ? '👥'
                : '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-green rounded-full border-2 border-cyber-dark animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold text-base md:text-lg">
              {selectedChat
                ? formatAddress(selectedChat)
                : selectedGroup !== null
                ? getGroupName()
                : 'Unknown'}
            </h2>
            <p className="text-xs md:text-sm text-cyan-400 flex items-center space-x-1">
              <span>{selectedChat ? '💬 Direct Message' : '👥 Group Chat'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-cyber">
        {messages.length === 0 ? (
          <div className="text-center mt-10">
            <div className="text-5xl mb-4 opacity-50 animate-pulse">💬</div>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-xs text-gray-500 mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.sender.toLowerCase() === account?.toLowerCase();
            return (
              <div
                key={index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-md md:max-w-lg px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isOwn
                      ? 'bg-gradient-cyber text-white neon-cyan shadow-lg'
                      : 'glass-dark text-white border border-white/10 hover:border-cyber-blue/30'
                  }`}
                >
                  {!isOwn && selectedGroup !== null && (
                    <p className="text-xs text-cyan-400 mb-1 font-medium">{formatAddress(msg.sender)}</p>
                  )}
                  <p className="break-words text-sm md:text-base">{msg.content}</p>
                  <p className={`text-xs mt-2 text-right ${isOwn ? 'text-gray-200' : 'text-gray-400'}`}>
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="glass-dark px-4 md:px-6 py-4 border-t border-white/10 backdrop-blur-xl">
        <div className="flex space-x-2 md:space-x-4">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={isSending ? "Sending..." : "Type a message..."}
            className="flex-1 glass text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyber-blue border border-white/10 transition-all disabled:opacity-50 text-sm md:text-base"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="futuristic-btn px-4 md:px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm md:text-base shadow-lg"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span className="hidden sm:inline">Send (Gasless)</span>
              </>
            )}
          </button>
        </div>
        <div className="text-xs text-center mt-3">
          {isSending ? (
            <p className="text-cyan-400 animate-pulse flex items-center justify-center space-x-2">
              <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
              <span>Processing gasless transaction...</span>
            </p>
          ) : (
            <p className="text-gray-500">
              <span className="text-cyber-green">⚡ No gas fees</span>
              <span className="mx-2">•</span>
              <span className="text-cyber-blue">🔗 On-chain storage</span>
              <span className="mx-2">•</span>
              <span className="text-cyber-purple">🚀 Instant delivery</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
