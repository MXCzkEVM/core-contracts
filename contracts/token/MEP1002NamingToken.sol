// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./IMEP1002NamingToken.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
contract MEP1002NamingToken is OwnableUpgradeable, ERC721Upgradeable, IMEP1002NamingToken {

    function init(string memory name_, string memory symbol_) external initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init();
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }

}