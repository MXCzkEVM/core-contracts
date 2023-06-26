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
        uint256 _yearOneFee,
        uint256 _yearTwoFee,
        uint256 _yearFiveFee,
        uint256 _noOfBlockYearOne,
        uint256 _noOfBlockYearTwo,
        uint256 _noOfBlockYearFive,
        address _applicationContractAddress
    ) external {
        mep802Id++;

        bytes32 _salt = keccak256(abi.encodePacked(block.number, msg.sender));

        address provisioningContract_ = address(
            new ProvisioningContract{salt: _salt}(
                _tokenName,
                _symbol,
                _yearOneFee,
                _yearTwoFee,
                _yearFiveFee,
                _noOfBlockYearOne,
                _noOfBlockYearTwo,
                _noOfBlockYearFive,
                _applicationContractAddress
            )
        );

        provisioningContractAddress[mep802Id] = provisioningContract_;

        emit MEP802Created(provisioningContract_, mep802Id);
    }
}
