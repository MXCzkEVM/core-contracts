pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/Gin1689Coin.sol";


contract TaxTokenTest is Test {

    address public recipient = 0x77426bce6b5C364bf95b2e59Cd44b786358200c0;

    address public LPWANAddress = 0x2000777700000000000000000000000000000001;

    address public constant Alice = 0x10020FCb72e27650651B05eD2CEcA493bC807Ba4;
    address public constant Bob = 0x200708D76eB1B69761c23821809d53F65049939e;

    Gin1689Coin public gin1689Token;

    uint public tokenMultiplier  = 1e18;

    function setUp() public {
        vm.roll(1);
        address gin1689TokenAddr = deployProxy("Gin1689Coin", address(new ProxiedGin1689Coin()), bytes.concat(
            Gin1689Coin.initialize.selector,
            abi.encode(
                LPWANAddress, // treasury
                recipient,
                300 // 3%
            )
        ));
        gin1689Token = Gin1689Coin(gin1689TokenAddr);


    }

    function testPremint() public {
        assertEq(gin1689Token.balanceOf(address(recipient)), 1e8 * tokenMultiplier);
    }

    function testTax() public {
        transferToAlice();
        vm.prank(Alice);
        gin1689Token.transfer(Bob, 1e18);
        assertEq(gin1689Token.balanceOf(Bob), 1e18 - 1e18 * 3 / 100);
    }

    function testTransferFrom() public {
        transferToAlice();

        vm.prank(Alice);
        gin1689Token.approve(Bob, 1e18);
        vm.prank(Bob);
        gin1689Token.transferFrom(Alice, Bob, 1e18);
        assertEq(gin1689Token.balanceOf(Bob), 1e18 - 1e18 * 3 / 100);


    }


    function testWhiteList() public {
        transferToAlice();
        gin1689Token.addWhiteList(Alice);
        vm.prank(Alice);
        gin1689Token.transfer(Bob, 1e18);
        assertEq(gin1689Token.balanceOf(Bob), 1e18);
    }

    function testRemoveWhiteList() public {
        transferToAlice();
        gin1689Token.addWhiteList(Alice);
        gin1689Token.removeWhiteList(Alice);
        vm.prank(Alice);
        gin1689Token.transfer(Bob, 1e18);
        assertEq(gin1689Token.balanceOf(Bob), 1e18 - 1e18 * 3 / 100);
    }

    function testTransferSmallAmount() public {
        transferToAlice();

        // amount * fee less than 10000
        vm.prank(Alice);
        gin1689Token.transfer(Bob, 30);
        assertEq(gin1689Token.balanceOf(Bob), 30);
    }



    function testTreasury() public {
        transferToAlice();

        vm.prank(Alice);
        gin1689Token.transfer(Bob, 1e18);
        assertEq(gin1689Token.balanceOf(LPWANAddress), 1e18 * 3 / 100);
    }

    function transferToAlice() private {
        vm.prank(recipient);
        gin1689Token.transfer(Alice, 1e20);
    }

    function testUpgrade() public {
        address newImpl = address(new ProxiedGin1689Coin());
        ProxiedGin1689Coin(address(gin1689Token)).upgradeTo(newImpl);

        transferToAlice();
        vm.prank(Alice);
        gin1689Token.transfer(Bob, 1e18);
        assertEq(gin1689Token.balanceOf(Bob), 1e18 - 1e18 * 3 / 100);
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