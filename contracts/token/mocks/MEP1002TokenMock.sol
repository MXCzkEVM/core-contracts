// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.18;

import {MEP1002Token} from "../MEP1002Token.sol";

//Minimal public implementation of IRMRKNestable for testing.
contract MEP1002TokenMock is MEP1002Token {
    function additionalFunction() external view onlyController returns (uint256) {
        return totalSupply();
    }

    function name() public pure override returns (string memory) {
        return "MEP1002Token V2";
    }
}
