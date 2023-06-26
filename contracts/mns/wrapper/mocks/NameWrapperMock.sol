// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.18;

//Minimal public implementation of IRMRKNestable for testing.
contract NameWrapperMock {
    bytes32 private constant _MXC_NODE = 0xc0ae3fe48f09fde4a60d1b2e3f2c5d1f8dd5922c3ab88ca76377c5fd10816e49;

    mapping(bytes32 => bytes) public names;

    address _owner;

    constructor() {
        // test.mxc
        bytes32 node = keccak256(abi.encodePacked(_MXC_NODE, keccak256(bytes("test"))));
        names[node] = bytes("test.mxc");
        _owner = msg.sender;
    }

    function ownerOf(uint256 id) external view returns (address owner) {
        return _owner;
    }
}
