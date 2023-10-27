// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/xbMXCToken.sol";


contract DeployXBMXCToken is Script {
    uint256 public deployerPrivateKey;

    address public owner;

    function run() external {
        deployerPrivateKey = vm.envUint("DEPLOYER_KEY");
        owner = vm.envAddress("OWNER");
        vm.startBroadcast(deployerPrivateKey);
        deployXBMXCToken();
        vm.stopBroadcast();
    }

    function deployXBMXCToken() private returns (address){
        return deployProxy("XBMXCToken", address(new ProxiedXBMXCToken()), bytes.concat(
            XBMXCToken.initialize.selector
        ));
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