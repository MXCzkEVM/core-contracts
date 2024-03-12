// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import {ProxiedMEP2542AchievementERC1155NFT, MEP2542AchievementERC1155NFT} from "../contracts/token/MEP2542AchievementERC1155NFT.sol";


contract DeployMEP2542 is Script {
    uint256 public deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    address public owner = vm.addr(deployerPrivateKey);

    // mainnet 0x8Ff08F39B1F4Ad7dc42E6D63fd25AeE47EA801Ce
    address public mep1004TokenAddr = address(0x8Ff08F39B1F4Ad7dc42E6D63fd25AeE47EA801Ce);

    address private permitSigner = address(0x9787BA9fE5F74700f38093b95F9A2562eF93A560);
    function run() external {

        vm.startBroadcast(deployerPrivateKey);

        address mep2542Addr = deployProxy("MEP2542AchievementERC1155NFT", address(new ProxiedMEP2542AchievementERC1155NFT()), bytes.concat(
            MEP2542AchievementERC1155NFT.initialize.selector,
            abi.encode(
                mep1004TokenAddr,
                "MEP2542 Achievement NFT",
                "MEP2542Achievement",
                "", // uri
                permitSigner //permit
            )
        ));

        MEP2542AchievementERC1155NFT(mep2542Addr).setController(permitSigner,true);
        vm.stopBroadcast();

    }

    function deployProxy(string memory name, address implementation, bytes memory data)
    private
    returns (address proxy)
    {
        proxy = address(new UUPSProxy(implementation, owner, data));

        console2.log(name, "(impl) ->", implementation);
        console2.log(name, "(proxy) ->", proxy);
    }

}