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
        uint256 MEP1002TokenId,
        string item,
        LocationProof locationProof
    );

    // Returns the encrypted S/N code of the device.
    function getSNCode(uint256 _tokenId) external view returns (string memory);

    // Submit the location proofs of anything.
    function LocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external;

    // get the latest location proofs of anything.
    function latestLocationProofs(string memory _item) external view returns (LocationProof memory);
}

