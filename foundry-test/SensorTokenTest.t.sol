pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/proxy/UUPSProxy.sol";


contract SensorTokenTest is Test {

    address public recipient = 0x77426bce6b5C364bf95b2e59Cd44b786358200c0;

    SensorToken public sensorToken;

    uint public tokenMultiplier = 1e18;

    function setUp() public {
        vm.roll(1);
        address[] memory specialAddresses = new address[](1);
        specialAddresses[0] = address(this);
        address sensorTokenAddr = deployProxy("SensorToken", address(new ProxiedSensorToken()), bytes.concat(
            SensorToken.initialize.selector,
            abi.encode(
                specialAddresses,
                recipient
            )
        ));
        sensorToken = SensorToken(sensorTokenAddr);
    }

    function testSpecialAddresses() public {
        assertEq(sensorToken.getSpecialAddresses()[0], address(this));
    }

    function testPremint() public {
        assertEq(sensorToken.balanceOf(address(recipient)), 45000000 * tokenMultiplier);
    }

    function testReward() public {
        uint rewardPerBlock = tokenMultiplier * 525 / 10;

        assertEq(sensorToken.getCurrentReward(), rewardPerBlock);
    }

    function testBlockRoll() public {
        vm.roll(151);
        uint rewardPerBlock = tokenMultiplier * 525 / 10;

        assertEq(sensorToken.balanceOf(address(this)), 150 * rewardPerBlock);

        vm.roll(3000005);
        uint newRewardPerBlock = tokenMultiplier * 525 / 10 / 8;
        assertEq(sensorToken.getCurrentReward(), newRewardPerBlock);

        uint expectedBalance = 1e6 * rewardPerBlock + 1e6 * rewardPerBlock / 2 + 1e6 * rewardPerBlock / 4 + 4 * rewardPerBlock / 8;
        assertEq(sensorToken.balanceOf(address(this)), expectedBalance);
    }

    function testTransfer() public {
        vm.roll(151);
        uint rewardPerBlock = tokenMultiplier * 525 / 10;

        sensorToken.transfer(address(recipient), 100 * rewardPerBlock);

        assertEq(sensorToken.balanceOf(address(this)), 50 * rewardPerBlock);
    }

    function testMultiTransfer() public {
        vm.roll(151);
        uint rewardPerBlock = tokenMultiplier * 525 / 10;

        address randomAddr = address(1000);
        uint balance = sensorToken.balanceOf(address(this));
        assertEq(balance, 150 * rewardPerBlock);
        for (uint i = 0; i < 10; i++) {
            sensorToken.transfer(randomAddr, rewardPerBlock);
            assertEq(sensorToken.balanceOf(randomAddr), rewardPerBlock * (i + 1) - 1e8 * i);
            vm.prank(randomAddr);
            sensorToken.transfer(address(this), 1e8);
        }
        assertEq(sensorToken.balanceOf(randomAddr), rewardPerBlock * 10 - 1e8 * 10);
        assertEq(sensorToken.balanceOf(address(this)), balance + 1e8 * 10 - rewardPerBlock * 10);
    }

    function testUpgrade() public {
        address newImpl = address(new ProxiedSensorToken());
        ProxiedSensorToken(address(sensorToken)).upgradeTo(newImpl);
        sensorToken = SensorToken(address(sensorToken));
        uint rewardPerBlock = tokenMultiplier * 525 / 10;
        assertEq(sensorToken.getCurrentReward(), rewardPerBlock);
    }

    function deployProxy(string memory name, address implementation, bytes memory data)
    private
    returns (address proxy)
    {
        proxy = address(new UUPSProxy(implementation, address(this), data));

        console2.log(name, "(impl) ->", implementation);
        console2.log(name, "(proxy) ->", proxy);
    }
}