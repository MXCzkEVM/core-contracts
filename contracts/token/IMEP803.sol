// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

interface IMEP803 {
    /// @dev This event gets emitted when the Sensor Profile contract is deployed.
    ///  The parameters is the address of the application contract and address of the contract deployed
    event SensorProfileDeployed(
        address indexed _sensorProfileContractAddress,
        address indexed _appContractAddress,
        string indexed _sensorProfileURI
    );
}
