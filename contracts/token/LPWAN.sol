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

import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {MEP1004Token} from "./MEP1004Token.sol";
import {LibAddress} from "../libs/LibAddress.sol";
import {ReentrancyGuard} from "../libs/ReentrancyGuard.sol";
import {AggregatorInterface} from "../interfaces/AggregatorInterface.sol";

error RELAY_INVALID_HEIGHT();
error RELAY_INVALID_COST();
error RELAY_DUPLICATE_PROVEN();
contract LPWAN is
ControllableUpgradeable, ReentrancyGuard
{
    using LibAddress for address;

    struct RewardEvent {
        uint rewardHeight;
        address account;
        uint amount;
        uint cost;
    }

    struct RelaySyncStatus {
        uint ProposedRewardEventHeight;
        uint ProvenRewardEventHeight;
    }

    struct RewardData {
        uint proposedReward;  // rewardType 1 - 4, 0 all
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

    uint256[91] private __gap;

    function initialize(
        address MEP1004Address_,
        address ethPriceOracle_
    ) external initializer {
        _MEP1004Address = MEP1004Address_;
        ethOracle = AggregatorInterface(ethPriceOracle_);
        __Controllable_init();
    }

    function setEthOracle(address ethPriceOracle_) external onlyController {
        ethOracle = AggregatorInterface(ethPriceOracle_);
    }

    function setMaxCostMxc(uint256 maxCostMxc_) external onlyController {
        _maxCostMxc = maxCostMxc_;
    }

    function getMaxCostMxc() external view returns(uint){
        return _maxCostMxc;
    }

    function getTotalCostEth() external view returns(uint){
        return _totalCostEth;
    }

    function getMEP1004Addr() external view returns (address) {
        return _MEP1004Address;
    }

    function setMEP1004Addr(address MEP1004Address) external onlyController returns (address)  {
        return _MEP1004Address = MEP1004Address;
    }

    function mintMEP1004Stations(address _to, string memory _SNCode) external onlyController {
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode);
    }

    function submitLocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external onlyController {
        MEP1004Token(_MEP1004Address).LocationProofs(_MEP1002TokenId, _MEP1004TokenIds, _item);
    }

    function getRelaySyncStatus() external view returns (RelaySyncStatus memory) {
        return _relaySyncStatus;
    }

    function burnExcessToken(uint amount) external onlyController {
        address(0).sendEther(amount);
        emit BurnExcessToken(block.number, amount);
    }

    function syncProposedRewardEvent(RewardEvent[] memory rewardEvents, bool setting) external onlyController {
        uint n = rewardEvents.length;
        int ethMxcPrice = ethOracle.latestAnswer();
        for (uint i = 0; i < n; ++i) {
            if (rewardEvents[i].rewardHeight != _relaySyncStatus.ProposedRewardEventHeight + 1 && setting != true) {
                revert RELAY_INVALID_HEIGHT();
            }
            _supernodeRewardData[rewardEvents[i].account].proposedReward += rewardEvents[i].amount;
            uint costMxc = getCostMxc(ethMxcPrice,rewardEvents[i].cost);
            _supernodeRewardData[rewardEvents[i].account].proposedCostReward += costMxc * 2;
            _totalRewardData.proposedReward += rewardEvents[i].amount;
            _totalRewardData.proposedCostReward += costMxc * 2;
            _totalCostEth += rewardEvents[i].cost;
            if(setting) {
                _relaySyncStatus.ProposedRewardEventHeight = rewardEvents[i].rewardHeight;
            }else {
                unchecked {
                    ++_relaySyncStatus.ProposedRewardEventHeight;
                }
            }
        }
    }

    function syncProvenRewardEvent(RewardEvent[] memory rewardEvents,bool setting,uint latestProvenL1Height) external onlyController {
        uint n = rewardEvents.length;
        int ethMxcPrice = ethOracle.latestAnswer();
        if(_latestProvenL1Height >= latestProvenL1Height && !setting) {
            revert RELAY_INVALID_HEIGHT();
        }
        for (uint i = 0; i < n; ++i) {
            _supernodeRewardData[rewardEvents[i].account].provenReward += rewardEvents[i].amount;
            uint costMxc = getCostMxc(ethMxcPrice,rewardEvents[i].cost);
            _supernodeRewardData[rewardEvents[i].account].provenCostReward += costMxc * 2;
            _totalRewardData.provenReward += rewardEvents[i].amount;
            _totalRewardData.provenCostReward += costMxc * 2;
            _totalCostEth += rewardEvents[i].cost;
            _relaySyncStatus.ProvenRewardEventHeight = rewardEvents[i].rewardHeight;
        }
        _latestProvenL1Height = latestProvenL1Height;
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

    function claimProposedReward(bool burn) external nonReentrant {
        uint amount = _supernodeRewardData[msg.sender].proposedReward;
        _totalRewardData.proposedReward -= amount;
        _supernodeRewardData[msg.sender].proposedReward = 0;
        if (burn) {
            address(0).sendEther(amount);
        }else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, 1, amount);
    }

    function claimProvenReward(bool burn) external nonReentrant {
        uint amount = _supernodeRewardData[msg.sender].provenReward;
        _totalRewardData.provenReward -= amount;
        _supernodeRewardData[msg.sender].provenReward = 0;
        if (burn) {
            address(0).sendEther(amount);
        }else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, 2, amount);
    }

    function claimProposedCostReward(bool burn) external nonReentrant {
        uint amount = _supernodeRewardData[msg.sender].proposedCostReward;
        _totalRewardData.proposedCostReward -= amount;
        _supernodeRewardData[msg.sender].proposedCostReward = 0;
        if (burn) {
            address(0).sendEther(amount);
        }else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, 3, amount);
    }

    function claimProvenCostReward(bool burn) external nonReentrant {
        uint amount = _supernodeRewardData[msg.sender].provenCostReward;
        _totalRewardData.provenCostReward -= amount;
        _supernodeRewardData[msg.sender].provenCostReward = 0;
        if (burn) {
            address(0).sendEther(amount);
        }else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, 4, amount);
    }

    function claimAllReward(bool burn) external nonReentrant {
        RewardData memory userRewardData = _supernodeRewardData[msg.sender];
        uint amount = userRewardData.proposedReward + userRewardData.provenReward + userRewardData.proposedCostReward + userRewardData.provenCostReward;
        _totalRewardData.proposedReward -= userRewardData.proposedReward;
        _totalRewardData.provenReward -= userRewardData.provenReward;
        _totalRewardData.proposedCostReward -= userRewardData.proposedCostReward;
        _totalRewardData.provenCostReward -= userRewardData.provenCostReward;
        delete _supernodeRewardData[msg.sender];
        if (burn) {
            address(0).sendEther(amount);
        }else {
            msg.sender.sendEther(amount);
        }
        emit ClaimReward(msg.sender, burn, 0, amount);
    }

    function withdrawal(address to,uint amount) external onlyController {
        to.sendEther(amount);
    }

}

contract ProxiedLPWAN is Proxied, UUPSUpgradeable, LPWAN{
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}