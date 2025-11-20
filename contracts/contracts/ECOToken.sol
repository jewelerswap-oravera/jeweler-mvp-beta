// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ECOToken is ERC20, Ownable {
    constructor() ERC20("ECOToken", "ECO") {
        _mint(msg.sender, 1000000 * 10**18); // 1M ECO initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
    }
}
