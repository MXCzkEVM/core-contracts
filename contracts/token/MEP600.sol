// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IMEP600.sol";

/**
 * @title NFCNFT
 * @author Abiodun Awoyemi
 * @notice This contract is for NFCNFT
 */
contract NFCNFT is IMEP600, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // State variables
    address public owner;
    address public contractAddress;

    /// @dev tokenId -> tag mapping
    mapping(uint256 => bytes32) public nftnfcTag;
    /// @dev tag -> tokenId mapping, you can get the nft associated to nft
    mapping(bytes32 => uint256) public nfcnftTag;

    error TOKEN_ALREADY_PROVISIONED();

    /**
     * @notice Constructor function to initialize a new `NFCNFTMarketplace` instance.
     */
    constructor(
        address _marketPlaceContractAddress,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        owner = msg.sender;
        contractAddress = _marketPlaceContractAddress;
    }

    function mintNFCNFT(string memory tokenURI, bytes32 _nfcTag) external {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);

        nftnfcTag[newItemId] = _nfcTag;

        nfcnftTag[_nfcTag] = newItemId;

        emit NFCNFTProvisioned(newItemId, _nfcTag);
    }

}
