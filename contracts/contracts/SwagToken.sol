// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SwagToken is ERC20 {
    address public owner;
    uint256 public constant CLAIM_AMOUNT = 100 * 10**18;
    
    constructor() ERC20("Swag Token", "SWAG") {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function mintToUser(address recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        _mint(recipient, CLAIM_AMOUNT);
    }
}