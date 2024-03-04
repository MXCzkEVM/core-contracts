pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/ERC6551/ERC6551Registry.sol";
import "../contracts/ERC6551/ERC6551AccountImplementation.sol";
import {MEP1002Token, ProxiedMEP1002Token} from "../contracts/token/MEP1002Token.sol";
import {MEP1004Token, ProxiedMEP1004Token} from "../contracts/token/MEP1004Token.sol";
import "../contracts/token/MEP1002NamingToken.sol";
import "../contracts/token/MEP2542AchievementERC1155NFT.sol";



contract MEP2542AchievementERCNFT1155NFTTest is Test {

    MEP1002Token public mep1002Token;

    MEP1004Token public mep1004Token;

    MEP2542AchievementERC1155NFT public mep2542Achievement;

    ERC6551Registry public ERC6551RegistryProxy;

    ERC6551AccountImplementation public ERC6551AccountImpl;

    address public constant Alice = 0x10020FCb72e27650651B05eD2CEcA493bC807Ba4;
    address public constant Bob = 0x200708D76eB1B69761c23821809d53F65049939e;

    // test private key
    uint256 privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address testSigner = vm.addr(privateKey);

    function setUp() public {
        deployMEP1002Token();
        deployMEP1004Token();
        deployMEP2542AchievementERC1155NFT();
        deployERC6551Registry();

        ERC6551AccountImpl = new ERC6551AccountImplementation();
        mintMEP1004Token();
    }

    function testMintERC1155NFT() public {
        uint mep1004TokenId = 1;
        uint nftTokenId = 1;
        vm.startPrank(Alice);
        mep2542Achievement.mintWithPermit(mep1004TokenId, Alice, nftTokenId, getSignedPermit(mep1004TokenId, nftTokenId));
        assertEq(mep2542Achievement.balanceOf(Alice, 1), 1);

    }

    function testMintERC1155NFTShouldRevert() public {
        uint mep1004TokenId = 1;
        uint nftTokenId = 1;
        vm.startPrank(Alice);
        bytes memory signature = getSignedPermit(mep1004TokenId, nftTokenId);
        mep2542Achievement.mintWithPermit(mep1004TokenId, Alice, nftTokenId, signature);


        vm.expectRevert(Minted.selector);
        mep2542Achievement.mintWithPermit(mep1004TokenId, Alice, nftTokenId, signature);
        assertEq(mep2542Achievement.balanceOf(Alice, 1), 1);

        vm.startPrank(Bob);
        vm.expectRevert(ERC721NotApprovedOrOwner.selector);
        mep2542Achievement.mintWithPermit(mep1004TokenId, Bob, nftTokenId, signature);
    }

    function getSignedPermit(uint mep1004TokenId, uint nftTokenId) private returns(bytes memory) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                mep2542Achievement.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(mep2542Achievement.PERMIT_TYPEHASH(), mep1004TokenId, testSigner, Alice, nftTokenId))
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        return abi.encodePacked(r, s, v);
    }

    function mintMEP1004Token() private {
        string memory sncode = string(abi.encodePacked("M2XTEST111"));
        address owner = Alice;
        mep1004Token.mint(owner, sncode,  609771860061585407, "TEST");
    }


    function deployMEP2542AchievementERC1155NFT() private {
        address mep2542AchievementAddr = deployProxy("MEP2542AchievementERC1155NFT", address(new ProxiedMEP2542AchievementERC1155NFT()), bytes.concat(
            MEP2542AchievementERC1155NFT.initialize.selector,
            abi.encode(
                address(mep1004Token),
                "MEP2542 Achievement NFT",
                "MEP2542Achievement",
                "", // uri
                testSigner //permit
            )
        ));
        MEP2542AchievementERC1155NFT(mep2542AchievementAddr).setController(testSigner,true);
        mep2542Achievement = MEP2542AchievementERC1155NFT(mep2542AchievementAddr);
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


    function deployERC6551Registry() private {
        ERC6551RegistryProxy = ERC6551Registry(deployProxy("ERC6551Registry", address(new ProxiedERC6551Registry()), ""));
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