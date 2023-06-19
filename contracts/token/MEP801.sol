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
    constructor() {
        owner = msg.sender;
        emit ContractDeployed(address(this));
    }

    // Custom Errors
    error ONLY_OWNER();
    error APPLICATION_CREATED_ALREADY();

    /**
     * @dev See {IMEP-801 -> createApplication}
     * Emits an {ApplicationCreated} event indicating the created application.
     */
    function createApplication(string memory _name) external {
        if(bytes(applicationName).length > 0) {
            revert APPLICATION_CREATED_ALREADY();
        }

        applicationName = _name;
        emit ApplicationCreated(msg.sender, _name);
    }

    /**
     * @dev See {IMEP-801 -> changeOwner}
     * Emits an {ApplicationCreated} event indicating the created application.
     */
    function changeOwner(address _newOwner) external {
        if(owner != msg.sender) {
            revert ONLY_OWNER();
        }

        owner = _newOwner;
        emit OwnerChanged(_newOwner, block.timestamp);
    }
}
