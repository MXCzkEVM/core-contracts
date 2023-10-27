// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin libraries, which provide secure contract templates
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract XBMXCToken is ControllableUpgradeable, ERC20PermitUpgradeable {

    uint256[50] private __gap;

    function initialize() external initializer {
        __Controllable_init();
        __ERC20_init("xbMXC", "xbMXC");
        __ERC20Permit_init("xbMXC");
    }

    function mintTo(address account, uint256 amount) external onlyController {
        _mint(account, amount);
    }
}

contract ProxiedXBMXCToken is Proxied, UUPSUpgradeable, XBMXCToken {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}