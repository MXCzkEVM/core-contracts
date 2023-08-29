
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/MEP1004Token.sol";
import {MEP1002Token, ProxiedMEP1002Token} from "../contracts/token/MEP1002Token.sol";

import "../contracts/LPWAN.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../contracts/token/MEP1002NamingToken.sol";
import {XMXCToken, ProxiedXMXCToken} from "../contracts/token/XMXCToken.sol";

contract LPWANTest is Test {
// move to LPWAN test
    LPWAN public lpwan;
    MEP1002Token public mep1002Token;
    MEP1004Token public mep1004Token;

    address public constant Alice = 0x10020FCb72e27650651B05eD2CEcA493bC807Ba4;
    address public constant Bob = 0x200708D76eB1B69761c23821809d53F65049939e;

    function setUp() public {
        deployMEP1002Token();
        deployMEP1004Token();
        deployLPWAN();
        mep1004Token.setController(address(lpwan), true);
    }

    function testLPWANMintMEP1004StationsBySignatureWithSignature() public {
        uint privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address testSigner = vm.addr(privateKey);
        lpwan.setController(testSigner, true);
        uint mep1002TokenId = 609771860061585407;
        string memory sncode = "M2XTestAbc123";
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                lpwan.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(lpwan.PERMIT_TYPEHASH(), mep1002TokenId, sncode, testSigner, address(Alice)))
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(Alice);
        lpwan.mintMEP1004StationsBySignature(Alice, mep1002TokenId, sncode, "EU863-870", testSigner, signature);


    }

    function testRevertLPWANMintMEP1004StationsBySignatureWithNoSignature() public {
        uint mep1002TokenId = 609771860061585407;
        string memory sncode = "M2XTestAbc123";
        bytes memory signature;

        vm.startPrank(Alice);
        vm.expectRevert(INVALID_SIGNATURE.selector);
        lpwan.mintMEP1004StationsBySignature(Alice, mep1002TokenId, sncode, "EU863-870", Alice, signature);
    }

    function testLPWANClaimSuperNodeRewardWithSignature() public {
        uint privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address testSigner = vm.addr(privateKey);
        lpwan.setController(testSigner, true);
        vm.deal(address(lpwan), 1e18);

        uint totalReward = 100000;
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                lpwan.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(lpwan.PERMIT_TYPEHASH2(), totalReward, testSigner, address(Alice)))
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.startPrank(Alice);
        lpwan.claimSupernodeReward(Alice, totalReward, false, testSigner, signature);
        assertEq(Alice.balance, totalReward);
        // duplicate claim
        lpwan.claimSupernodeReward(Alice, totalReward, false, testSigner, signature);
        assertEq(Alice.balance, totalReward);

        totalReward = 120000;
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                lpwan.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(lpwan.PERMIT_TYPEHASH2(), totalReward, testSigner, address(Alice)))
            )
        );

        (v, r, s) = vm.sign(privateKey, hash);
        signature = abi.encodePacked(r, s, v);
        lpwan.claimSupernodeReward(Alice, totalReward, false, testSigner, signature);
        assertEq(Alice.balance, totalReward);
    }

    function testLPWANClaimSuperNodeRewardBurn() public {

        uint privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address testSigner = vm.addr(privateKey);
        lpwan.setController(testSigner, true);
        vm.deal(address(lpwan), 1e18);

        uint totalReward = 100000;
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                lpwan.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(lpwan.PERMIT_TYPEHASH2(), totalReward, testSigner, address(Alice)))
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(Alice);
        lpwan.claimSupernodeReward(Alice, totalReward, true, testSigner, signature);
        assertEq(Alice.balance, 0);
        assertEq(address(lpwan).balance, 1e18 - totalReward);
        assertEq(address(0).balance, totalReward);
    }

    function testRevertLPWANClaimSuperNodeRewardWithNoSignature() public {
        vm.expectRevert(INVALID_SIGNATURE.selector);
        lpwan.claimSupernodeReward(Alice, 100000, false, address(0), "");
    }

    function testBurnExcessToken() public {
        vm.deal(address(lpwan), 1e18);
        lpwan.burnExcessToken(1e15);
        assertEq(address(lpwan).balance, 1e18 - 1e15);
        assertEq(address(0).balance, 1e15);
    }

    function testWithdrawal() public {
        vm.deal(address(lpwan), 1e18);
        lpwan.withdrawal(Alice,1e15);
        assertEq(address(lpwan).balance, 1e18 - 1e15);
        assertEq(Alice.balance, 1e15);
    }

    function testApproveToken() public {
        address tokenAddr = deployProxy("XMXCToken", address(new ProxiedXMXCToken()), bytes.concat(
            XMXCToken.initialize.selector,
            abi.encode(
                "XMXCToken",
                "XMXC"
            )
        ));
        XMXCToken token = XMXCToken(tokenAddr);
        token.mintTo(address(lpwan), 1e18);

        lpwan.approveToken(address(token), Alice, 1e15);
        assertEq(token.allowance(address(lpwan), Alice), 1e15);
    }

    function deployMEP1004Token() private {
        address addr = deployProxy("MEP1004Token", address(new ProxiedMEP1004Token()), bytes.concat(
            mep1004Token.initialize.selector,
            abi.encode(
                "MEP1004Token",
                "MEP1004")
        ));
        mep1004Token = MEP1004Token(addr);
        mep1004Token.setMEP1002Addr(address(mep1002Token));
    }

    function deployMEP1002Token() private {
        address namingTokenAddr = deployProxy("MEP1002NamingToken", address(new ProxiedMEP1002NamingToken()), bytes.concat(
            MEP1002NamingToken.initialize.selector,
            abi.encode(
                "MEP1002NamingToken",
                "MEP1002")
        ));
        address addr = deployProxy("MEP1002Token", address(new ProxiedMEP1002Token()), bytes.concat(
            mep1002Token.initialize.selector,
            abi.encode(
                "MEP1002Token",
                "MEP1002",
                namingTokenAddr)
        ));
        MEP1002NamingToken(namingTokenAddr).setController(addr, true);
        mep1002Token = MEP1002Token(addr);
    }

    function deployLPWAN() private  {
        address addr =  deployProxy("LPWAN", address(new ProxiedLPWAN()), bytes.concat(
            LPWAN.initialize.selector,
            abi.encode(
                "LPWAN",
                "LPWAN")
        ));
        lpwan = LPWAN(addr);
        lpwan.setMEP1004Addr(address(mep1004Token));
    }

    function deployProxy(string memory name, address implementation, bytes memory data)
    private
    returns (address proxy)
    {
        proxy = address(new UUPSProxy(implementation, address(this), data));

//        console2.log(name, "(impl) ->", implementation);
//        console2.log(name, "(proxy) ->", proxy);
    }
}