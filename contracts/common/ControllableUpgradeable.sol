pragma solidity ^0.8.4;

import {
OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ControllableUpgradeable is OwnableUpgradeable {

    mapping(address => bool) public controllers;

    event ControllerChanged(address indexed controller, bool enabled);

    modifier onlyController() {
        require(
            controllers[msg.sender],
            "Controllable: Caller is not a controller"
        );
        _;
    }

    function setController(address controller, bool enabled) public onlyController {
        controllers[controller] = enabled;
        emit ControllerChanged(controller, enabled);
    }

    function __Controllable_init(address _admin) public onlyInitializing {
        __Ownable_init();
        controllers[_admin] = true;
        emit ControllerChanged(_admin, true);
    }

    /**
 * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
        assembly {
            sstore(0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103, newOwner)
        }
    }

}
