// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/// @title MEP-600 NFC NFT Contract
interface IMEP600 {
    /// @notice Gets fired when the nfc nft is provisioned
    event NFCNFTProvisioned(uint256 indexed _tokenId, bytes32 indexed _tag);

    /// @notice Creates an NFT for MXC marketplace
    /// @param tokenURI the token URI of the NFT hosted on ipfs
    /// @param _nfcTag the nfc nft tag
    function mintNFCNFT(string memory tokenURI, bytes32 _nfcTag) external;
}
