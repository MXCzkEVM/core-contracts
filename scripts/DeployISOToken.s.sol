// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/Gin1689Coin.sol";
import "../contracts/token/MaxisCoin.sol";
import "../contracts/token/CrabCoin.sol";


contract DeployISOToken is Script {
    uint256 public deployerPrivateKey = vm.envUint("DEPLOYER_KEY");

    address public owner = vm.envAddress("OWNER");

    address public LPWANAddress = 0x2000777700000000000000000000000000000001;

    address public recipient = 0x77426bce6b5C364bf95b2e59Cd44b786358200c0;

    uint public tokenMultiplier = 1e18;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);
        deployGin1689Coin();
        deployCrabCoin();
        deployMaxisCoin();
        vm.stopBroadcast();
    }

    function deployGin1689Coin() private {
        address gin1689TokenAddr = deployProxy("Gin1689Coin", address(new ProxiedGin1689Coin()), bytes.concat(
            Gin1689Coin.initialize.selector,
            abi.encode(
                LPWANAddress, // treasury
                recipient,
                300 // 3%
            )
        ));
    }

    function deployCrabCoin() private {
        address crabTokenAddr = deployProxy("CrabCoin", address(new ProxiedCrabCoin()), bytes.concat(
            CrabCoin.initialize.selector,
            abi.encode(
                LPWANAddress, // treasury
                recipient,
                300 // 3%
            )
        ));
    }

    function deployMaxisCoin() private {
        address maxisTokenAddr = deployProxy("MaxisCoin", address(new ProxiedMaxisCoin()), bytes.concat(
            MaxisCoin.initialize.selector,
            abi.encode(
                LPWANAddress, // treasury
                recipient,
                300 // 3%
            )
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