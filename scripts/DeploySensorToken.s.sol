// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/SensorToken.sol";


contract DeploySensorToken is Script {
    uint256 public deployerPrivateKey = vm.envUint("DEPLOYER_KEY");

    address public owner = vm.envAddress("OWNER");

    address public LPWANAddress = 0x2000777700000000000000000000000000000001;

    address public recipient = 0x77426bce6b5C364bf95b2e59Cd44b786358200c0;

    SensorToken public sensorToken;

    uint public tokenMultiplier = 1e18;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);
        address[] memory specialAddresses = new address[](1);
        specialAddresses[0] = address(LPWANAddress);
        address sensorTokenAddr = deployProxy("SensorToken", address(new ProxiedSensorToken()), bytes.concat(
            SensorToken.initialize.selector,
            abi.encode(
                specialAddresses,
                recipient
            )
        ));
        sensorToken = SensorToken(sensorTokenAddr);
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