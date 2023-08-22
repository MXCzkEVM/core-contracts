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


error RewardExpired();
error InvalidLength();
error InvalidTokenOwnership();
error AlreadyClaim();
error InvalidProof();
error TokenNotFound();
error TokenExist();
error TokenExceeds();
error TransferFailed();
error InvalidSignature();
error InvalidEpochNumber();

contract MEP1004Pool is ControllableUpgradeable, ReentrancyGuard {

    using LibAddress for address;

    event ReleaseEpoch(uint indexed epochNumber, bytes32 rewardMerkleRoot);

    event ClaimedReward(address indexed miner, uint latestEpochNumber);

    struct RewardInfo {
        address[] token;
        uint[] amount;
    }

    struct RewardTokenInfo {
        address token;
        address permitOwner;
        uint amountPerEpoch;
    }

    bytes32 private PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender)");

    uint256 private INITIAL_CHAIN_ID;

    bytes32 private INITIAL_DOMAIN_SEPARATOR;

    IERC6551Registry public ERC6551Registry;

    MEP1004Token public MEP1004Token_;

    address public ERC6551AccountImplAddr;

    uint public maxSelectToken;

    uint public epochExpiredTime;

    uint public currentEpoch;

    RewardTokenInfo[] public rewardTokens;

    mapping(uint => bytes32) public rewardMerkleRoots;

    mapping(uint => uint) public epochReleaseTime;

    mapping(address => uint) public minerClaimedEpoch;

    mapping(uint => address) private minerEpochOnlineStatusPointer;

    mapping (address => address[]) private userSelectedToken;

    function initialize(
        address _ERC6551Registry,
        address _ERC6551AccountImplAddr,
        address _MEP1004Addr,
        uint _epochExpiredTime,
        uint _maxSelectToken
    ) external initializer {
        ERC6551Registry = IERC6551Registry(_ERC6551Registry);
        ERC6551AccountImplAddr = _ERC6551AccountImplAddr;
        MEP1004Token_ = MEP1004Token(_MEP1004Addr);
        maxSelectToken = _maxSelectToken;
        epochExpiredTime = _epochExpiredTime;

        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_DOMAIN_SEPARATOR = _computeDomainSeparator();
        __Controllable_init();
    }


    function claimRewards(uint MEP1004TokenId, address to, bytes32[][] calldata proofs, uint[] calldata epochIds, RewardInfo[] calldata rewards) nonReentrant external {
        if(proofs.length != epochIds.length || proofs.length != rewards.length || proofs.length == 0) {
            revert InvalidLength();
        }
        if(msg.sender != _getMEP1004TokenERC6551Account(MEP1004TokenId)) {
            revert InvalidTokenOwnership();
        }

        uint tokenCount;

        address[] memory uniqueTokens = new address[](rewardTokens.length + 2); // +2 for $SENSOR and $XMXC
        uint[] memory totalAmounts = new uint[](rewardTokens.length + 2);
        uint latestEpochNumber;
        for (uint i = 0; i < proofs.length; i++) {
            if(epochIds[i] <= latestEpochNumber) {
                revert InvalidProof();
            }
            if(epochReleaseTime[epochIds[i]] + epochExpiredTime < block.timestamp) {
                revert RewardExpired();
            }

            bytes32 rewardHash = keccak256(abi.encode(MEP1004TokenId, epochIds[i], rewards[i]));
            if (!_verify(proofs[i], epochIds[i], rewardHash)) {
                revert InvalidProof();
            }

            for (uint j = 0; j < rewards[i].token.length; j++) {
                bool found = false;
                for (uint k = 0; k < tokenCount; k++) {
                    if (uniqueTokens[k] == rewards[i].token[j]) {
                        totalAmounts[k] += rewards[i].amount[j];
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    uniqueTokens[tokenCount] = rewards[i].token[j];
                    totalAmounts[tokenCount] = rewards[i].amount[j];
                    tokenCount++;
                }
            }
            latestEpochNumber = epochIds[i];
        }

        for (uint i = 0; i < tokenCount; i++) {
            if(IERC20(uniqueTokens[i]).transfer(to, totalAmounts[i])) {
                revert TransferFailed();
            }
        }

        minerClaimedEpoch[msg.sender] = latestEpochNumber;
        emit ClaimedReward(msg.sender, latestEpochNumber);
    }

    function selectToken(address[] memory tokens, bytes[] calldata signatures) external {
        if(tokens.length != signatures.length || tokens.length == 0) {
            revert InvalidLength();
        }
        for(uint i = 0; i < rewardTokens.length; i++) {
            bool found;
            for(uint j = 0; j < tokens.length; i++) {
                if(tokens[j] == rewardTokens[i].token) {
                    found = true;
                    break;
                }
            }
            if(!found) {
                revert TokenNotFound();
            }

            bytes32 _hash = _permitHash(rewardTokens[i].permitOwner, msg.sender);
            if (!SignatureCheckerUpgradeable.isValidSignatureNow(rewardTokens[i].permitOwner, _hash, signatures[i])) {
                revert InvalidSignature();
            }
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
        uint256 byteIndex = MEP1004TokenId / 8;
        uint256 bitIndex = MEP1004TokenId % 8;
        return (uint8(bitMap[byteIndex]) & (1 << bitIndex)) != 0;
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return block.chainid == INITIAL_CHAIN_ID ? INITIAL_DOMAIN_SEPARATOR : _computeDomainSeparator();
    }

    function releaseEpoch(uint epochNumber, bytes32 rewardMerkleRoot, bytes memory statusBitMap) external onlyController {
        if(epochNumber != currentEpoch + 1) {
            revert InvalidEpochNumber();
        }
        epochNumber++;
        currentEpoch = epochNumber;
        epochReleaseTime[epochNumber] = block.timestamp;
        rewardMerkleRoots[epochNumber] = rewardMerkleRoot;
        minerEpochOnlineStatusPointer[epochNumber] = SSTORE2.write(statusBitMap);
        emit ReleaseEpoch(epochNumber, rewardMerkleRoot);
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
        rewardTokens.push(RewardTokenInfo(token, permitOwner, amountPerEpoch));
    }

    function removeRewardToken(address token) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].token == token) {
                rewardTokens[i] = rewardTokens[rewardTokens.length - 1];
                rewardTokens.pop();
                return;
            }
        }
        revert TokenNotFound();
    }

    function setRewardTokenAmount(address token, address permitOwner, uint amountPerEpoch) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].token == token) {
                rewardTokens[i] = RewardTokenInfo(token, permitOwner, amountPerEpoch);
                return;
            }
        }
    }

    function getUserSelectedToken(address account) external view returns (address[] memory) {
        return userSelectedToken[account];
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
                keccak256(abi.encode(PERMIT_TYPEHASH, _owner, _spender))
            )
        );
    }

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("MEP1004Pool")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function _getMEP1004TokenERC6551Account(uint MEP1004TokenId) private view returns (address account) {
        return ERC6551Registry.account(ERC6551AccountImplAddr, block.chainid, address(MEP1004Token_), MEP1004TokenId, 0);
    }

    function _verify(bytes32[] calldata proof, uint epochId, bytes32 rewardHash) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, rewardHash));
        return MerkleProof.verify(proof, rewardMerkleRoots[epochId], leaf);
    }

}

contract ProxiedMEP1004Pool is Proxied, UUPSUpgradeable, MEP1004Pool {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
