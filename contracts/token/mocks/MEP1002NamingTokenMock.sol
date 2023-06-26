// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.18;

import {ProxiedMEP1002NamingToken} from "../MEP1002NamingToken.sol";
import {console} from "hardhat/console.sol";
//Minimal public implementation of IRMRKNestable for testing.

contract ProxiedMEP1002NamingTokenMock is ProxiedMEP1002NamingToken {
    function additionalFunction() external view onlyController returns (uint256) {
        return totalSupply();
    }

    function name() public pure override returns (string memory) {
        return "MEP1002NamingToken V2";
    }
}
