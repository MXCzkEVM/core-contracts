// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IMEP1002NamingToken {
    function init(string memory name_, string memory symbol_) external;

    function mint(address to, uint256 tokenId) external;
}
