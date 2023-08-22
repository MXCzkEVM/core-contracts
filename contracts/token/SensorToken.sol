// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin libraries, which provide secure contract templates
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// SensorToken contract inherits from ERC20Permit and Ownable
contract SensorToken is ControllableUpgradeable, ERC20PermitUpgradeable {
    // Define the maximum supply as 150,000,000, adjusted for the contract's decimals
    uint public MAX_SUPPLY = 150000000 * (10 ** uint(decimals()));
    // Define the interval for halving every one million blocks
    uint public HALVING_INTERVAL = 1000000;
    // Define the initial reward as 52.5, adjusted for the contract's decimals
    uint public initialReward = 525 * (10 ** uint(decimals())) / 10;
    // Record the block number of the last halving
    uint public initBlock;
    // Special addresses that balance dynamics are not applied to
    address[] public specialAddresses;

    uint public lastUpdateBlock;

    function initialize(address[] memory _specialAddresses) external initializer {
        __Controllable_init();
        __ERC20_init("Sensor", "SENSOR");
        __ERC20Permit_init("Sensor");
        _mint(msg.sender, 45000000 * (10 ** uint(decimals())));
        initBlock = block.number;
        lastUpdateBlock = block.number;
        specialAddresses = _specialAddresses;
    }

    // set the special addresses
    function setSpecialAddresses(address[] memory _specialAddresses) external onlyController {
        specialAddresses = _specialAddresses;
    }

    // Function to dynamically calculate the current reward
    function getCurrentReward() public view returns (uint) {
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
    function update() private  {
        if(lastUpdateBlock >= block.number) {
            return;
        }
        uint increase = _getIncrease();
        if(increase != 0) {
            _mint(specialAddresses[0], increase);
        }
        lastUpdateBlock = block.number;
    }

    // get special address should increase
    function _getIncrease() private view returns (uint) {
        if(lastUpdateBlock == block.number) {
            return 0;
        }
        uint gap = block.number - lastUpdateBlock;
        uint round = gap / HALVING_INTERVAL;
        uint inRound = gap % HALVING_INTERVAL;
        uint increase;
        uint currentReward = getCurrentReward();

        if(round > 1) {
            for (uint i; i < round;) {
                increase += currentReward * round * HALVING_INTERVAL;
                unchecked{
                    i++;
                }
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

    // Override decimals function to set decimals to 8
    function decimals() public pure override returns (uint8) {
        return 8;
    }

    function _beforeTokenTransfer(address from, address to, uint amount) internal override {
        if(from == specialAddresses[0] || to == specialAddresses[0]) {
            update();
        }
    }
}

contract ProxiedSensorToken is Proxied, UUPSUpgradeable,SensorToken {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
