// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IMEP804.sol";
import "./IMEP803.sol";
import "./MEP802.sol";
import "./IERC6551Account.sol";

/**
 * @title RewardContract
 * @author Abiodun Awoyemi
 * @notice This contract set up reward formula, submit and calculate reward, and user claims reward.
 */
contract RewardContract is IMEP804, ERC20, ReentrancyGuard {
    // STRUCT
    struct HealthMining {
        uint256 healthFactor;
        uint256 miningPower;
        uint256 tokenId;
    }

    // STATE VARIABLES
    address public owner;
    address public businessOwner;
    address public applicationContractAddress;
    address public lpwanAddress;
    address[] public sensorProfileAddresses;
    string public xToEarnFormulaJSON;
    uint256 public poolAmountOfThisCycle;
    bool public healthStatus;
    uint256 public totalMiningPower;

    // MAPPINGS
    mapping(address => uint256) public reward;
    mapping(string => uint256) public tierStrength;
    mapping(string => uint256) public tierTokenAllocation;
    mapping(string => mapping(address => HealthMining)) public healthMiningPower;

    /**
     * @dev Constructor to initialize the contract with essential parameters and mint initial reward tokens.
     */
    constructor(
        address _applicationContractAddress,
        address _businessOwner,
        address _lpwanAddress,
        address[] memory _sensorProfileAddresses,
        string memory _xToEarnFormulaJSON,
        string memory _name,
        string memory _symbol,
        uint256 _totalRewardAmount
    ) payable ERC20(_name, _symbol) {
        owner = msg.sender;
        businessOwner = _businessOwner;
        applicationContractAddress = _applicationContractAddress;

        lpwanAddress = _lpwanAddress;
        sensorProfileAddresses = _sensorProfileAddresses;
        xToEarnFormulaJSON = _xToEarnFormulaJSON;

        // mints the initial reward into the contract
        _mint(address(this), _totalRewardAmount);
        // calculates the 10% to be sent to lpwan contract
        uint256 _lpwanReward = (10 * balanceOf(address(this))) / 100;
        // transfers the 10% to lpwan contract
        _transfer(address(this), lpwanAddress, _lpwanReward);
        // emits the contract address
        emit RewardContractDeployed(address(this));
    }

    /// CUSTOM ERRORS
    error ONLY_OWNER();
    error WRONG_APPLICATION_ADDRESS();
    error AMOUNT_MUST_BE_GREATER_THAN_ZERO();
    error ZERO_REWARD_AMOUNT();
    error ARRAY_MUST_HAVE_EQUAL_LENGTH();
    error INSUFFICIENT_TOKEN_BALANCE();

    /**
     * @dev See {IMEP-804 -> renewDevice}
     * Emits an {MoreRewardTokenMinted} event indicating more minted token.
     */
    function mintMoreRewardToken(uint256 _amount) external nonReentrant {
        // only owner can interact with this function
        if (msg.sender != owner) {
            revert ONLY_OWNER();
        }
        // amount that you want to mint must be great than zero, else revert
        if (_amount == 0) {
            revert AMOUNT_MUST_BE_GREATER_THAN_ZERO();
        }
        // token is minted
        _mint(address(this), _amount);
        // emits event
        emit MoreRewardTokenMinted(_amount);
    }

    /**
     * @dev See {IMEP-804 -> rewardTokenBalance}
     */
    function rewardTokenBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev See {IMEP-804 -> setTokenAllocationForTier}
     * Emits an {TokenAllocationForTierSet} event indicating allocation for each tier.
     */
    function setTokenAllocationForTier(
        string[] memory _tiers,
        uint256[] memory _amounts
    ) external {
        // check the length of the two arrays
        if (_tiers.length != _amounts.length) {
            revert ARRAY_MUST_HAVE_EQUAL_LENGTH();
        }

        // loop the amount array and set the total amount to state variable
        uint256 _totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            _totalAmount += _amounts[i];
        }

        // check the contract token balace be less than total amount
        if (rewardTokenBalance() < _totalAmount*1e18) {
            revert INSUFFICIENT_TOKEN_BALANCE();
        }

        // sett the total amouny in state variable
        poolAmountOfThisCycle = _totalAmount;
        // poolAmountOfThisCycle += _amounts;

        // the pool amount for each tier is set
        for (uint256 i = 0; i < _tiers.length; i++) {
            tierTokenAllocation[_tiers[i]] = _amounts[i];
        }

        // emits an event
        emit TokenAllocationForTierSet(_tiers.length, _amounts.length);
    }

    /**
     * @dev See {IMEP-804 -> setHealthMiningPower}
     * Emits an {HealthMiningPowerSet} event indicating health and mining power sensor.
     */
    function setHealthMiningPower(
        address _nftAccountAddress,
        address _sensorProfileAddress,
        uint256 _miningPower,
        uint256 _tokenId
    ) external {
        // gets the tier of the sensor profile contract
        string memory _tier = IMEP803(_sensorProfileAddress).getTier();

        uint256 _health;
        // checks the health status and calculate if its true and set to 1 if false
        if (healthStatus == true) {
            _health = calculateFuelHealth(_nftAccountAddress);
        } else {
            _health = 1;
        }

        // mining power data is set into the 2D mapping
        HealthMining storage _sensorData = healthMiningPower[_tier][
            _nftAccountAddress
        ];
        _sensorData.miningPower = _miningPower;
        _sensorData.healthFactor = _health;
        _sensorData.tokenId = _tokenId;

        // emits an event
        emit HealthMiningPowerSet(
            _miningPower,
            _health,
            _tokenId,
            _nftAccountAddress,
            _sensorProfileAddress
        );
    }

    /**
     * @dev See {IMEP-804 -> calculateFuelHealth}
     */
    function calculateFuelHealth(
        address _nftContractAddress
    ) public view returns (uint256 fuelHealth_) {
        // get the balance of the reward token in the contract account of the nft
        uint256 _fuel = IERC20(address(this)).balanceOf(_nftContractAddress);
        // if the balance of the nft contract account is zero, fuel health is set as 1 and if otherwise the balance is set
        if (_fuel == 0) {
            fuelHealth_ = 1;
        } else {
            fuelHealth_ = _fuel / 1e18;
        }
    }

    /**
     * @dev See {IMEP-804 -> submitReward}
     * Emits an {RewardSubmitted} event indicating the reward for each sensor.
     */
    function submitReward(
        address _appContractAddress,
        address _sensorProfileAddress,
        address _nftAccountAddress
    ) external {
        // compares the contract address set at the point of deploying the contract with the address submitted
        if (_appContractAddress != applicationContractAddress) {
            revert WRONG_APPLICATION_ADDRESS();
        }
        // gets the tier of the sensor profile contract
        string memory _tier = IMEP803(_sensorProfileAddress).getTier();

        // get the sensor data like fuel health and mining power from the 2D mapping
        HealthMining storage _sensorData = healthMiningPower[_tier][
            _nftAccountAddress
        ];

        // mapping(string => mapping(address => HealthMining)) public healthMiningPower
        uint256 _health = _sensorData.healthFactor;
        uint256 _miningPower = _sensorData.miningPower;
        uint256 _totalMiningPower = tierTokenAllocation[_tier];

        // calculate the reward for the sensor using this formular
        /// @dev the 1e10 and 1e18 is added to prevent floating as Solidity doesn't yet
        uint256 rewardForSensor = (_health * _miningPower * poolAmountOfThisCycle) / (_totalMiningPower);
        // the reward for wach sensor is set into the reward mapping
        reward[_nftAccountAddress] = rewardForSensor * 1e18;
        // emits an event
        emit RewardSubmitted(
            _nftAccountAddress,
            _miningPower,
            totalMiningPower
        );
    }

    /**
     * @dev See {IMEP-804 -> claimReward}
     * Emits an {RewardSubmitted} event indicating the reward for each sensor.
     */
    function claimReward(
        address _appContractAddress,
        address _nftAccountAddress
    ) external payable nonReentrant {
        // compares the contract address set at the point of deploying the contract with the address submitted
        if (_appContractAddress != applicationContractAddress) {
            revert WRONG_APPLICATION_ADDRESS();
        }
        // check if the reward of the nft account is greater than zero
        if (reward[_nftAccountAddress] == 0) {
            revert ZERO_REWARD_AMOUNT();
        }

        address _beneficiary = msg.sender;
        // set the reward of the nft contract account into _sensorReward variable
        uint256 _sensorReward = reward[_nftAccountAddress];

        // set the reward back to zero to prevent reentrancy
        reward[_nftAccountAddress] = 0;

        // transfers the reward to the nft contract account
        _transfer(address(this), _nftAccountAddress, _sensorReward);
        // emits an event
        emit RewardClaimed(_appContractAddress, _beneficiary);
    }

    /**
     * @dev See {IMEP-804 -> toggleHealth}
     * Emits an {HealthToggled} event indicating the health status.
     */
    function toggleHealth() external {
        if (healthStatus == true) {
            healthStatus = false;
        } else {
            healthStatus = true;
        }

        emit HealthToggled(healthStatus);
    }
}
