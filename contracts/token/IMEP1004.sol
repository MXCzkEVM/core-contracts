// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IMEP1004 /*is IERC721*/ {

    struct LocationProof {
        uint256 MEP1002TokenId;
        uint256[] MEP1004TokenIds;
        string item;
        uint256 timestamp;
    }

    event NewLocationProof(
        uint256 indexed MEP1002TokenId,
        string indexed item,
        LocationProof locationProof
    );

    event InsertToMEP1002Slot(
        uint256 indexed MEP1002TokenId,
        uint256 indexed MEP1004TokenId,
        uint256 indexed slotIndex,
        uint256 SNCodeType
    );

    event RemoveFromMEP1002Slot(
        uint256 indexed MEP1002TokenId,
        uint256 indexed MEP1004TokenId,
        uint256 indexed slotIndex,
        uint256 SNCodeType
    );

    // Returns the encrypted S/N code of the device.
    function getSNCode(uint256 _tokenId) external view returns (string memory);

    // Inserts the MEP1004 token to the specified slot within a MEP1002 token.
    function insertToMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external;

    // Removes the MEP1004 token from the specified slot within a MEP1002 token.
    function removeFromMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external payable;

    // Submit the location proofs of anything.
    function LocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external;

    // get the latest location proofs of anything.
    function latestLocationProofs(string memory _item) external view returns (LocationProof memory);
}

