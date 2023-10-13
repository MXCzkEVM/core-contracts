// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/TAILZCoin.sol";
import "../contracts/MEP2542.sol";


contract DeployTAILZToken is Script {
    uint256 public deployerPrivateKey;

    address public owner;

    address public LPWANAddress = address(0x2000777700000000000000000000000000000001);

    address public recipient = address(0x653dC4562C730c9442127e5EB7aD7d2dE6Ce695A);

    function run() external {
        deployerPrivateKey = vm.envUint("DEPLOYER_KEY");

        owner = vm.envAddress("OWNER");
        vm.startBroadcast(deployerPrivateKey);
        // mainnet 0xBF717fCD0FD99238998d90D3fAA8C015530e85F4
        // testnet 0xc23832093cEC4306108775468FCCbcA84E19eAEa
        MEP2542 mep2542 = MEP2542(address(0xBF717fCD0FD99238998d90D3fAA8C015530e85F4));
        address TALIZCoinAddr = deployTAILZCoin();
        mep2542.addRewardToken(TALIZCoinAddr, address(0), 83333 * 1e18);
        vm.stopBroadcast();
    }

    function deployTAILZCoin() private returns (address){
        return deployProxy("TAILZToken", address(new ProxiedTAILZCoin()), bytes.concat(
            TAILZCoin.initialize.selector,
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