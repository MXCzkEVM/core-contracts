// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IMEP1002NamingToken {

    function mint(address to, uint256 tokenId) external;

    function setBaseURI(string memory baseURI_) external;
}
