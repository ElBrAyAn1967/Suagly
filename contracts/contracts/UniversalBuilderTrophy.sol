// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract UniversalBuilderTrophy is ERC721 {
    struct Trophy {
        string eventName;
        string chainName;
        uint256 timestamp;
        bytes32 nfcId;
    }
    
    mapping(uint256 => Trophy) public trophies;
    mapping(bytes32 => bool) public nfcClaimed;
    mapping(address => uint256[]) public userTrophies;
    
    uint256 public nextTokenId = 1;
    address public owner;
    
    event TrophyMinted(
        address indexed recipient, 
        uint256 indexed tokenId, 
        string eventName, 
        bytes32 nfcId
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() ERC721("Universal Builder Trophy", "UBT") {
        owner = msg.sender;
    }
    
    function mintTrophy(
        address recipient,
        string memory eventName,
        string memory chainName,
        string memory imageURI,
        bytes32 nfcId
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(!nfcClaimed[nfcId], "NFC already claimed");
        
        uint256 tokenId = nextTokenId++;
        
        trophies[tokenId] = Trophy({
            eventName: eventName,
            chainName: chainName,
            timestamp: block.timestamp,
            nfcId: nfcId
        });
        
        nfcClaimed[nfcId] = true;
        userTrophies[recipient].push(tokenId);
        
        _mint(recipient, tokenId);
        
        emit TrophyMinted(recipient, tokenId, eventName, nfcId);
        
        return tokenId;
    }
    
    function getUserTrophies(address user) external view returns (uint256[] memory) {
        return userTrophies[user];
    }
    
    function getTrophyDetails(uint256 tokenId) external view returns (Trophy memory) {
        require(_ownerOf(tokenId) != address(0), "Trophy does not exist");
        return trophies[tokenId];
    }
    
    // Soulbound functionality - prevent all transfers
    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: Transfer not allowed");
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: Transfer not allowed");
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Soulbound: Transfer not allowed");
    }
    
    function approve(address, uint256) public pure override {
        revert("Soulbound: Approval not allowed");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: Approval not allowed");
    }
}