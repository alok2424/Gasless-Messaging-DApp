"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';
import toast from 'react-hot-toast';

interface User {
  name: string;
  userAddress: string;
  exists: boolean;
}

interface Message {
  sender: string;
  timestamp: bigint;
  content: string;
}

interface Chat {
  user1: string;
  user2: string;
  messageCount: bigint;
  exists: boolean;
}

interface GroupChat {
  name: string;
  creator: string;
  members: string[];
  messageCount: bigint;
  exists: boolean;
}

interface ChatContextType {
  currentUser: User | null;
  allUsers: User[];
  userChats: { chat: Chat; chatId: string }[];
  userGroups: { group: GroupChat; groupId: number }[];
  selectedChat: string | null;
  selectedGroup: number | null;
  messages: Message[];
  isLoadingUser: boolean;
  isLoadingChats: boolean;
  isSending: boolean;
  isRegistering: boolean;
  isCreatingGroup: boolean;
  registerUser: (name: string) => Promise<void>;
  sendMessage: (to: string, content: string) => Promise<void>;
  createGroup: (name: string, members: string[]) => Promise<void>;
  sendGroupMessage: (groupId: number, content: string) => Promise<void>;
  selectChat: (address: string) => void;
  selectGroup: (groupId: number) => void;
  loadAllUsers: () => Promise<void>;
  loadUserChats: () => Promise<void>;
  loadUserGroups: () => Promise<void>;
  loadMessages: (otherUser: string) => Promise<void>;
  loadGroupMessages: (groupId: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, contract, sendGaslessTransaction } = useWeb3();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userChats, setUserChats] = useState<{ chat: Chat; chatId: string }[]>([]);
  const [userGroups, setUserGroups] = useState<{ group: GroupChat; groupId: number }[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Load current user
  useEffect(() => {
    if (account && contract) {
      loadCurrentUser();
    }
  }, [account, contract]);

  // Auto-refresh messages when a chat is selected
  useEffect(() => {
    if (!contract) return;

    let intervalId: NodeJS.Timeout | null = null;

    // Refresh messages every 3 seconds when a chat/group is active
    if (selectedChat) {
      intervalId = setInterval(() => {
        loadMessages(selectedChat);
      }, 3000);
    } else if (selectedGroup !== null) {
      intervalId = setInterval(() => {
        loadGroupMessages(selectedGroup);
      }, 3000);
    }

    // Cleanup interval on unmount or when selection changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedChat, selectedGroup, contract]);

  const loadCurrentUser = async () => {
    if (!contract || !account) return;

    setIsLoadingUser(true);
    try {
      const user = await contract.getUser(account);
      if (user.exists) {
        setCurrentUser(user);
        await loadUserChats();
        await loadUserGroups();
      }
    } catch (error) {
      console.log("User not registered yet");
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Register user
  const registerUser = async (name: string) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsRegistering(true);
    const loadingToast = toast.loading("Registering user... (Gasless transaction)");
    try {
      await sendGaslessTransaction('registerUser', [name]);
      toast.success("User registered successfully!", { id: loadingToast });
      await loadCurrentUser();
    } catch (error: any) {
      console.error("Error registering user:", error);
      toast.error(error.message || "Failed to register user", { id: loadingToast });
    } finally {
      setIsRegistering(false);
    }
  };

  // Load all users
  const loadAllUsers = async () => {
    if (!contract) return;

    try {
      const users = await contract.getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load user chats
  const loadUserChats = async () => {
    if (!contract || !account) return;

    setIsLoadingChats(true);
    try {
      const [chats, chatIds] = await contract.getUserChats();
      const formattedChats = chats.map((chat: Chat, index: number) => ({
        chat,
        chatId: chatIds[index],
      }));
      setUserChats(formattedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load user groups
  const loadUserGroups = async () => {
    if (!contract || !account) return;

    try {
      const [groups, groupIds] = await contract.getUserGroups();
      const formattedGroups = groups.map((group: GroupChat, index: number) => ({
        group,
        groupId: Number(groupIds[index]),
      }));
      setUserGroups(formattedGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  // Send message
  const sendMessage = async (to: string, content: string) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading("Sending message... (Gasless)");
    try {
      await sendGaslessTransaction('sendMessage', [to, content]);
      toast.success("Message sent!", { id: loadingToast });
      await loadMessages(to);
      await loadUserChats();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  // Load messages
  const loadMessages = async (otherUser: string) => {
    if (!contract) return;

    try {
      const msgs = await contract.getChatMessages(otherUser);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  // Create group
  const createGroup = async (name: string, members: string[]) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsCreatingGroup(true);
    const loadingToast = toast.loading("Creating group... (Gasless)");
    try {
      await sendGaslessTransaction('createGroup', [name, members]);
      toast.success("Group created!", { id: loadingToast });
      await loadUserGroups();
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group", { id: loadingToast });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Send group message
  const sendGroupMessage = async (groupId: number, content: string) => {
    if (!contract || !account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading("Sending message... (Gasless)");
    try {
      await sendGaslessTransaction('sendGroupMessage', [groupId, content]);
      toast.success("Message sent!", { id: loadingToast });
      await loadGroupMessages(groupId);
      await loadUserGroups();
    } catch (error: any) {
      console.error("Error sending group message:", error);
      toast.error(error.message || "Failed to send message", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  // Load group messages
  const loadGroupMessages = async (groupId: number) => {
    if (!contract) return;

    try {
      const msgs = await contract.getGroupMessages(groupId);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading group messages:", error);
      setMessages([]);
    }
  };

  // Select chat
  const selectChat = (address: string) => {
    setSelectedChat(address);
    setSelectedGroup(null);
    loadMessages(address);
  };

  // Select group
  const selectGroup = (groupId: number) => {
    setSelectedGroup(groupId);
    setSelectedChat(null);
    loadGroupMessages(groupId);
  };

  const value = {
    currentUser,
    allUsers,
    userChats,
    userGroups,
    selectedChat,
    selectedGroup,
    messages,
    isLoadingUser,
    isLoadingChats,
    isSending,
    isRegistering,
    isCreatingGroup,
    registerUser,
    sendMessage,
    createGroup,
    sendGroupMessage,
    selectChat,
    selectGroup,
    loadAllUsers,
    loadUserChats,
    loadUserGroups,
    loadMessages,
    loadGroupMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
