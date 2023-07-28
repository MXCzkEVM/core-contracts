// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "./IMEP801.sol";

/**
 * @title ISOApplication
 * @author Abiodun Awoyemi
 * @notice This contract enable the BO to create ISOs (Initial Sensor Offerings)
 */
contract ISOApplication is IMEP801 {
    // State variables
    address public owner;
    string public applicationName;

    /**
     * @notice Constructor function to initialize a new `ISOApplication` instance.
     */
    constructor(string memory _name) {
        owner = msg.sender;
        applicationName = _name;
        emit ISOApplicationDeployed(address(this), _name, msg.sender);
    }

    // Custom Errors
    error ONLY_OWNER();

    /**
     * @dev See {IMEP-801 -> changeOwner}
     * Emits an {ApplicationCreated} event indicating the created application.
     */
    function changeOwner(address _newOwner) external {
        if (owner != msg.sender) {
            revert ONLY_OWNER();
        }

        owner = _newOwner;
        emit OwnerChanged(_newOwner, block.timestamp);
    }
}
