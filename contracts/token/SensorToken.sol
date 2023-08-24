// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin libraries, which provide secure contract templates
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SensorToken is ControllableUpgradeable, ERC20PermitUpgradeable {
    // Define the interval for halving every one million blocks
    uint public HALVING_INTERVAL;

    uint public MAX_HALVING_CYCLE;

    uint private FINAL_REWARD_BLOCK;
    // Define the initial reward as 52.5, adjusted for the contract's decimals
    uint public initialReward;
    // Record the block number of the last halving
    uint public initBlock;

    uint public lastUpdateBlock;

    // Special addresses that balance dynamics
    address[] private specialAddresses;

    uint256[43] private __gap;

    function initialize(address[] memory _specialAddresses, address recipient) external initializer {
        require(_specialAddresses.length > 0, "special address length");

        __Controllable_init();
        __ERC20_init("Sensor Token", "SENSOR");
        __ERC20Permit_init("Sensor Token");
        HALVING_INTERVAL = 1000000;
        MAX_HALVING_CYCLE = 20;
        initialReward = 525 * (10 ** uint(decimals())) / 10;
        initBlock = block.number;
        FINAL_REWARD_BLOCK = block.number + MAX_HALVING_CYCLE * HALVING_INTERVAL;
        lastUpdateBlock = block.number;
        specialAddresses = _specialAddresses;
        _mint(recipient, 45000000 * (10 ** decimals()));
    }

    // set the special addresses
    function setSpecialAddresses(address[] memory _specialAddresses) external onlyController {
        specialAddresses = _specialAddresses;
    }

    function getSpecialAddresses() external view returns (address[] memory) {
        return specialAddresses;
    }

    // Function to dynamically calculate the current reward
    function getCurrentReward() public view returns (uint) {
        if(block.number >= FINAL_REWARD_BLOCK) {
            return 0;
        }
        // Calculate how many halving intervals have passed since the last halving
        uint halvingsSinceLast = (block.number - initBlock) / HALVING_INTERVAL;
        uint dynamicReward = initialReward;

        // For each unprocessed halving, dynamically reduce the reward
        for (uint i = 0; i < halvingsSinceLast; i++) {
            dynamicReward /= 2;
        }

        return dynamicReward;
    }

    // update the balance of the special addresses
    function update() public {
        if(lastUpdateBlock >= block.number) {
            return;
        }
        uint increase = _getIncrease();
        if(increase != 0) {
            lastUpdateBlock = block.number;
            _mint(specialAddresses[0], increase);
        }
    }

    // get special address should increase
    function _getIncrease() private view returns (uint) {
        uint gap = block.number - lastUpdateBlock;
        if(gap == 0) {
            return 0;
        }
        uint round = gap / HALVING_INTERVAL;
        uint inRound = gap % HALVING_INTERVAL;
        uint increase;
        uint currentReward = getCurrentReward();

        for (uint i = 0; i < round;) {
            increase += currentReward * ((round - i) ** 2) * HALVING_INTERVAL;
            unchecked{
                i++;
            }
        }
        if(inRound > 0) {
            increase += currentReward * inRound;
        }
        return increase;
    }



    // Function to dynamically calculate the current balance of the special addresses
    function balanceOf(address account) public view override returns (uint) {
        uint balance = super.balanceOf(account);
        if (account == specialAddresses[0]) {
            return balance + _getIncrease();
        }
        return balance;
    }

    function totalSupply() public view override returns (uint) {
        return super.totalSupply() + _getIncrease();
    }

    function _beforeTokenTransfer(address from, address to, uint amount) internal override {
        if(from == specialAddresses[0] || to == specialAddresses[0]) {
            update();
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}

contract ProxiedSensorToken is Proxied, UUPSUpgradeable,SensorToken {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
