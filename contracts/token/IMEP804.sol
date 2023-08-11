// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

interface IMEP804 {
    /// @dev This event gets emitted when the Reward contract is deployed.
    ///  The parameters is the address of the contract deployed
    event RewardContractDeployed(address indexed rewardContractAddress);

    /// @notice Gets fired when more reward token is minted
    /// @param _amount amount of the token minted
    event MoreRewardTokenMinted(uint256 indexed _amount);

    /// @notice Gets fired when tiers allocation is set
    /// @param _tierLength the length of the tiers
    /// @param _amountLength the length of the amount of tiers
    event TokenAllocationForTierSet(uint256 indexed _tierLength, uint256 indexed _amountLength);

    /// @notice Gets fired when mining power is set
    /// @param _miningPower mining power of the sensor
    /// @param _health the health of the sensor
    /// @param _tokenId the tokenId of the sensor
    /// @param _sensorProfileAddress Contract address of the sensor profile
    /// @param _nftAccountAddress Contract address of the nft account
    event HealthMiningPowerSet(
        uint256 indexed _miningPower,
        uint256 indexed _health,
        uint256 indexed _tokenId,
        address _sensorProfileAddress,
        address _nftAccountAddress
    );

    /// @notice Gets fired when reward is submitted
    /// @param _nftContractAddress Contract address of the nft account
    /// @param _miningPower mining power of sensor
    /// @param _totalMiningPowerOfAllSensors total mining power of all sensor
    event RewardSubmitted(
        address indexed _nftContractAddress, uint256 indexed _miningPower, uint256 indexed _totalMiningPowerOfAllSensors
    );

    /// @notice Gets fired when reward is claimed
    /// @param _appContractAddress Contract address of the application
    /// @param claimer the beneficiary
    event RewardClaimed(address _appContractAddress, address claimer);

    /// @notice Gets fired when health status is toggled
    /// @param _status the status of the health
    event HealthToggled(bool indexed _status);

    /// @notice mint more token reward into the contract for subsequent cycle
    /// @param _amount amount of the token minted
    function mintMoreRewardToken(uint256 _amount) external;

    /// @notice this function returns the amount of reward token in the contract
    /// @return uint256 total reward token
    function rewardTokenBalance() external view returns (uint256);

    /// @notice set the allocation for each tier, i.e the amount for each tier
    /// @param _tiers this is an array of tiers
    /// @param _amounts this is an array of amount for tiers
    function setTokenAllocationForTier(string[] memory _tiers, uint256[] memory _amounts) external;

    // /// @notice set the reward mining data of each sensor
    // /// @param _tokenId the token id of the nft
    // /// @param _nftAccountAddress Contract address of the nft account
    // /// @param _sensorProfileAddress Contract address of the sensor profile
    // function setRewardMiningData(
    //     uint256 _tokenId,
    //     address _nftAccountAddress,
    //     address _sensorProfileAddress
    // ) external;

    /// @notice set the mining power of each sensor
    /// @param _nftAccountAddress Contract address of the nft account
    /// @param _sensorProfileAddress Contract address of the sensor profile
    /// @param _miningPower the mining power of each sensor submitted by chirp vm
    /// @param _tokenId the token id for each sensor
    function setHealthMiningPower(
        address _nftAccountAddress,
        address _sensorProfileAddress,
        uint256 _miningPower,
        uint256 _tokenId
    ) external;

    /// @notice Calculates the health factor based on the sensor's fuel health
    /// @param _nftContractAddress Contract address of the nft account
    /// @return The health factor
    function calculateFuelHealth(address _nftContractAddress) external view returns (uint256);

    // Submit Rewards
    /// @notice Submits the data of the end users and calculates the rewards
    /// @param _appContractAddress Contract address of the application
    /// @param _sensorProfileAddress Contract address of the sensor profile
    /// @param _nftAccountAddress Contract address of the nft account
    function submitReward(address _appContractAddress, address _sensorProfileAddress, address _nftAccountAddress)
        external;

    // Claim Rewards
    /// @notice Allows the end user to claim their earned rewards
    /// @param _appContractAddress Contract address of the application
    /// @param _nftAccountAddress contract address of the nft account
    function claimReward(address _appContractAddress, address _nftAccountAddress) external payable;

    /// @notice toggles the health status
    function toggleHealth() external;
}
