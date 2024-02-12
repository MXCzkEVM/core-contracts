// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";
import {ReentrancyGuard} from "./libs/ReentrancyGuard.sol";
import {LibAddress} from "./libs/LibAddress.sol";
import {IERC6551Registry} from "./interfaces/IERC6551Registry.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SSTORE2} from "./libs/sstore2/SSTORE2.sol";
import {MEP1004Token} from "./token/MEP1004Token.sol";
import {SignatureCheckerUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import {SensorToken} from "./token/SensorToken.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


interface TreasuryApproveToken {
    function approveToken(address token, address spender, uint amount) external returns (bool);
}

error RewardExpired();
error InvalidLength();
error InvalidOrder();
error InvalidTokenOwnership();
error AlreadyClaim();
error InvalidProof();
error TokenNotFound();
error TokenExist();
error TokenExceeds();
error TransferFailed();
error InvalidSignature();
error InvalidEpochNumber();
error SensorBalanceRequired();

contract MEP2542 is ControllableUpgradeable, ReentrancyGuard {

    using LibAddress for address;

    event ReleaseEpoch(uint indexed epochNumber, bytes32 indexed rewardMerkleRoot, address onlineStatusPointer);

    event ClaimedReward(address indexed miner, uint indexed epochNumber, RewardInfo rewardInfo);

    event BulkClaimedReward(address indexed miner, uint[] epochIds, RewardInfo[] rewardInfos);

    struct RewardInfo {
        address[] token;
        uint[] amount;
    }

    struct RewardTokenInfo {
        address token;
        address permitOwner; // zero address no need to permit
        uint amountPerEpoch;
    }

    struct ProofArray {
        bytes32[] proofs;
    }

    address public treasury;

    IERC6551Registry public ERC6551Registry;

    MEP1004Token public MEP1004Token_;

    SensorToken public sensorToken;

    address public ERC6551AccountImplAddr;

    uint public maxSelectToken;

    uint public epochExpiredTime;

    uint public currentEpoch;

    RewardTokenInfo[] public rewardTokens;

    mapping(uint => bytes32) public rewardMerkleRoots;

    mapping(uint => uint) public epochReleaseTime;

    mapping(address => mapping(uint => bool)) private _minerClaimedEpoch;

    mapping(uint => address) private minerEpochOnlineStatusPointer;

    mapping (address => address[]) private userSelectedToken;

    mapping(address => mapping(uint => bytes32)) private minerClaimedEpoch;

    address public claimVerifier;

    uint[34] private __gap;

    function initialize(
        address _treasury,
        address _ERC6551Registry,
        address _ERC6551AccountImplAddr,
        address _MEP1004Addr,
        address _sensorToken,
        uint _epochExpiredTime,
        uint _maxSelectToken
    ) external initializer {
        __Controllable_init();

        treasury = _treasury;
        ERC6551Registry = IERC6551Registry(_ERC6551Registry);
        ERC6551AccountImplAddr = _ERC6551AccountImplAddr;
        MEP1004Token_ = MEP1004Token(_MEP1004Addr);
        sensorToken = SensorToken(_sensorToken);
        maxSelectToken = _maxSelectToken;
        epochExpiredTime = _epochExpiredTime;
    }

    function PERMIT_TYPEHASH() public pure returns (bytes32) {
        return keccak256("Permit(address owner,address spender)");
    }

    function CLAIM_PERMIT_TYPEHASH() public pure returns (bytes32) {
        return keccak256("Permit(bytes32 detailHash,address owner,address spender)");
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _computeDomainSeparator();
    }

    function claimRewards(uint MEP1004TokenId, address to, ProofArray[] calldata proofs, uint[] calldata epochIds, RewardInfo[] calldata rewards) nonReentrant external {
        if(proofs.length != epochIds.length || proofs.length != rewards.length || proofs.length == 0) {
            revert InvalidLength();
        }
        address _ERC6551Account = _getMEP1004TokenERC6551Account(MEP1004TokenId);
        if(_msgSender() != _ERC6551Account) {
            revert InvalidTokenOwnership();
        }
        // make sure order
        for(uint i = 1;i < epochIds.length;i++) {
            if(epochIds[i] < epochIds[i-1]) {
                revert InvalidOrder();
            }
        }

        if(epochReleaseTime[epochIds[0]] + epochExpiredTime < block.timestamp) {
            revert RewardExpired();
        }

        // claimed record
        RewardInfo memory totalRewardInfo = RewardInfo(new address[](rewardTokens.length + 1), new uint[](rewardTokens.length + 1)); // +1 for sensor token
        for(uint i = 0; i < rewardTokens.length; i++) {
            totalRewardInfo.token[i] = rewardTokens[i].token;
        }
        totalRewardInfo.token[rewardTokens.length] = address(sensorToken);

        bytes32 bitMap = minerClaimedEpoch[_ERC6551Account][epochIds[0] / 256];
        for (uint i = 0; i < proofs.length; i++) {
            uint byteIndex = epochIds[i] % 256 / 8;
            uint bitIndex = epochIds[i] % 8;

            if(i > 0 && epochIds[i] / 256 != epochIds[i-1] / 256) {
                bitMap = minerClaimedEpoch[_ERC6551Account][epochIds[i] / 256];
            }

            // claimed
            if (bitMap & (bytes32(uint(1)) << (byteIndex * 8) + bitIndex) != bytes32(0)) {
                revert AlreadyClaim();
            }

            bytes32 rewardHash = keccak256(abi.encode(MEP1004TokenId, epochIds[i], rewards[i]));
            if (!_verify(_ERC6551Account,proofs[i].proofs, rewardMerkleRoots[epochIds[i]], rewardHash)) {
                revert InvalidProof();
            }
            for (uint j = 0; j < rewards[i].token.length; j++) {
                for(uint k = 0; k < totalRewardInfo.token.length; k++) {
                    if (totalRewardInfo.token[k] == rewards[i].token[j]) {
                        totalRewardInfo.amount[k] += rewards[i].amount[j];
                        break;
                    }
                }
            }
            bitMap |= bytes32(uint(1)) << (byteIndex * 8 + bitIndex);
            if(i != epochIds.length - 1) {
                if(epochIds[i] / 256 != epochIds[i+1] / 256) {
                    // update bitMap
                    minerClaimedEpoch[_ERC6551Account][epochIds[i] / 256] = bitMap;
                }
            }
        }
        minerClaimedEpoch[_ERC6551Account][epochIds[epochIds.length - 1] / 256] = bitMap;
        emit BulkClaimedReward(_msgSender(), epochIds, rewards);

        for (uint i = 0; i < totalRewardInfo.token.length; i++) {
            if(totalRewardInfo.amount[i] != 0) {
                if(!IERC20(totalRewardInfo.token[i]).transferFrom(treasury, to, totalRewardInfo.amount[i])) {
                    revert TransferFailed();
                }
            }
        }
    }

    function verifyMerkleProof(uint MEP1004TokenId, ProofArray[] calldata proofs,uint[] calldata epochIds, RewardInfo[] calldata rewards) external view returns(bool) {
        address _ERC6551Account = _getMEP1004TokenERC6551Account(MEP1004TokenId);
        for (uint i = 0; i < proofs.length; i++) {
            bytes32 rewardHash = keccak256(abi.encode(MEP1004TokenId, epochIds[i], rewards[i]));
            if (!_verify(_ERC6551Account,proofs[i].proofs, rewardMerkleRoots[epochIds[i]], rewardHash)) {
                return false;
            }
        }
        return true;
    }

    function getRewardHash(uint MEP1004TokenId, uint[] calldata epochIds, RewardInfo[] calldata rewards) public view returns(bytes32) {
        return keccak256(abi.encode(MEP1004TokenId,epochIds,rewards));
    }

    function claimRewardsVerified(uint MEP1004TokenId, address to, uint[] calldata epochIds, RewardInfo[] calldata rewards,bytes calldata signature) nonReentrant external {
        if(epochIds.length == 0 || rewards.length == 0) {
            revert InvalidLength();
        }
        address _ERC6551Account = _getMEP1004TokenERC6551Account(MEP1004TokenId);
        if(_msgSender() != _ERC6551Account) {
            revert InvalidTokenOwnership();
        }
        // make sure order
        for(uint i = 1;i < epochIds.length;i++) {
            if(epochIds[i] < epochIds[i-1]) {
                revert InvalidOrder();
            }
        }

        if(epochReleaseTime[epochIds[0]] + epochExpiredTime < block.timestamp) {
            revert RewardExpired();
        }

        bytes32 permitHash = _claimPermitHash(getRewardHash(MEP1004TokenId, epochIds, rewards), claimVerifier, _ERC6551Account);
        // verified by offchain verifier and merge rewardInfos
        if (!SignatureCheckerUpgradeable.isValidSignatureNow(claimVerifier, permitHash, signature)) {
            revert InvalidSignature();
        }

        bytes32 bitMap = minerClaimedEpoch[_ERC6551Account][epochIds[0] / 256];
        for (uint i = 0; i < epochIds.length; i++) {
            uint byteIndex = epochIds[i] % 256 / 8;
            uint bitIndex = epochIds[i] % 8;

            if(i > 0 && epochIds[i] / 256 != epochIds[i-1] / 256) {
                bitMap = minerClaimedEpoch[_ERC6551Account][epochIds[i] / 256];
            }

            // claimed
            if (bitMap & (bytes32(uint(1)) << (byteIndex * 8) + bitIndex) != bytes32(0)) {
                revert AlreadyClaim();
            }

            bitMap |= bytes32(uint(1)) << (byteIndex * 8 + bitIndex);
            if(i != epochIds.length - 1) {
                if(epochIds[i] / 256 != epochIds[i+1] / 256) {
                    // update bitMap
                    minerClaimedEpoch[_ERC6551Account][epochIds[i] / 256] = bitMap;
                }
            }
        }

        minerClaimedEpoch[_ERC6551Account][epochIds[epochIds.length - 1] / 256] = bitMap;
        emit BulkClaimedReward(_msgSender(), epochIds, rewards);

        for (uint i = 0; i < rewards[0].token.length; i++) {
            if(rewards[0].amount[i] != 0) {
                if(!IERC20(rewards[0].token[i]).transferFrom(treasury, to, rewards[0].amount[i])) {
                    revert TransferFailed();
                }
            }
        }
    }

    function selectToken(address[] memory tokens, bytes[] calldata signatures) external {
        if(tokens.length != signatures.length) {
            revert InvalidLength();
        }
        if(tokens.length > maxSelectToken || tokens.length > rewardTokens.length) {
            revert TokenExceeds();
        }
        if(sensorToken.balanceOf(msg.sender) == 0) {
            revert SensorBalanceRequired();
        }
        uint foundNum;
        bool found;
        uint j;
        for(uint i = 0; i < rewardTokens.length; i++) {
            found = false;
            j = 0;
            while(j < tokens.length) {
                if(rewardTokens[i].token == tokens[j]) {
                    found = true;
                    break;
                }
                ++j;
            }
            if(!found) {
                continue;
            }
            if(rewardTokens[i].permitOwner == address(0)) {
                ++foundNum;
                continue;
            }
            bytes32 _hash = _permitHash(rewardTokens[i].permitOwner, msg.sender);
            if (!SignatureCheckerUpgradeable.isValidSignatureNow(rewardTokens[i].permitOwner, _hash, signatures[j])) {
                revert InvalidSignature();
            }
            ++foundNum;
            if(foundNum == tokens.length) {
                break;
            }
        }
        if(foundNum != tokens.length) {
            revert TokenExceeds();
        }

        userSelectedToken[msg.sender] = tokens;
    }

    function getMinerOnlineStatus(uint epochNumber, uint MEP1004TokenId) external view returns (bool) {
        if(MEP1004TokenId > MEP1004Token_.totalSupply()) {
            return false;
        }
        bytes memory bitMap = SSTORE2.read(minerEpochOnlineStatusPointer[epochNumber]);
        if(MEP1004TokenId > bitMap.length * 8) {
            return false;
        }
        uint byteIndex = MEP1004TokenId / 8;
        uint bitIndex = MEP1004TokenId % 8;
        if (bitIndex == 0 && byteIndex > 0) {
            byteIndex -= 1;
        }
        return (uint8(bitMap[byteIndex]) & uint8(1 << bitIndex)) != 0;
    }

    function getMinerClaimedEpochs(uint MEP1004TokenId, uint[] calldata epochNumbers) external view returns (bool[] memory) {
        bool[] memory result = new bool[](epochNumbers.length);
        for (uint i = 0; i < epochNumbers.length; i++) {
            bytes32 bitMap = minerClaimedEpoch[_getMEP1004TokenERC6551Account(MEP1004TokenId)][epochNumbers[i] / 256];
            uint bitPosition = epochNumbers[i] % 256;
            result[i] = (bitMap & (bytes32(uint(1)) << bitPosition)) != bytes32(0);
        }
        return result;
    }

    function releaseEpoch(uint epochNumber, bytes32 rewardMerkleRoot, bytes memory statusBitMap) external onlyController {
        if(epochNumber != currentEpoch + 1) {
            revert InvalidEpochNumber();
        }
        currentEpoch = epochNumber;
        epochReleaseTime[epochNumber] = block.timestamp;
        rewardMerkleRoots[epochNumber] = rewardMerkleRoot;
        address pointer = SSTORE2.write(statusBitMap);
        minerEpochOnlineStatusPointer[epochNumber] = pointer;
        emit ReleaseEpoch(epochNumber, rewardMerkleRoot, pointer);
    }

    function setMaxSelectToken(uint _maxSelectToken) external onlyController {
        maxSelectToken = _maxSelectToken;
    }

    function addRewardToken(address token, address permitOwner,uint amountPerEpoch) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].token == token) {
                revert TokenExist();
            }
        }
        TreasuryApproveToken(treasury).approveToken(token, address(this), type(uint).max);
        rewardTokens.push(RewardTokenInfo(token, permitOwner, amountPerEpoch));
    }

    function removeRewardToken(address token) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].token == token) {
                TreasuryApproveToken(treasury).approveToken(token, address(this), 0);
                rewardTokens[i] = rewardTokens[rewardTokens.length - 1];
                rewardTokens.pop();
                return;
            }
        }
        revert TokenNotFound();
    }

    function setRewardToken(address token, address permitOwner, uint amountPerEpoch) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].token == token) {
                rewardTokens[i] = RewardTokenInfo(token, permitOwner, amountPerEpoch);
                return;
            }
        }
    }

    function setEpochExpiredTime(uint _epochExpiredTime) external onlyController {
        epochExpiredTime = _epochExpiredTime;
    }

    function setClaimVerifier(address _verifier) external onlyController {
        claimVerifier = _verifier;
    }

    function getUserSelectedToken(address account) external view returns (address[] memory) {
        address[] memory tokens = new address[](rewardTokens.length > userSelectedToken[account].length ? rewardTokens.length : userSelectedToken[account].length);
        uint tokenCount;
        for (uint i = 0; i < rewardTokens.length; i++) {
            for (uint j = 0; j < userSelectedToken[account].length; j++) {
                if (rewardTokens[i].token == userSelectedToken[account][j]) {
                    tokens[tokenCount] = rewardTokens[i].token;
                    tokenCount++;
                    
                    break;
                }
            }
        }
        address [] memory result = new address[](tokenCount);
        for (uint i = 0; i < tokenCount; i++) {
            result[i] = tokens[i];
        }
        return result;
    }

    function getRewardTokenInfo() external view returns (RewardTokenInfo[] memory) {
        return rewardTokens;
    }

    function _permitHash(
        address _owner,
        address _spender
    ) private returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH(), _owner, _spender))
            )
        );
    }


    function _claimPermitHash(
        bytes32 _detailHash,
        address _owner,
        address _spender
    ) private returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(CLAIM_PERMIT_TYPEHASH(), _detailHash, _owner, _spender))
            )
        );
    }

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
                keccak256(abi.encodePacked("MEP2542")),
                keccak256(abi.encodePacked("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function _getMEP1004TokenERC6551Account(uint MEP1004TokenId) private view returns (address account) {
        return ERC6551Registry.account(ERC6551AccountImplAddr, block.chainid, address(MEP1004Token_), MEP1004TokenId, 0);
    }

    function _verify(address account, bytes32[] calldata proof, bytes32 merkleRoot, bytes32 rewardHash) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(account, rewardHash));
        bool result = MerkleProof.verifyCalldata(proof, merkleRoot, leaf);
        return result;
    }

}

contract ProxiedMEP2542 is Proxied, UUPSUpgradeable, MEP2542 {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
