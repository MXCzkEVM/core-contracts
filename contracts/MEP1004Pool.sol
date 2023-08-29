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


interface TreasuryApproveToken {
    function approveToken(address token, address spender, uint amount) external returns (bool);
}

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
error SensorBalanceRequired();

contract MEP1004Pool is ControllableUpgradeable, ReentrancyGuard {

    using LibAddress for address;

    event ReleaseEpoch(uint indexed epochNumber, bytes32 indexed rewardMerkleRoot, address onlineStatusPointer);

    event ClaimedReward(address indexed miner, uint indexed latestEpochNumber, RewardInfo totalRewardInfo);

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

    uint private INITIAL_CHAIN_ID;

    bytes32 private INITIAL_DOMAIN_SEPARATOR;

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

    mapping(address => mapping(uint => bool)) private minerClaimedEpoch;

    mapping(uint => address) private minerEpochOnlineStatusPointer;

    mapping (address => address[]) private userSelectedToken;

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
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_DOMAIN_SEPARATOR = _computeDomainSeparator();

        treasury = _treasury;
        ERC6551Registry = IERC6551Registry(_ERC6551Registry);
        ERC6551AccountImplAddr = _ERC6551AccountImplAddr;
        MEP1004Token_ = MEP1004Token(_MEP1004Addr);
        sensorToken = SensorToken(_sensorToken);
        maxSelectToken = _maxSelectToken;
        epochExpiredTime = _epochExpiredTime;
    }

    function PERMIT_TYPEHASH() public view returns (bytes32) {
        return keccak256("Permit(address owner,address spender)");
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return block.chainid == INITIAL_CHAIN_ID ? INITIAL_DOMAIN_SEPARATOR : _computeDomainSeparator();
    }

    function claimRewards(uint MEP1004TokenId, address to, ProofArray[] calldata proofs, uint[] calldata epochIds, RewardInfo[] calldata rewards) nonReentrant external {
        if(proofs.length != epochIds.length || proofs.length != rewards.length || proofs.length == 0) {
            revert InvalidLength();
        }
        if(_msgSender() != _getMEP1004TokenERC6551Account(MEP1004TokenId)) {
            revert InvalidTokenOwnership();
        }

        RewardInfo memory totalRewardInfo = RewardInfo(new address[](rewardTokens.length + 1), new uint[](rewardTokens.length + 1)); // +1 for sensor token
        uint latestEpochNumber;
        uint tokenCount;
        for (uint i = 0; i < proofs.length; i++) {
            if(minerClaimedEpoch[msg.sender][epochIds[i]]) {
                revert AlreadyClaim();
            }
            if(epochReleaseTime[epochIds[i]] + epochExpiredTime < block.timestamp) {
                revert RewardExpired();
            }
            bytes32 rewardHash = keccak256(abi.encode(MEP1004TokenId, epochIds[i], rewards[i]));
            if (!_verify(proofs[i].proofs, rewardMerkleRoots[epochIds[i]], rewardHash)) {
                revert InvalidProof();
            }

            for (uint j = 0; j < rewards[i].token.length; j++) {
                bool found = false;
                for (uint k = 0; k < tokenCount; k++) {
                    if (totalRewardInfo.token[k] == rewards[i].token[j]) {
                        totalRewardInfo.amount[k] += rewards[i].amount[j];
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    totalRewardInfo.token[tokenCount] = rewards[i].token[j];
                    totalRewardInfo.amount[tokenCount] = rewards[i].amount[j];
                    tokenCount++;
                }
            }
            minerClaimedEpoch[msg.sender][epochIds[i]] = true;
            if(epochIds[i] > latestEpochNumber) {
                latestEpochNumber = epochIds[i];
            }
        }

        for (uint i = 0; i < tokenCount; i++) {
            if(totalRewardInfo.amount[i] != 0) {
                if(!IERC20(totalRewardInfo.token[i]).transferFrom(treasury, to, totalRewardInfo.amount[i])) {
                    revert TransferFailed();
                }
            }
        }

        emit ClaimedReward(msg.sender, latestEpochNumber, totalRewardInfo);
    }

    function selectToken(address[] memory tokens, bytes[] calldata signatures) external {
        if(tokens.length == 0 || tokens.length != signatures.length) {
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
            result[i] = minerClaimedEpoch[_getMEP1004TokenERC6551Account(MEP1004TokenId)][epochNumbers[i]];
        }
        return result;
    }

    function releaseEpoch(uint epochNumber, bytes32 rewardMerkleRoot, bytes memory statusBitMap) external onlyController {
        if(epochNumber != currentEpoch + 1) {
            if(currentEpoch != 0) {
                revert InvalidEpochNumber();
            }
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

    function getUserSelectedToken(address account) external view returns (address[] memory) {
        address[] memory tokens;
        uint tokenCount;
        for (uint i = 0; i < rewardTokens.length; i++) {
            for (uint j = 0; j < userSelectedToken[account].length; j++) {
                if (rewardTokens[i].token == userSelectedToken[account][j]) {
                    tokenCount++;
                    tokens[tokenCount] = rewardTokens[i].token;
                    break;
                }
            }
        }
        address [] memory result = new address[](tokenCount);
        for (uint i = 0; i < tokenCount; i++) {
            result[i] = tokens[i];
        }
        return tokens;
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

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint chainId,address verifyingContract)"),
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

    function _verify(bytes32[] calldata proof, bytes32 merkleRoot, bytes32 rewardHash) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(_msgSender(), rewardHash));
        bool result = MerkleProof.verifyCalldata(proof, merkleRoot, leaf);
        return result;
    }

}

contract ProxiedMEP1004Pool is Proxied, UUPSUpgradeable, MEP1004Pool {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
