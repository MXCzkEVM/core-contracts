// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// import "../libs/MerkleVerifierLibrary.sol";

interface IMEP804 {
    // using MerkleVerifierLibrary for bytes32;  // Import the library for using the ProofValue struct
    
    struct ProofValue {
        bytes value;
        int8 side; // Change int64 to int8
    }

    /// @dev This event gets emitted when the Reward contract is deployed.
    ///  The parameters is the address of the contract deployed
    event RewardContractDeployed(address indexed rewardContractAddress);

    /// @notice Gets fired when more reward token is minted
    /// @param _amount amount of the token minted
    event MoreRewardTokenMinted(uint256 indexed _amount);

    /// @notice Gets fired when reward is claimed
    /// @param _appContractAddress Contract address of the application
    /// @param claimer the beneficiary
    event RewardClaimed(address indexed _appContractAddress, address indexed claimer);

    /// @notice Gets fired when health status is toggled
    /// @param _status the status of the health
    event HealthToggled(bool indexed _status);

    /// @notice gets fired when cycle count is set
    /// @param _count the cycle count
    event CycleCountSet(uint256 indexed _count);

    /// @notice gets fired when the merkle root is updated
    /// @param _merkleRoot the merkle root
    event MerkleRootUpdated(bytes32 indexed _merkleRoot);

    /// @notice mint more token reward into the contract for subsequent cycle
    /// @param _amount amount of the token minted
    function mintMoreRewardToken(uint256 _amount) external;

    /// @notice Allows the end user to claim their earned rewards
    /// @param _appContractAddress Contract address of the application
    /// @param _nftAccountAddress contract address of the nft account
    /// @param _merkleProof array of the merkle proof
    /// @param _amount the amount to be claimed
    /// @param _cycle the cycle count
    function claimReward(
        address _appContractAddress,
        address _nftAccountAddress,
        bytes32 _merkleRoot,
        bytes32[] calldata _merkleProof,
        bytes32 _leaf,
        uint256 _amount,
        uint256 _cycle
    ) external payable;

    /// @notice toggles the health status
    function toggleHealth() external;

    /// @notice this function returns the amount of reward token in the contract
    /// @return uint256 total reward token
    function rewardTokenBalance() external view returns (uint256);

    /// @notice Calculates the health factor based on the sensor's fuel health
    /// @param _nftContractAddress Contract address of the nft account
    /// @return The health factor
    function calculateFuelHealth(address _nftContractAddress) external view returns (uint256);
}
