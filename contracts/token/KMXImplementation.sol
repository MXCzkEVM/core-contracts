// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/**
 * @title KMXImplementation
 * @author Abiodun Awoyemi
 * @notice This contract allows you to manage the kmx price.
 */
contract KMXImplementation {
    address public owner;
    uint256 public kmxPrice;

    // Custom Errors
    error ONLY_OWNER();

    // EVENTS
    event KMXImplementationContractDeployed(address indexed _contractAddress);
    event KMXPriceUpdated(address indexed _caller, uint256 indexed _amount);

    /**
     * @notice Constructor function to initialize a new `ProvisioningContract` instance.
     */
    constructor() {
        owner = msg.sender;
        kmxPrice = 1000;

        emit KMXImplementationContractDeployed(address(this));
    }

    /**
     * @dev See {IMEP-802 -> producePID}
     * Emits an {PIDProduced} ev_applicationContractAddressent indicating the produced PID.
     */
    function updateKMXPrice(uint256 _amount) external {
        if (msg.sender != owner) {
            revert ONLY_OWNER();
        }

        kmxPrice = _amount;

        emit KMXPriceUpdated(msg.sender, _amount);
    }
}
