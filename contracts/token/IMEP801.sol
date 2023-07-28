// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/// @title IMEP-801 ISO Application Contract
interface IMEP801 {
    /// @dev This event gets emitted when the ISO contract is deployed.
    ///  The parameters is the address of the contract deployed
    event ISOApplicationDeployed(
        address indexed appContractAddress, string indexed applicationName, address indexed businessOwnerAddress
    );

    /// @dev This event gets emitted when the owner of the contract is updated.
    ///  The parameters is the address of the new owner and the time the action was performed.
    event OwnerChanged(address indexed _newOwner, uint256 indexed _time);

    /// @notice Change the owner of the application
    /// @dev only the owner should be able to call this function
    /// @param _newOwner The address of the new owner of the application
    function changeOwner(address _newOwner) external;
}
