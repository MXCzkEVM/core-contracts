// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.18;

import {MEP1004Token} from "../MEP1004Token.sol";

//Minimal public implementation of IRMRKNestable for testing.
contract MEP1004TokenMock is MEP1004Token {
    function additionalFunction() external view onlyController returns (uint256) {
        return totalSupply();
    }

    function name() public pure override returns (string memory) {
        return "MEP1004Token V2";
    }
}
