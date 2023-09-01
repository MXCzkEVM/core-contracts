// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

library MerkleVerifierLibrary {
    struct ProofValue {
        bytes value;
        int8 side; // Change int64 to int8
    }

    function verifyMerkleProof(bytes32 root, bytes32 leaf, ProofValue[] memory proof) internal pure returns (bool) {
        bytes32 currentHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes memory value = proof[i].value;
            if (proof[i].side == 1) {
                currentHash = hash(abi.encodePacked(currentHash, value), "");
            } else {
                currentHash = hash(abi.encodePacked(value, currentHash), "");
            }
        }
        
        return root == currentHash;
    }

    function hash(bytes memory left, bytes memory right) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(left, right));
    }

    function hexStringToBytes(string memory _hex) internal pure returns (bytes memory) {
        require(bytes(_hex).length % 2 == 0, "Hex length must be even");
        bytes memory result = new bytes(bytes(_hex).length / 2);
        for (uint256 i = 0; i < bytes(_hex).length; i += 2) {
            uint8 high = hexCharToByte(bytes(_hex)[i]);
            uint8 low = hexCharToByte(bytes(_hex)[i + 1]);
            result[i / 2] = bytes1((high << 4) | low);
        }
        return result;
    }

    function hexCharToByte(bytes1 c) internal pure returns (uint8) {
        if (uint8(c) >= 48 && uint8(c) <= 57) {
            return uint8(c) - 48;
        }
        if (uint8(c) >= 97 && uint8(c) <= 102) {
            return uint8(c) - 87;
        }
        if (uint8(c) >= 65 && uint8(c) <= 70) {
            return uint8(c) - 55;
        }
        revert("Invalid character");
    }
}