pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/proxy/UUPSProxy.sol";
import "../contracts/token/SensorToken.sol";
import "../contracts/ERC6551/ERC6551Registry.sol";
import "../contracts/ERC6551/ERC6551AccountImplementation.sol";
import "../contracts/MEP2542.sol";
import "../contracts/token/MEP1004Token.sol";
import "../contracts/token/XMXCToken.sol";
import "../contracts/token/XMigrateToken.sol";
import "../contracts/LPWAN.sol";
import "../contracts/token/Gin1689Coin.sol";
import "../contracts/token/MaxisCoin.sol";
import "../contracts/token/CrabCoin.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../contracts/token/MEP1002NamingToken.sol";
import {MEP1002Token, ProxiedMEP1002Token} from "../contracts/token/MEP1002Token.sol";


contract MEP2542Test is Test {

    LPWAN public lpwan;

    MEP1002Token public mep1002Token;

    MEP1004Token public mep1004Token;

    SensorToken public sensorToken;

    Gin1689Coin public gin1689Coin;

    CrabCoin public crabCoin;

    MaxisCoin public maxisCoin;

    MEP2542 public mep2542;

    ERC6551Registry public ERC6551RegistryProxy;

    ERC6551AccountImplementation public ERC6551AccountImpl;

    address public constant Alice = 0x10020FCb72e27650651B05eD2CEcA493bC807Ba4;
    address public constant Bob = 0x200708D76eB1B69761c23821809d53F65049939e;


    function setUp() public {
        deployMEP1002Token();
        deployMEP1004Token();
        deployLPWAN();
        deploySensorToken();
        deployISOCoin();
        deployERC6551Registry();

        ERC6551AccountImpl = new ERC6551AccountImplementation();

        uint epochTime = 4 hours;
        uint _epochExpiredTime = epochTime * 6;
        uint amount = 16666 * 1e18;
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

        lpwan.setController(address(mep2542), true);
        lpwan.approveToken(address(sensorToken), address(mep2542), type(uint).max);
        sensorToken.transfer(address(lpwan), 1e25);

        mep2542.addRewardToken(address(gin1689Coin), address(0), amount);
        mep2542.addRewardToken(address(crabCoin), address(0), amount);

        mintMEP1004Token();
    }

    function testAddDuplicateRewardToken() public {
        // add duplicate reward token
        vm.expectRevert(TokenExist.selector);
        mep2542.addRewardToken(address(gin1689Coin), address(0), 1000);
        return;
    }

    function testRemoveRewardToken() public {
        mep2542.removeRewardToken(address(gin1689Coin));
        assertEq(mep2542.getRewardTokenInfo().length, 1);
    }

    function testAddRewardToken() public {
        mep2542.addRewardToken(address(maxisCoin), address(0), 1000);
        assertEq(mep2542.getRewardTokenInfo().length, 3);
    }

    function testUpdateRewardToken() public {
        mep2542.setRewardToken(address(crabCoin), address(0), 1000);
        assertEq(mep2542.getRewardTokenInfo()[1].amountPerEpoch, 1000);
    }

    function testGetRewardToken() public {
        MEP2542.RewardTokenInfo[] memory rewardTokensInfos = mep2542.getRewardTokenInfo();
        assertEq(rewardTokensInfos.length, 2);
        assertEq(rewardTokensInfos[0].token, address(gin1689Coin));
        assertEq(rewardTokensInfos[1].token, address(crabCoin));
    }

    function testRevertSelectTokenWithoutSensor() public {

        address[] memory tokens = new address[](1);
        tokens[0] = address(gin1689Coin);
        bytes[] memory signature = new bytes[](1);

        vm.startPrank(Alice);
        vm.expectRevert(SensorBalanceRequired.selector);
        mep2542.selectToken(tokens, signature);
        vm.stopPrank();
    }

    function testRevertSelectTokenExceedMaxSelect() public {
        address[] memory tokens = new address[](3);
        tokens[0] = address(gin1689Coin);
        tokens[1] = address(crabCoin);
        tokens[2] = address(maxisCoin);
        bytes[] memory signature = new bytes[](3);

        vm.startPrank(Alice);
        vm.expectRevert(TokenExceeds.selector);
        mep2542.selectToken(tokens, signature);
        vm.stopPrank();
    }

    function testSelectTokenWithNoNeedSignature() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(gin1689Coin);
        tokens[1] = address(crabCoin);

        bytes[] memory signature = new bytes[](2);

        mep2542.selectToken(tokens, signature);
        assertEq(mep2542.getUserSelectedToken(address(this)).length, 2);

    }

    function testRevertSelectTokenWithNoSignature() public {
        mep2542.addRewardToken(address(maxisCoin), address(Alice), 1000);
        address[] memory tokens = new address[](1);
        tokens[0] = address(maxisCoin);

        vm.expectRevert(InvalidSignature.selector);
        mep2542.selectToken(tokens, new bytes[](1));

        assertEq(mep2542.getUserSelectedToken(Alice).length, 0);
    }

    function testSelectTokenWithSignature() public {
            // test private key
        uint256 privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address testSigner = vm.addr(privateKey);
        mep2542.addRewardToken(address(maxisCoin), testSigner, 1000);
        address[] memory tokens = new address[](1);
        tokens[0] = address(maxisCoin);

        bytes[] memory signature = new bytes[](1);
        bytes32 hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                mep2542.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(mep2542.PERMIT_TYPEHASH(), testSigner, address(this)))
            )
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        signature[0] = abi.encodePacked(r, s, v);

        mep2542.selectToken(tokens, signature);
    }

    function testReleaseEpoch() public {
        mep2542.releaseEpoch(1, bytes32(0), new bytes(0));
        mep2542.releaseEpoch(2, bytes32(0), new bytes(0));
    }

    function testRevertReleaseWrongEpochNumber() public {
        mep2542.releaseEpoch(1, bytes32(0), new bytes(0));

        // same epoch
        vm.expectRevert(InvalidEpochNumber.selector);
        mep2542.releaseEpoch(1, bytes32(0), new bytes(0));

        vm.expectRevert(InvalidEpochNumber.selector);
        mep2542.releaseEpoch(3, bytes32(0), new bytes(0));

    }

    function testClaimRewards() public {
//        mep2542.releaseEpoch(1, bytes32(0), new bytes(0));
//        mep2542.claimReward(1, address(gin1689Coin));
//        mep2542.claimReward(1, address(crabCoin));
    }


    function getTestRewardMerkleRoot(uint epochNumber) private view returns (bytes32) {
        bytes32[] memory leaves = new bytes32[](6);
        bytes32 rewardhash1 = keccak256(abi.encode(1, epochNumber, getTestRewardInfo(100)));
        bytes32 rewardhash2 = keccak256(abi.encode(2, epochNumber, getTestRewardInfo(110)));
        bytes32 rewardhash3 = keccak256(abi.encode(3, epochNumber, getTestRewardInfo(110)));
        // bob
        bytes32 rewardhash4 = keccak256(abi.encode(4, epochNumber, getTestRewardInfo(100)));

        bytes32 rewardhash5 = keccak256(abi.encode(5, epochNumber, getTestRewardInfo(110)));
        bytes32 rewardhash6 = keccak256(abi.encode(6, epochNumber, getTestRewardInfo(110)));

        bytes32[] memory level1 = new bytes32[](3);


        address account = ERC6551RegistryProxy.account(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), 4, 0);

        leaves[0] = keccak256(abi.encode(Alice, rewardhash1));
        leaves[1] = keccak256(abi.encode(Alice, rewardhash2));
        leaves[2] = keccak256(abi.encode(Alice, rewardhash3));
        leaves[3] = keccak256(abi.encode(account, rewardhash4));
        leaves[4] = keccak256(abi.encode(Alice, rewardhash5));
        leaves[5] = keccak256(abi.encode(Alice, rewardhash6));

        level1[0] = _hashPair(leaves[0], leaves[1]);
        level1[1] = _hashPair(leaves[2], leaves[3]);
        level1[2] = _hashPair(leaves[4], leaves[5]);

        bytes32[] memory level2 = new bytes32[](2);

        level2[0] = _hashPair(level1[0], level1[1]);
        level2[1] = _hashPair(level1[2], level1[2]);

        return _hashPair(level2[0], level2[1]);
    }

    function testRewardInfo() public  {
        uint tokenId = 1;
        uint epochNumber = 2;
        MEP2542.RewardInfo memory reward;
        reward.token = new address[](1);
        reward.amount = new uint256[](1);
    
        reward.token[0] = address(0x4c313363116cdfFA82B48225a634C359f8681aA5);
        reward.amount[0] = 0;

        console2.log("reward hash");
        console2.logBytes32(keccak256(abi.encode(reward)));

        bytes32 rewardhash = keccak256(abi.encode(tokenId, epochNumber, reward));
        console2.log("reward");
        console2.logBytes32(rewardhash);
    
    }

    function testAbiEncode() public {
        console2.logBytes(abi.encode("test"));
    }

    function getTestRewardMerkleProof(uint epochNumber) private view returns (bytes32[] memory) {
        // ID 15 online
        // ID 4 reward for Bob ERC6551
        bytes32[] memory leaves = new bytes32[](6);
        bytes32 rewardhash1 = keccak256(abi.encode(1, epochNumber, getTestRewardInfo(100)));
        bytes32 rewardhash2 = keccak256(abi.encode(2, epochNumber, getTestRewardInfo(110)));
        bytes32 rewardhash3 = keccak256(abi.encode(3, epochNumber, getTestRewardInfo(110)));
        // Bob
        bytes32 rewardhash4 = keccak256(abi.encode(4, epochNumber, getTestRewardInfo(100)));

        bytes32 rewardhash5 = keccak256(abi.encode(5, epochNumber, getTestRewardInfo(110)));
        bytes32 rewardhash6 = keccak256(abi.encode(6, epochNumber, getTestRewardInfo(110)));

        bytes32[] memory level1 = new bytes32[](3);

        address account = ERC6551RegistryProxy.account(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), 4, 0);

        leaves[0] = keccak256(abi.encode(Alice, rewardhash1));
        leaves[1] = keccak256(abi.encode(Alice, rewardhash2));
        leaves[2] = keccak256(abi.encode(Alice, rewardhash3));
        leaves[3] = keccak256(abi.encode(account, rewardhash4));
        leaves[4] = keccak256(abi.encode(Alice, rewardhash5));
        leaves[5] = keccak256(abi.encode(Alice, rewardhash6));

        level1[0] = _hashPair(leaves[0], leaves[1]);
        level1[1] = _hashPair(leaves[2], leaves[3]);
        level1[2] = _hashPair(leaves[4], leaves[5]);

        bytes32[] memory level2 = new bytes32[](2);

        level2[0] = _hashPair(level1[0], level1[1]);
        level2[1] = _hashPair(level1[2], level1[2]);

        bytes32[] memory proof = new bytes32[](3);
        proof[0] = leaves[2];
        proof[1] = level1[0];
        proof[2] = level2[1];

        return proof;
    }

    function getTestRewardMerkleLeaf(uint epochNumber) private view returns (bytes32) {
        uint MEP1004TokenId = 4;
        bytes32 rewardhash = keccak256(abi.encode(MEP1004TokenId, epochNumber, getTestRewardInfo(100)));
        address account = ERC6551RegistryProxy.account(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), MEP1004TokenId, 0);
        return keccak256(abi.encode(account, rewardhash));
    }



    function testVerifyMerkleRoot() public {
        assertEq(MerkleProof.verify(getTestRewardMerkleProof(1), getTestRewardMerkleRoot(1), getTestRewardMerkleLeaf(1)), true);
    }

    function getTestRewardInfo(uint amount) private view returns (MEP2542.RewardInfo memory reward){
        reward.token = new address[](3);
        reward.token[0] = address(gin1689Coin);
        reward.token[1] = address(crabCoin);
        reward.token[2] = address(sensorToken);
        reward.amount = new uint256[](3);
        reward.amount[0] = amount;
        reward.amount[1] = amount;
        reward.amount[2] = amount;
    }

    function testGetOnlineStatus() public {
        releaseTestEpoch(1);
        assertEq(mep2542.getMinerOnlineStatus(1, 15), true);
        assertEq(mep2542.getMinerOnlineStatus(1, 16), false);
    }

    function releaseTestEpoch(uint epochNumber) private {
        // 15 online
        // 4 reward for Bob ERC6551
        bytes memory bitMap = new bytes(2);
        uint MEP1004TokenID = 15;
        uint byteIndex = MEP1004TokenID / 8;
        uint bitIndex = MEP1004TokenID % 8;

        bitMap[byteIndex] |= bytes1(uint8((1 << bitIndex)));

        mep2542.releaseEpoch(epochNumber, getTestRewardMerkleRoot(epochNumber), bitMap);
    }

    function mintMEP1004Token() private {
        uint256[] memory tokenIDs = new uint256[](16);
        tokenIDs[0] =  609771860061585407;
        tokenIDs[1] =  609131402104930303;
        tokenIDs[2] =  609754155199758335;
        tokenIDs[3] =  609756453091147775;
        tokenIDs[4] =  609765418197843967;
        tokenIDs[5] =  609129667743449087;
        tokenIDs[6] =  611329069308444671;
        tokenIDs[7] =  610449981274324991;
        tokenIDs[8] =  609756488272969727;
        tokenIDs[9] =  609129667743449087;
        tokenIDs[10] = 609129667743449087;
        tokenIDs[11] = 609771860128694271;
        tokenIDs[12] = 609747808647380991;
        tokenIDs[13] = 609763106565914623;
        tokenIDs[14] = 609757710879031295;
        tokenIDs[15] = 611281186630664191;

        for(uint i = 0; i < 16; i++) {
            string memory sncode = string(abi.encodePacked("M2XTEST", Strings.toString(i)));
            address owner = Alice;
            // tokenID 4 belong to Bob
            if(i == 3) {
                owner = Bob;
            }
            mep1004Token.mint(owner, sncode,  tokenIDs[i], "TEST");
        }
    }

    function testERC6551ClaimRewardWithProof() public {
        releaseTestEpoch(1);
        uint mep1004TokenId = 4;
        address account = ERC6551RegistryProxy.createAccount(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), mep1004TokenId, 0, "");
        MEP2542.ProofArray[] memory proofs = new MEP2542.ProofArray[](1);
        proofs[0].proofs = getTestRewardMerkleProof(1);
        uint[] memory epochIds  = new uint[](1);
        epochIds[0] = 1;

        MEP2542.RewardInfo[] memory rewards = new MEP2542.RewardInfo[](1);
        rewards[0] = getTestRewardInfo(100);

        vm.startPrank(Bob);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
        assertEq(sensorToken.balanceOf(account), 100);
        // assert reward balance
        assertEq(gin1689Coin.balanceOf(account), 100);
        assertEq(crabCoin.balanceOf(account), 100);

        vm.startPrank(Bob);
        vm.expectRevert(AlreadyClaim.selector);

        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
    }

    function testERC6551RevertClaimRewardWithNoProof() public {
        releaseTestEpoch(1);
        uint mep1004TokenId = 4;
        address account = ERC6551RegistryProxy.createAccount(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), mep1004TokenId, 0, "");
        MEP2542.ProofArray[] memory proofs = new MEP2542.ProofArray[](1);
        uint[] memory epochIds  = new uint[](1);
        epochIds[0] = 1;

        MEP2542.RewardInfo[] memory rewards = new MEP2542.RewardInfo[](1);
        rewards[0] = getTestRewardInfo(100);

        vm.startPrank(Bob);
        vm.expectRevert(InvalidProof.selector);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
    }


    function testERC6551ClaimMultiEpochReward() public {
        releaseTestEpoch(1);
        releaseTestEpoch(2);

        uint mep1004TokenId = 4;
        address account = ERC6551RegistryProxy.createAccount(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), mep1004TokenId, 0, "");
        MEP2542.ProofArray[] memory proofs = new MEP2542.ProofArray[](2);
        proofs[0].proofs = getTestRewardMerkleProof(1);
        proofs[1].proofs = getTestRewardMerkleProof(2);
        uint[] memory epochIds  = new uint[](2);
        epochIds[0] = 1;
        epochIds[1] = 2;

        MEP2542.RewardInfo[] memory rewards = new MEP2542.RewardInfo[](2);
        rewards[0] = getTestRewardInfo(100);
        rewards[1] = getTestRewardInfo(100);

        bool[] memory results  = mep2542.getMinerClaimedEpochs(mep1004TokenId,epochIds);
        assertEq(results[0], false);

        vm.prank(Bob);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
        // assert reward balance
        assertEq(gin1689Coin.balanceOf(account), 200);
        assertEq(crabCoin.balanceOf(account), 200);

        // assert results
        results  = mep2542.getMinerClaimedEpochs(mep1004TokenId,epochIds);
        assertEq(results[0], true);
        assertEq(results[1], true);

        // test bytes32 bitmap switch
        for(uint i = 3; i <= 1000; i++) {
            releaseTestEpoch(i);
        }
        vm.startPrank(Bob);

        for (uint i = 3; i < 1000; i+=2) {
            epochIds[0] = i;
            epochIds[1] = i+1;
            proofs[0].proofs = getTestRewardMerkleProof(i);
            proofs[1].proofs = getTestRewardMerkleProof(i+1);
            ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
                abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
            );
        }
        // claimed
        vm.expectRevert(AlreadyClaim.selector);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );

    }

    function testRevertClaimExpiredReward() public {
        releaseTestEpoch(1);

        // roll time
        vm.warp(block.timestamp + 2 days);
        uint mep1004TokenId = 4;
        address account = ERC6551RegistryProxy.createAccount(address(ERC6551AccountImpl), block.chainid, address(mep1004Token), mep1004TokenId, 0, "");
        MEP2542.ProofArray[] memory proofs = new MEP2542.ProofArray[](1);
        proofs[0].proofs = getTestRewardMerkleProof(1);
        uint[] memory epochIds  = new uint[](1);
        epochIds[0] = 1;

        MEP2542.RewardInfo[] memory rewards = new MEP2542.RewardInfo[](1);
        rewards[0] = getTestRewardInfo(100);

        vm.startPrank(Bob);
        vm.expectRevert(RewardExpired.selector);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
        vm.stopPrank();

        vm.prank(address(this));
        mep2542.setEpochExpiredTime(604800);

        vm.startPrank(Bob);
        ERC6551AccountImplementation(payable(account)).executeCall(address(mep2542), 0,
            abi.encodeWithSelector(mep2542.claimRewards.selector, mep1004TokenId, account, proofs, epochIds, rewards)
        );
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
    }

    function deploySensorToken() private {
        address[] memory specialAddresses = new address[](1);
        specialAddresses[0] = address(lpwan);
        address sensorTokenAddr = deployProxy("SensorToken", address(new ProxiedSensorToken()), bytes.concat(
            SensorToken.initialize.selector,
            abi.encode(
                specialAddresses,
                address(this)
            )
        ));
        sensorToken = SensorToken(sensorTokenAddr);
    }

    function deployISOCoin() private {
        address gin1689TokenAddr = deployProxy("Gin1689Coin", address(new ProxiedGin1689Coin()), bytes.concat(
            Gin1689Coin.initialize.selector,
            abi.encode(
                address(lpwan), // treasury
                address(this),
                300 // 3%
            )
        ));
        gin1689Coin = Gin1689Coin(gin1689TokenAddr);
        gin1689Coin.transfer(address(lpwan), 10000 * 1e18);

        address crabCoinAddr = deployProxy("CrabCoin", address(new ProxiedCrabCoin()), bytes.concat(
            CrabCoin.initialize.selector,
            abi.encode(
                address(lpwan), // treasury
                address(this),
                300 // 3%
            )
        ));
        crabCoin = CrabCoin(crabCoinAddr);
        crabCoin.transfer(address(lpwan), 10000 * 1e18);

        address maxisCoinAddr = deployProxy("MaxisCoin", address(new ProxiedMaxisCoin()), bytes.concat(
            MaxisCoin.initialize.selector,
            abi.encode(
                address(lpwan), // treasury
                address(this),
                300 // 3%
            )
        ));
        maxisCoin = MaxisCoin(maxisCoinAddr);
        maxisCoin.transfer(address(lpwan), 10000 * 1e18);
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

    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
    }

    function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }


}