// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ProxiedMEP2542} from "../contracts/MEP2542.sol";

contract UpgradeMXCL1 is Script {

    uint256 public privateKey = vm.envUint("PRIVATE_KEY");

    //0xc23832093cEC4306108775468FCCbcA84E19eAEa testnet
    //0xBF717fCD0FD99238998d90D3fAA8C015530e85F4 mainnet
    address payable public MEP2542Addr = payable(0xBF717fCD0FD99238998d90D3fAA8C015530e85F4);

    function run() external {
        vm.startBroadcast(privateKey);
        UUPSUpgradeable(MEP2542Addr).upgradeTo(address(new ProxiedMEP2542()));
        ProxiedMEP2542(MEP2542Addr).setEpochExpiredTime(604800);
        vm.stopBroadcast();
    }

}
