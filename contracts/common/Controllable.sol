pragma solidity ^0.8.4;

import {
ContextUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract Controllable is ContextUpgradeable {
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

    function __Controllable_init(address _admin) public initializer {
        controllers[_admin] = true;
        emit ControllerChanged(_admin, true);
    }
}
