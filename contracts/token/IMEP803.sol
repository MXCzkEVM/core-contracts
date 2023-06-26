// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

interface IMEP803 {
    /// @dev This event gets emitted when the Sensor Profile contract is deployed.
    ///  The parameters is the address of the contract deployed
    event MEP803Deployed(address indexed _address);

    /// @notice Gets fired when a new sensor profile
    ///  is created
    event SensorProfileCreated(address indexed _lpwanAddress, string indexed _profileURI);

    /// @notice Creates a sensor profile with a URI link to IPFS
    /// @param _lpwanAddress contract address of the app
    /// @param _profileURI Profile link to IPFS
    function createSensorProfile(address _lpwanAddress, string calldata _profileURI) external;
}
