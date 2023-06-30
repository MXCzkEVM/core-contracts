pragma solidity ^0.8.0;

import "./interfaces/AggregatorInterface.sol";
import "./common/ControllableUpgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {
UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract EthMxcPriceAggregator is AggregatorInterface, ControllableUpgradeable {

    int public value;

    function initialize(int _vaule) external initializer {
        __Controllable_init();
        value = _vaule;
    }

    function setValue(int _vault) external onlyController {
        value = _vault;
    }

    function latestAnswer() public view returns (int256) {
        return int256(value);
    }

    function latestTimestamp() external view returns(uint256) {
        return block.timestamp;
    }

    function latestRound() external view returns (uint256) {
        return uint256(1);
    }

    function getAnswer(uint256 roundId) external view returns (int256) {
        return int256(value);
    }

    function getTimestamp(uint256 roundId) external view returns (uint256) {
        return block.timestamp;
    }
}

contract ProxiedEthMxcPriceAggregator is Proxied, UUPSUpgradeable, EthMxcPriceAggregator{
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}