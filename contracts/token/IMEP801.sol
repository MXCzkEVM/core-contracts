// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/// @title IMEP-01 ISO Application Contract
interface IMEP801 {
    /// @dev This event gets emitted when the ISO contract is deployed.
    ///  The parameters is the address of the contract deployed
    event ContractDeployed(address indexed _address);

    /// @dev This event gets emitted when a new application is created.
    ///  The parameters is the application name
    event ApplicationCreated(address indexed _address, string indexed _name);

    /// @dev This event gets emitted when the owner of the contract is updated.
    ///  The parameters is the address of the new owner and the time the action was performed.
    event OwnerChanged(address indexed _newOwner, uint indexed _time);

    /// @notice Creates a new ISO application
    /// @param _name The name of the application
    function createApplication(string memory _name) external;

    /// @notice Change the owner of the application
    /// @dev only the owner should be able to call this function
    /// @param _newOwner The address of the new owner of the application
    function changeOwner(address _newOwner) external;
}
