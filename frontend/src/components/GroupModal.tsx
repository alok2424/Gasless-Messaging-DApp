"use client";

import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useWeb3 } from '../context/Web3Context';
import { FaTimes, FaUsers, FaBolt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose }) => {
  const { account } = useWeb3();
  const { createGroup, allUsers, loadAllUsers } = useChat();

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const handleToggleMember = (address: string) => {
    if (selectedMembers.includes(address)) {
      setSelectedMembers(selectedMembers.filter((a) => a !== address));
    } else {
      setSelectedMembers([...selectedMembers, address]);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;

    setIsLoading(true);
    try {
      await createGroup(groupName, selectedMembers);
      setGroupName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingSpinner
          fullScreen
          size="xl"
          message="Creating your group"
        />
      )}

      <div className="glass-dark rounded-2xl p-6 md:p-8 w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-cyber border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-cyber rounded-xl flex items-center justify-center neon-purple">
              <FaUsers className="text-xl" />
            </div>
            <h2 className="text-2xl font-bold holographic">Create Group</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:rotate-90"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="space-y-6">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2 flex items-center space-x-2">
              <FaUsers />
              <span>Group Name</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full glass text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyber-purple border border-white/10 transition-all"
              required
              disabled={isLoading}
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Select Members ({selectedMembers.length} selected)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto glass-dark rounded-xl p-2 border border-white/5 scrollbar-cyber">
              {allUsers
                .filter((user) => user.userAddress.toLowerCase() !== account?.toLowerCase())
                .map((user) => (
                  <div
                    key={user.userAddress}
                    onClick={() => handleToggleMember(user.userAddress)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedMembers.includes(user.userAddress)
                        ? 'glass-dark neon-purple border-cyber-purple bg-gradient-cyber/10'
                        : 'glass hover:glass-dark border-white/5 hover:border-cyber-blue/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-cyber rounded-full flex items-center justify-center text-white font-bold neon-green">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatAddress(user.userAddress)}
                        </p>
                      </div>
                      {selectedMembers.includes(user.userAddress) && (
                        <div className="w-6 h-6 bg-cyber-purple rounded-full flex items-center justify-center neon-purple animate-pulse">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass hover:glass-dark text-white py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-red-500/60"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
              className="flex-1 futuristic-btn py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <div className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FaBolt className="animate-pulse" />
                    <span>Create (Gasless)</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
