//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// Kept for backwards compatibility with older versions of Hardhat and Truffle plugins.
contract UUPSProxy is ERC1967Proxy {
    constructor(
        address _logic,
        address _admin, // This is completely unused by the uups proxy, required to remain compatible with hardhat deploy: https://github.com/wighawag/hardhat-deploy/issues/146
        bytes memory _data
    ) payable ERC1967Proxy(_logic, _data) {
        if (_admin == address(0)) {
            _admin = msg.sender;
        }
        assembly {
            sstore(0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103, _admin)
        }
    }
}
