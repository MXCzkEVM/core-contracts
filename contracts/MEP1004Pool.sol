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

error InvalidProofLength();
error InvalidTokenOwnership();
error AlreadyClaim();
error InvalidProof();
error TokenNotFound();
error TokenExist();
error TokenExceeds();

contract MEP1004Pool is ControllableUpgradeable, ReentrancyGuard {

    using LibAddress for address;

    event ReleaseEpoch(uint indexed epochNumber, bytes32 rewardMerkleRoot);

    event ClaimedReward(address indexed miner, uint latestEpochNumber);

    struct RewardInfo {
        uint mxcAmount;
        address[] token;
        uint[] amount;
    }

    IERC6551Registry public ERC6551Registry;

    address public ERC6551AccountImplAddr;

    address public MEP1004Addr;

    uint public maxSelectToken;

    address[] public rewardTokens;

    mapping(uint => bytes32) public rewardMerkleRoots;

    mapping(address => uint) public minerClaimedEpoch;

    mapping (address => uint) public tokenRewardAmountPerEpoch;

    mapping (address => address[]) public userSelectedToken;

    function initialize(
        address _ERC6551Registry,
        address _ERC6551AccountImplAddr,
        address _MEP1004Addr,
        uint _maxSelectToken
    ) external initializer {
        ERC6551Registry = IERC6551Registry(_ERC6551Registry);
        ERC6551AccountImplAddr = _ERC6551AccountImplAddr;
        MEP1004Addr = _MEP1004Addr;
        maxSelectToken = _maxSelectToken;
        __Controllable_init();
    }



    function claimRewards(uint MEP1004TokenId, address to, bytes32[][] calldata proofs, uint[] calldata epochIds, RewardInfo[] calldata rewards) nonReentrant external {
        if(proofs.length != epochIds.length || proofs.length != rewards.length) {
            revert InvalidProofLength();
        }
        if(msg.sender != _getMEP1004TokenERC6551Account(MEP1004TokenId)) {
            revert InvalidTokenOwnership();
        }

        uint expectedEpochId = minerClaimedEpoch[msg.sender] + 1;

        uint totalMxcTokenAmount;
        address[] memory uniqueTokens = new address[](rewardTokens.length);
        uint[] memory totalAmounts = new uint[](rewardTokens.length);

        uint tokenCount;


        for (uint i = 0; i < proofs.length; i++) {
            if(epochIds[i] != expectedEpochId) {
                revert InvalidProof();
            }

            bytes32 rewardHash = keccak256(abi.encode(MEP1004TokenId, rewards[i]));
            if (!_verify(proofs[i], epochIds[i], rewardHash)) {
                revert InvalidProof();
            }

            totalMxcTokenAmount += rewards[i].mxcAmount;
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
            expectedEpochId += 1;
        }

        for (uint i = 0; i < tokenCount; i++) {
            require(IERC20(uniqueTokens[i]).transfer(to, totalAmounts[i]), "token transfer failed");
        }
        to.sendEther(totalMxcTokenAmount);

        minerClaimedEpoch[msg.sender] += proofs.length;
        emit ClaimedReward(msg.sender, minerClaimedEpoch[msg.sender]);
    }

    function selectToken(address[] memory token) external {
        for(uint i = 0; i < token.length; i++) {
            if(tokenRewardAmountPerEpoch[token[i]] == 0) {
                revert TokenNotFound();
            }
        }
        userSelectedToken[msg.sender] = token;
    }

    function releaseEpoch(uint epochNumber, bytes32 rewardMerkleRoot) external onlyController {
        epochNumber++;
        rewardMerkleRoots[epochNumber] = rewardMerkleRoot;
        emit ReleaseEpoch(epochNumber, rewardMerkleRoot);
    }

    function addRewardToken(address token, uint amountPerEpoch) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i] == token) {
                revert TokenExist();
            }
        }
        rewardTokens.push(token);
        tokenRewardAmountPerEpoch[token] = amountPerEpoch;
    }

    function removeRewardToken(address token) external onlyController {
        for (uint i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i] == token) {
                rewardTokens[i] = rewardTokens[rewardTokens.length - 1];
                rewardTokens.pop();
                tokenRewardAmountPerEpoch[token] = 0;
                return;
            }
        }
        revert TokenNotFound();
    }

    function _getMEP1004TokenERC6551Account(uint MEP1004TokenId) private returns (address account) {
        return ERC6551Registry.account(ERC6551AccountImplAddr, block.chainid, MEP1004Addr, MEP1004TokenId, 0);
    }

    function _verify(bytes32[] calldata proof, uint epochId, bytes32 rewardHash) private returns (bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, rewardHash));
        return MerkleProof.verify(proof, rewardMerkleRoots[epochId], leaf);
    }

}

contract ProxiedMEP1004Pool is Proxied, UUPSUpgradeable, MEP1004Pool {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
