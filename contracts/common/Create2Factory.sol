// Factory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Create2Factory is Initializable {
    event ContractCreated(address contractAddress);

    function initialize() public initializer {}

    function createContract(bytes32 salt, bytes memory bytecode) public returns (address) {
        address contractAddress;
        assembly {
            contractAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(contractAddress)) { revert(0, 0) }
        }
        emit ContractCreated(contractAddress);
        return contractAddress;
    }
}
