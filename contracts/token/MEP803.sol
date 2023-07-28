// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./IMEP803.sol";

/**
 * @title SensorProfile
 * @author Abiodun Awoyemi
 * @notice This contract manages the device profiles of a sensor network.
 */
contract SensorProfile is IMEP803 {
    // State variables
    address public owner;
    address public appContractAddress;
    bytes32 public profileURIHash;
    string public tier;

    /**
     * @notice Constructor function to initialize a new `SensorProfile` instance.
     * @param _appContractAddress The address of the lpwan contract.
     * @param _sensorProfileURI The metadata link of the sensor profile.
     * @param _tier The tier of the sensor profile.
     */
    constructor(address _appContractAddress, string memory _sensorProfileURI, string memory _tier) {
        appContractAddress = _appContractAddress;
        owner = msg.sender;

        bytes32 _profileURIHash = hashString(_sensorProfileURI);

        profileURIHash = _profileURIHash;
        tier = _tier;

        emit SensorProfileDeployed(address(this), _appContractAddress, _sensorProfileURI);
    }

    /**
     * @dev Returns the keccak256 hash of the input metadata link string
     * @param _profileURI The metadata link string to be hashed
     */
    function hashString(string memory _profileURI) internal pure returns (bytes32 profileURIHash_) {
        profileURIHash_ = keccak256(abi.encodePacked(_profileURI));
    }
}
