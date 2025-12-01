"use client";

import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useWeb3 } from '../context/Web3Context';
import { FaUserFriends, FaUsers, FaPlus, FaSearch } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { account } = useWeb3();
  const {
    userChats,
    userGroups,
    selectChat,
    selectGroup,
    selectedChat,
    selectedGroup,
    allUsers,
    loadAllUsers,
  } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'groups'>('chats');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getOtherUser = (chat: any) => {
    return chat.user1.toLowerCase() === account?.toLowerCase() ? chat.user2 : chat.user1;
  };

  const handleNewChat = () => {
    setShowNewChat(true);
    loadAllUsers();
  };

  return (
    <div className="w-96 glass-dark border-r border-white/10 flex flex-col">
      {/* Tabs */}
      <div className="flex glass border-b border-white/5">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-4 flex items-center justify-center space-x-2 transition-all duration-300 ${
            activeTab === 'chats'
              ? 'bg-gradient-cyber text-white neon-cyan font-semibold'
              : 'text-gray-400 hover:text-cyber-blue'
          }`}
        >
          <FaUserFriends className={activeTab === 'chats' ? 'animate-pulse' : ''} />
          <span>Chats ({userChats.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-4 flex items-center justify-center space-x-2 transition-all duration-300 ${
            activeTab === 'groups'
              ? 'bg-gradient-cyber text-white neon-cyan font-semibold'
              : 'text-gray-400 hover:text-cyber-purple'
          }`}
        >
          <FaUsers className={activeTab === 'groups' ? 'animate-pulse' : ''} />
          <span>Groups ({userGroups.length})</span>
        </button>
      </div>

      {/* Search and New Chat */}
      <div className="p-4 glass border-b border-white/5">
        <div className="flex space-x-2">
          <div className="flex-1 glass-dark rounded-xl px-4 py-3 flex items-center space-x-2 border border-white/10 focus-within:border-cyber-blue transition-all">
            <FaSearch className="text-cyber-blue" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent flex-1 outline-none text-white placeholder:text-gray-500"
            />
          </div>
          <button
            onClick={handleNewChat}
            className="bg-gradient-cyber hover:shadow-lg hover:shadow-cyber-blue/50 p-3 rounded-xl transition-all duration-300 neon-cyan transform hover:scale-105"
            title="New Chat"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Chat/Group List */}
      <div className="flex-1 overflow-y-auto scrollbar-cyber">
        {activeTab === 'chats' ? (
          userChats.length > 0 ? (
            userChats.map(({ chat, chatId }) => {
              const otherUser = getOtherUser(chat);
              return (
                <div
                  key={chatId}
                  onClick={() => selectChat(otherUser)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                    selectedChat === otherUser
                      ? 'glass-dark neon-cyan border-l-4 border-l-cyber-blue'
                      : 'hover:glass hover:border-l-4 hover:border-l-cyber-purple/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold text-lg neon-green">
                        {otherUser.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-green rounded-full border-2 border-cyber-dark animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{formatAddress(otherUser)}</h3>
                      <p className="text-xs text-gray-400 flex items-center space-x-1">
                        <span className="text-cyber-blue">💬</span>
                        <span>{Number(chat.messageCount)} message(s)</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4 opacity-50">💬</div>
              <p className="text-gray-400 font-medium">No chats yet</p>
              <p className="text-xs text-gray-500 mt-2">Click + to start a new chat</p>
            </div>
          )
        ) : userGroups.length > 0 ? (
          userGroups.map(({ group, groupId }) => (
            <div
              key={groupId}
              onClick={() => selectGroup(groupId)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
                selectedGroup === groupId
                  ? 'glass-dark neon-purple border-l-4 border-l-cyber-purple'
                  : 'hover:glass hover:border-l-4 hover:border-l-cyber-blue/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-cyber rounded-full flex items-center justify-center text-white text-2xl neon-purple">
                  👥
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{group.name}</h3>
                  <p className="text-xs text-gray-400">
                    <span className="text-cyber-purple">{group.members.length} members</span>
                    <span className="mx-1">•</span>
                    <span className="text-cyber-blue">{Number(group.messageCount)} message(s)</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4 opacity-50">👥</div>
            <p className="text-gray-400 font-medium">No groups yet</p>
            <p className="text-xs text-gray-500 mt-2">Create a group to get started</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-dark rounded-2xl p-6 w-96 max-h-[500px] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold holographic">Select User</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-cyber">
              {allUsers
                .filter((user) => user.userAddress.toLowerCase() !== account?.toLowerCase())
                .map((user) => (
                  <div
                    key={user.userAddress}
                    onClick={() => {
                      selectChat(user.userAddress);
                      setShowNewChat(false);
                    }}
                    className="p-3 glass hover:glass-dark hover:neon-cyan rounded-xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-cyber-blue/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold neon-green">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-400">{formatAddress(user.userAddress)}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setShowNewChat(false)}
              className="mt-4 w-full glass hover:glass-dark text-white py-3 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
