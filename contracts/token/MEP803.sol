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
    address public lpwanAddress;
    uint256 sensorId;

    mapping(uint256 => mapping(address => bytes32)) public sensorProfile;

    // Custom Errors
    error WRONG_LPWAN_ADDRESS();
    error ONLY_OWNER();

    /**
     * @notice Constructor function to initialize a new `SensorProfile` instance.
     * @param _lpwanAddress The address of the lpwan contract.
     */
    constructor(address _lpwanAddress) {
        lpwanAddress = _lpwanAddress;
        owner = msg.sender;

        emit MEP803Deployed(address(this));
    }

    /**
     * @dev See {IMEP-803 -> createSensorProfile}
     * Emits an {SensorProfileCreated} event indicating the created profile.
     */
    function createSensorProfile(address _lpwanAddress, string calldata _profileURI) external {
        if (msg.sender != owner) {
            revert ONLY_OWNER();
        }

        if (_lpwanAddress != lpwanAddress) {
            revert WRONG_LPWAN_ADDRESS();
        }

        sensorId++;

        bytes32 _profileURIHash = hashString(_profileURI);

        sensorProfile[sensorId][_lpwanAddress] = _profileURIHash;

        emit SensorProfileCreated(_lpwanAddress, _profileURI);
    }

    /**
     * @dev Returns the keccak256 hash of the input metadata link string
     * @param _profileURI The metadata link string to be hashed
     */
    function hashString(string calldata _profileURI) internal pure returns (bytes32 profileURIHash_) {
        profileURIHash_ = keccak256(abi.encodePacked(_profileURI));
    }
}
