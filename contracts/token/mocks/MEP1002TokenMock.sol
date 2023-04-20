// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.16;

import "../MEP1002Token.sol";

//Minimal public implementation of IRMRKNestable for testing.
contract MEP1002TokenMock is MEP1002Token {
    constructor() MEP1002Token() {}

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }

    function nestMint(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) external {
        _nestMint(to, tokenId, destinationId, "");
    }

    // Utility transfers:

    function transfer(address to, uint256 tokenId) public virtual {
        transferFrom(_msgSender(), to, tokenId);
    }

    function nestTransfer(
        address to,
        uint256 tokenId,
        uint256 destinationId
    ) public virtual {
        nestTransferFrom(_msgSender(), to, tokenId, destinationId, "");
    }
}
