// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.18;

import "../MEP802.sol";

contract LPWANMock {
    uint256 mep802Id;
    mapping(uint256 => address) public provisioningContractAddress;

    event MEP802Created(address indexed _contractAddress, uint256 indexed _id);

    function createMEP802(
        string memory _tokenName,
        string memory _symbol,
        uint256 _yearFee,
        uint256 _noOfBlock,
        address _applicationContractAddress
    ) external {
        mep802Id++;

        bytes32 _salt = keccak256(abi.encodePacked(block.number, msg.sender));

        address provisioningContract_ = address(
            new ProvisioningContract{salt: _salt}(
                _tokenName,
                _symbol,
                _yearFee,
                _noOfBlock,
                _applicationContractAddress,
                address(this)
            )
        );

        provisioningContractAddress[mep802Id] = provisioningContract_;

        emit MEP802Created(provisioningContract_, mep802Id);
    }
}
