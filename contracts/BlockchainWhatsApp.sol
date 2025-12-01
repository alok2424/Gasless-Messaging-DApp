// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlockchainWhatsApp
 * @dev Decentralized messaging application with gasless transactions
 * Features: 1-on-1 chat, group chat, message history
 */
contract BlockchainWhatsApp is ERC2771Context, Ownable {

    struct User {
        string name;
        address userAddress;
        bool exists;
    }

    struct Message {
        address sender;
        uint256 timestamp;
        string content;
    }

    struct Chat {
        address user1;
        address user2;
        uint256 messageCount;
        bool exists;
    }

    struct GroupChat {
        string name;
        address creator;
        address[] members;
        uint256 messageCount;
        bool exists;
    }

    // User management
    mapping(address => User) public users;
    address[] public userList;

    // 1-on-1 Chats
    mapping(bytes32 => Chat) public chats;
    mapping(bytes32 => Message[]) public chatMessages;
    bytes32[] public chatList;

    // Group Chats
    mapping(uint256 => GroupChat) public groupChats;
    mapping(uint256 => Message[]) public groupMessages;
    mapping(uint256 => mapping(address => bool)) public groupMembers;
    uint256 public groupCount;

    // Events
    event UserRegistered(address indexed userAddress, string name);
    event MessageSent(bytes32 indexed chatId, address indexed from, address indexed to, string content, uint256 timestamp);
    event GroupCreated(uint256 indexed groupId, string name, address indexed creator);
    event GroupMessageSent(uint256 indexed groupId, address indexed sender, string content, uint256 timestamp);
    event MemberAddedToGroup(uint256 indexed groupId, address indexed member);

    constructor(address trustedForwarder)
        ERC2771Context(trustedForwarder)
        Ownable(_msgSender())
    {}

    // User Functions
    function registerUser(string memory _name) external {
        address user = _msgSender();
        require(!users[user].exists, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");

        users[user] = User({
            name: _name,
            userAddress: user,
            exists: true
        });

        userList.push(user);
        emit UserRegistered(user, _name);
    }

    function getUser(address _user) external view returns (User memory) {
        require(users[_user].exists, "User not found");
        return users[_user];
    }

    function getAllUsers() external view returns (User[] memory) {
        User[] memory allUsers = new User[](userList.length);
        for (uint256 i = 0; i < userList.length; i++) {
            allUsers[i] = users[userList[i]];
        }
        return allUsers;
    }

    // 1-on-1 Chat Functions
    function sendMessage(address _to, string memory _content) external {
        address from = _msgSender();
        require(users[from].exists, "Sender not registered");
        require(users[_to].exists, "Recipient not registered");
        require(from != _to, "Cannot send message to yourself");
        require(bytes(_content).length > 0, "Message cannot be empty");

        bytes32 chatId = _getChatId(from, _to);

        if (!chats[chatId].exists) {
            chats[chatId] = Chat({
                user1: from < _to ? from : _to,
                user2: from < _to ? _to : from,
                messageCount: 0,
                exists: true
            });
            chatList.push(chatId);
        }

        chatMessages[chatId].push(Message({
            sender: from,
            timestamp: block.timestamp,
            content: _content
        }));

        chats[chatId].messageCount++;

        emit MessageSent(chatId, from, _to, _content, block.timestamp);
    }

    function getChatMessages(address _otherUser) external view returns (Message[] memory) {
        address user = _msgSender();
        bytes32 chatId = _getChatId(user, _otherUser);
        require(chats[chatId].exists, "Chat does not exist");
        return chatMessages[chatId];
    }

    function getUserChats() external view returns (Chat[] memory, bytes32[] memory) {
        address user = _msgSender();
        uint256 count = 0;

        // Count user's chats
        for (uint256 i = 0; i < chatList.length; i++) {
            if (chats[chatList[i]].user1 == user || chats[chatList[i]].user2 == user) {
                count++;
            }
        }

        Chat[] memory userChats = new Chat[](count);
        bytes32[] memory userChatIds = new bytes32[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < chatList.length; i++) {
            if (chats[chatList[i]].user1 == user || chats[chatList[i]].user2 == user) {
                userChats[index] = chats[chatList[i]];
                userChatIds[index] = chatList[i];
                index++;
            }
        }

        return (userChats, userChatIds);
    }

    // Group Chat Functions
    function createGroup(string memory _name, address[] memory _members) external {
        address creator = _msgSender();
        require(users[creator].exists, "Creator not registered");
        require(bytes(_name).length > 0, "Group name cannot be empty");
        require(_members.length > 0, "Group must have at least one member");

        groupCount++;
        uint256 groupId = groupCount;

        // Add creator to members
        address[] memory allMembers = new address[](_members.length + 1);
        allMembers[0] = creator;
        for (uint256 i = 0; i < _members.length; i++) {
            require(users[_members[i]].exists, "Member not registered");
            allMembers[i + 1] = _members[i];
            groupMembers[groupId][_members[i]] = true;
        }
        groupMembers[groupId][creator] = true;

        groupChats[groupId] = GroupChat({
            name: _name,
            creator: creator,
            members: allMembers,
            messageCount: 0,
            exists: true
        });

        emit GroupCreated(groupId, _name, creator);
    }

    function sendGroupMessage(uint256 _groupId, string memory _content) external {
        address sender = _msgSender();
        require(groupChats[_groupId].exists, "Group does not exist");
        require(groupMembers[_groupId][sender], "Not a group member");
        require(bytes(_content).length > 0, "Message cannot be empty");

        groupMessages[_groupId].push(Message({
            sender: sender,
            timestamp: block.timestamp,
            content: _content
        }));

        groupChats[_groupId].messageCount++;

        emit GroupMessageSent(_groupId, sender, _content, block.timestamp);
    }

    function getGroupMessages(uint256 _groupId) external view returns (Message[] memory) {
        require(groupChats[_groupId].exists, "Group does not exist");
        address user = _msgSender();
        require(groupMembers[_groupId][user], "Not a group member");
        return groupMessages[_groupId];
    }

    function getGroupInfo(uint256 _groupId) external view returns (GroupChat memory) {
        require(groupChats[_groupId].exists, "Group does not exist");
        return groupChats[_groupId];
    }

    function getUserGroups() external view returns (GroupChat[] memory, uint256[] memory) {
        address user = _msgSender();
        uint256 count = 0;

        // Count user's groups
        for (uint256 i = 1; i <= groupCount; i++) {
            if (groupMembers[i][user]) {
                count++;
            }
        }

        GroupChat[] memory userGroups = new GroupChat[](count);
        uint256[] memory userGroupIds = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= groupCount; i++) {
            if (groupMembers[i][user]) {
                userGroups[index] = groupChats[i];
                userGroupIds[index] = i;
                index++;
            }
        }

        return (userGroups, userGroupIds);
    }

    function addGroupMember(uint256 _groupId, address _member) external {
        address sender = _msgSender();
        require(groupChats[_groupId].exists, "Group does not exist");
        require(groupChats[_groupId].creator == sender, "Only creator can add members");
        require(users[_member].exists, "Member not registered");
        require(!groupMembers[_groupId][_member], "Already a member");

        groupChats[_groupId].members.push(_member);
        groupMembers[_groupId][_member] = true;

        emit MemberAddedToGroup(_groupId, _member);
    }

    // Helper Functions
    function _getChatId(address _user1, address _user2) private pure returns (bytes32) {
        return _user1 < _user2
            ? keccak256(abi.encodePacked(_user1, _user2))
            : keccak256(abi.encodePacked(_user2, _user1));
    }

    // Override required by ERC2771Context
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}
