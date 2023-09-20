// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/ERC6551/ERC6551Registry.sol";
import "../contracts/ERC6551/ERC6551AccountImplementation.sol";
import "../contracts/MEP2542.sol";
import {ProxiedMEP1002Token, MEP1002Token} from "../contracts/token/MEP1002Token.sol";
import {ProxiedMEP1004Token, MEP1004Token} from "../contracts/token/MEP1004Token.sol";
import "../contracts/token/XMXCToken.sol";
import "../contracts/token/XMigrateToken.sol";
import "../contracts/LPWAN.sol";
import "../contracts/token/Gin1689Coin.sol";
import "../contracts/token/MaxisCoin.sol";
import "../contracts/token/CrabCoin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";



contract DeployMEP2542 is Script {
    uint256 public deployerPrivateKey = vm.envUint("L2_DEPLOYER_KEY");

    uint256 public ownerPrivateKey = vm.envUint("L2_OWNER_KEY");

    address public owner = vm.addr(vm.envUint("L2_OWNER_KEY"));

    address public relayer = vm.envAddress("RELAYER_ADDRESS");

    LPWAN public lpwan = LPWAN(0x2000777700000000000000000000000000000001);

    MEP1002Token public mep1002Token = MEP1002Token(vm.envAddress("MEP1002TOKEN_ADDRESS"));

    MEP1004Token public mep1004Token = MEP1004Token(vm.envAddress("MEP1004TOKEN_ADDRESS"));

    SensorToken public sensorToken = SensorToken(vm.envAddress("SENSORTOKEN_ADDRESS"));

    Gin1689Coin public gin1689Coin = Gin1689Coin(vm.envAddress("GIN1689COIN_ADDRESS"));

    CrabCoin public crabCoin = CrabCoin(vm.envAddress("CRABCOIN_ADDRESS"));

    MaxisCoin public maxisCoin = MaxisCoin(vm.envAddress("MAXISCOIN_ADDRESS"));

    IERC20 public xMXCToken = IERC20(vm.envAddress("XMXC_ADDRESS"));

    XMigrateToken public xMigrate;

    MEP2542 public mep2542;

    ERC6551Registry public ERC6551RegistryProxy;

    ERC6551AccountImplementation public ERC6551AccountImpl;


    function run() external {
        vm.startBroadcast(ownerPrivateKey);
        UUPSUpgradeable(address(lpwan)).upgradeTo(address(new ProxiedLPWAN()));
        vm.stopBroadcast();

        vm.startBroadcast(deployerPrivateKey);
        UUPSUpgradeable(address(mep1002Token)).upgradeTo(address(new ProxiedMEP1002Token()));
        UUPSUpgradeable(address(mep1004Token)).upgradeTo(address(new ProxiedMEP1004Token()));

        ERC6551RegistryProxy = ERC6551Registry(deployProxy("ERC6551Registry", address(new ProxiedERC6551Registry()), ""));
        ERC6551AccountImpl = new ERC6551AccountImplementation();
        console2.log("ERC6551AccountImplementation", address(ERC6551AccountImpl));
        xMigrate = XMigrateToken(deployProxy("XMigrateToken", address(new ProxiedXMigrateToken()), abi.encode(XMigrateToken.initialize.selector)));

        uint epochTime = 4 hours;
        uint _epochExpiredTime = epochTime * 6;
        uint amount = 1666 * 1e18;
        uint _maxSelectToken = 2;

        address mep2542Addr = deployProxy("MEP2542", address(new ProxiedMEP2542()), bytes.concat(
            MEP2542.initialize.selector,
            abi.encode(
                address(lpwan),
                address(ERC6551RegistryProxy),
                address(ERC6551AccountImpl),
                address(mep1004Token),
                address(sensorToken),
                _epochExpiredTime,
                _maxSelectToken
            )
        ));


        mep2542 = MEP2542(mep2542Addr);
        mep2542.setController(relayer, true);
        xMigrate.setController(relayer, true);
        mep1004Token.setSlotExpiredBlockNum(320000);
        mep1004Token.setController(relayer, true);

        lpwan.setController(address(mep2542), true);
        lpwan.setController(relayer, true);
        lpwan.approveToken(address(sensorToken),address(mep2542), type(uint).max);
        lpwan.approveToken(address(xMXCToken), relayer, type(uint).max);
//        // !alert!: check storage slot overwrite
        console2.log(lpwan.getMEP1004Addr());

        mep2542.addRewardToken(address(gin1689Coin), address(0), amount);
        mep2542.addRewardToken(address(crabCoin), address(0), amount);
        mep2542.addRewardToken(address(maxisCoin), address(0), amount);
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