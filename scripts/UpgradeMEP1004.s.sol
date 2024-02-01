// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ProxiedMEP1004Token} from "../contracts/token/MEP1004Token.sol";

contract UpgradeMXCL1 is Script {

    uint256 public privateKey = vm.envUint("PRIVATE_KEY");

    //0x5CE293229a794AF03Ec3c95Cfba6b1058D558026 testnet
    //0x8Ff08F39B1F4Ad7dc42E6D63fd25AeE47EA801Ce mainnet
    address payable public MEP1004Addr = payable(0x8Ff08F39B1F4Ad7dc42E6D63fd25AeE47EA801Ce);

    function run() external {
        vm.startBroadcast(privateKey);
        UUPSUpgradeable(MEP1004Addr).upgradeTo(address(new ProxiedMEP1004Token()));
        ProxiedMEP1004Token(MEP1004Addr).setSlotExpiredBlockNum(1000000);
        vm.stopBroadcast();
    }

}
