// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library LibAddress {
    /**
     * Sends Ether to an address. Zero-value will also be sent.
     * See more information at:
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now.
     * @param to The target address.
     * @param amount The amount of Ether to send.
     */
    function sendEther(address to, uint256 amount) internal {
        if (amount == 0 || to == address(0)) return;
        (bool success,) = payable(to).call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function sendEtherUnchecked(address to, uint256 amount) internal {
        (bool success,) = payable(to).call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function codeHash(address addr) internal view returns (bytes32 codehash) {
        assembly {
            codehash := extcodehash(addr)
        }
    }
}
