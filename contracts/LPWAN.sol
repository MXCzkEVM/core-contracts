// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {
StringsUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {
UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
AddressUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {SignatureCheckerUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";


import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {MEP1004Token} from "./token/MEP1004Token.sol";
import {LibAddress} from "./libs/LibAddress.sol";
import {ReentrancyGuard} from "./libs/ReentrancyGuard.sol";
import {AggregatorInterface} from "./interfaces/AggregatorInterface.sol";


error RELAY_INVALID_HEIGHT();
error RELAY_INVALID_COST();
error RELAY_DUPLICATE_PROVEN();
error INVALID_SIGNATURE();

/**
 * @title LPWAN
 * @dev The LPWAN contract provides a set of functionalities for managing the LPWAN token system, including reward systems and token minting.
 * @notice This contract inherits from ControllableUpgradeable and ReentrancyGuard
 */
contract LPWAN is
ControllableUpgradeable, ReentrancyGuard
{
    using LibAddress for address;

    /**
     * @dev Structure to store data about reward events
     * @param rewardHeight The height at which the reward was issued
     * @param account The account receiving the reward
     * @param amount The amount of reward
     * @param cost The cost of the reward
     */
    struct RewardEvent {
        uint rewardHeight;
        address account;
        uint amount;
        uint cost;
    }

    /**
     * @dev Structure to store synchronization status of relay
     * @param ProposedRewardEventHeight The height of the proposed reward event
     * @param ProvenRewardEventHeight The height of the proven reward event
     */
    struct RelaySyncStatus {
        uint ProposedRewardEventHeight;
        uint ProvenRewardEventHeight;
    }

    /**
     * @dev Structure to store data about rewards
     * @param proposedReward The amount of proposed reward
     * @param provenReward The amount of proven reward
     * @param proposedCostReward The proposed cost of the reward
     * @param provenCostReward The proven cost of the reward
     */
    struct RewardData {
        uint proposedReward;
        uint provenReward;
        uint proposedCostReward;
        uint provenCostReward;
    }

    event ClaimReward(address indexed account, bool indexed burn, uint indexed rewardType, uint amount);

    event BurnExcessToken(uint indexed id, uint indexed amount);

    address private _MEP1004Address;

    AggregatorInterface private ethOracle;

    uint private _maxCostMxc;

    uint private _totalCostEth;

    RelaySyncStatus private _relaySyncStatus;

    RewardData private _totalRewardData;

    mapping (address => RewardData) private _supernodeRewardData;

    mapping(uint => RewardEvent) private _provenRewardEvent;

    uint private _latestProvenL1Height;

    bytes32 private PERMIT_TYPEHASH = keccak256("Permit(string sncode,address owner,address spender)");

    uint256[90] private __gap;

    /**
     * @dev initialize contract with initial variables
     * @param MEP1004Address_ Address of the MEP1004 token
     * @param ethPriceOracle_ Address of the ETH price oracle
     */
    function initialize(
        address MEP1004Address_,
        address ethPriceOracle_
    ) external initializer {
        _MEP1004Address = MEP1004Address_;
        ethOracle = AggregatorInterface(ethPriceOracle_);
        __Controllable_init();
    }

    // @dev set current oracle for eth/mxc price
    function setEthOracle(address ethPriceOracle_) external onlyController {
        ethOracle = AggregatorInterface(ethPriceOracle_);
    }

    // @dev to set maximum cost reward for MXC
    function setMaxCostMxc(uint256 maxCostMxc_) external onlyController {
        _maxCostMxc = maxCostMxc_;
    }

    function getMaxCostMxc() external view returns(uint){
        return _maxCostMxc;
    }

    // @dev get the accumulated transaction fees of the validator in L1.
    function getTotalCostEth() external view returns(uint){
        return _totalCostEth;
    }

    function getMEP1004Addr() external view returns (address) {
        return _MEP1004Address;
    }

    function setMEP1004Addr(address MEP1004Address) external onlyController returns (address)  {
        return _MEP1004Address = MEP1004Address;
    }

    // @dev admin mint MEP1004 token for device owner
    function mintMEP1004Stations(address _to, string memory _SNCode, string memory _regionID) external onlyController {
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode, _regionID);
    }

    function mintMEP1004StationsBySignature(address _to, string memory _SNCode, string memory regionID, address _signer, bytes calldata _signature) external {
        if(!controllers[_signer]) {
            revert INVALID_SIGNATURE();
        }
        // check _signature
        bytes32 _hash = _permitHash(_SNCode, _signer, msg.sender);
        if (!SignatureCheckerUpgradeable.isValidSignatureNow(_signer, _hash, _signature)) {
            revert INVALID_SIGNATURE();
        }
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode, regionID);
    }

    function _permitHash(
        string memory _SNCode,
        address _owner,
        address _spender
    ) private returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH, _SNCode, _owner, _spender))
            )
        );
    }

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("LPWAN")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _computeDomainSeparator();
    }

    // @dev admin submit the location proof of the asset
    function submitLocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external onlyController {
        MEP1004Token(_MEP1004Address).LocationProofs(_MEP1002TokenId, _MEP1004TokenIds, _item);
    }

    function getRelaySyncStatus() external view returns (RelaySyncStatus memory) {
        return _relaySyncStatus;
    }

    // @dev admin burn mxc
    function burnExcessToken(uint amount) external onlyController {
        address(0).sendEther(amount);
        emit BurnExcessToken(block.number, amount);
    }

    // @dev sync reward for proposer from L1 data
    function syncProposedRewardEvent(RewardEvent[] memory rewardEvents, bool setting) external onlyController {
        _rewardHelper(rewardEvents, setting, true, 0);
    }

    // @dev sync reward for prover form l1 data
    function syncProvenRewardEvent(RewardEvent[] memory rewardEvents, bool setting, uint latestProvenL1Height) external onlyController {
        _rewardHelper(rewardEvents, setting, false, latestProvenL1Height);
    }

    // @dev validator claim reward
    // @param rewardType 0 all reward, 1 proposed, 2 proven, 3 proposed cost, 4 proven cost
    function claimProposedReward(uint rewardType, bool burn) external nonReentrant {
        uint amount = _supernodeRewardData[msg.sender].proposedReward;

        if(rewardType == 1) {
            _totalRewardData.proposedReward -= amount;
            _supernodeRewardData[msg.sender].proposedReward = 0;
        }
        else if(rewardType == 2) {
            amount = _supernodeRewardData[msg.sender].provenReward;
            _totalRewardData.provenReward -= amount;
            _supernodeRewardData[msg.sender].provenReward = 0;
        }
        else if(rewardType == 3) {
            amount = _supernodeRewardData[msg.sender].proposedCostReward;
            _totalRewardData.proposedCostReward -= amount;
            _supernodeRewardData[msg.sender].proposedCostReward = 0;
        }
        else if(rewardType == 0) {
            RewardData memory userRewardData = _supernodeRewardData[msg.sender];
            amount = userRewardData.proposedReward + userRewardData.provenReward + userRewardData.proposedCostReward + userRewardData.provenCostReward;
            _totalRewardData.proposedReward -= userRewardData.proposedReward;
            _totalRewardData.provenReward -= userRewardData.provenReward;
            _totalRewardData.proposedCostReward -= userRewardData.proposedCostReward;
            _totalRewardData.provenCostReward -= userRewardData.provenCostReward;
            delete _supernodeRewardData[msg.sender];
        }
        if (burn) {
            address(0).sendEtherUnchecked(amount);
        } else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, rewardType, amount);
    }

    // @dev admin withdrawal mxc for sync reward cost or other cost
    function withdrawal(address to,uint amount) external onlyController {
        to.sendEtherUnchecked(amount);
    }

    function _rewardHelper(
        RewardEvent[] memory rewardEvents,
        bool setting,
        bool isProposed,
        uint latestProvenL1Height)
    private {
        uint n = rewardEvents.length;
        int ethMxcPrice = ethOracle.latestAnswer();
        for (uint i = 0; i < n; ++i) {
            if(isProposed) {
                if (rewardEvents[i].rewardHeight != _relaySyncStatus.ProposedRewardEventHeight + 1 && setting != true) {
                    revert RELAY_INVALID_HEIGHT();
                }
            } else {
                if(_latestProvenL1Height >= latestProvenL1Height && !setting) {
                    revert RELAY_INVALID_HEIGHT();
                }
            }

            RewardData storage userRewardData = _supernodeRewardData[rewardEvents[i].account];
            uint costMxc = getCostMxc(ethMxcPrice,rewardEvents[i].cost);

            if(isProposed) {
                userRewardData.proposedReward += rewardEvents[i].amount;
                userRewardData.proposedCostReward += costMxc * 2;
                _totalRewardData.proposedReward += rewardEvents[i].amount;
                _totalRewardData.proposedCostReward += costMxc * 2;
                _relaySyncStatus.ProposedRewardEventHeight = setting ? rewardEvents[i].rewardHeight : _relaySyncStatus.ProposedRewardEventHeight + 1;
            } else {
                userRewardData.provenReward += rewardEvents[i].amount;
                userRewardData.provenCostReward += costMxc * 2;
                _totalRewardData.provenReward += rewardEvents[i].amount;
                _totalRewardData.provenCostReward += costMxc * 2;
                _relaySyncStatus.ProvenRewardEventHeight = rewardEvents[i].rewardHeight;
            }
            _totalCostEth += rewardEvents[i].cost;
        }
        if(!isProposed) {
            _latestProvenL1Height = latestProvenL1Height;
        }
    }


    function setRelaySyncStatus(uint proposedRewardHeight, uint provenRewardHeight) external onlyController {
        _relaySyncStatus.ProposedRewardEventHeight = proposedRewardHeight;
        _relaySyncStatus.ProvenRewardEventHeight = provenRewardHeight;
    }

    function getLatestProvenL1Height() external view returns (uint) {
        return _latestProvenL1Height;
    }

    function getCostMxc(int ethMxcPrice, uint ethCost) private view returns (uint){
        uint costMxc = uint(ethMxcPrice) * ethCost;
        if (costMxc > _maxCostMxc && _maxCostMxc != 0) {
            costMxc = _maxCostMxc;
        }
        if(costMxc == 0) {
            revert RELAY_INVALID_COST();
        }
        return costMxc;
    }

    function getRewardData(address account) external view returns (RewardData memory) {
        return _supernodeRewardData[account];
    }

    function getTotalRewardData() external view  returns (RewardData memory) {
        return _totalRewardData;
    }
}

contract ProxiedLPWAN is Proxied, UUPSUpgradeable, LPWAN{
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}