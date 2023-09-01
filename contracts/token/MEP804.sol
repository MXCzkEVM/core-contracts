// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IMEP804.sol";
import "./IMEP803.sol";
import "./MEP802.sol";
import "./IERC6551Account.sol";
import "../libs/MerkleVerifierLibrary.sol";

/**
 * @title RewardContract
 * @author Abiodun Awoyemi
 * @notice This contract set up reward formula, submit and calculate reward, and user claims reward.
 */
contract RewardContract is ERC20, ReentrancyGuard {
    using MerkleVerifierLibrary for bytes32;

    // STATE VARIABLES
    address public owner;
    address public businessOwner;
    address public applicationContractAddress;
    address public lpwanAddress;
    address[] public sensorProfileAddresses;
    bytes32 public merkleRoot;
    string public xToEarnFormulaJSON;
    uint256 public cycleCount;
    bool public healthStatus;

    // MAPPINGS
    mapping(address => uint256) public reward;
    mapping(address => uint256) public allTimeRewardEarned;
    mapping(uint256 => mapping(address => bool)) public rewardTokenClaimed;

    // EVENTS
    event RewardContractDeployed(address indexed rewardContractAddress);
    event MoreRewardTokenMinted(uint256 indexed _amount);
    event RewardClaimed(address indexed _appContractAddress, address indexed claimer);
    event HealthToggled(bool indexed _status);
    event CycleCountSet(uint256 indexed _count);
    event MerkleRootUpdated(bytes32 indexed _merkleRoot);

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
        uint256 _totalRewardAmount,
        bytes32 _merkleRoot,
        uint256 _count
    ) payable ERC20(_name, _symbol) {
        // myFixedNumber = 12345.678;

        owner = msg.sender;
        businessOwner = _businessOwner;
        applicationContractAddress = _applicationContractAddress;

        lpwanAddress = _lpwanAddress;
        sensorProfileAddresses = _sensorProfileAddresses;
        xToEarnFormulaJSON = _xToEarnFormulaJSON;

        merkleRoot = _merkleRoot;
        cycleCount = _count;

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
    error WRONG_CYCLE();
    error YOU_ARE_NOT_ELIGIBLE();
    error CLAIMED_ALREADY();
    error WRONG_ROOT();

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
        // calculates the 10% to be sent to lpwan contract
        uint256 _lpwanReward = (10 * _amount) / 100;
        // transfers the 10% to lpwan contract
        _transfer(address(this), lpwanAddress, _lpwanReward);

        // emits event
        emit MoreRewardTokenMinted(_amount);
    }

    /**
     * @dev See {IMEP-804 -> renewDevice}
     * Emits an {CycleCountSet} event indicating cycle count.
     */
    function setCycleCount(uint256 _count) external {
        if (msg.sender != owner) {
            revert ONLY_OWNER();
        }
        cycleCount = _count;

        emit CycleCountSet(_count);
    }

    /**
     * @dev See {IMEP-804 -> updateMerkleRoot}
     * Emits an {MerkleRootUpdated} event indicating merkle root updated.
     */
    function updateMerkleRoot(bytes32 _merkleRoot) external {
        if (msg.sender != owner) {
            revert ONLY_OWNER();
        }
        merkleRoot = _merkleRoot;

        emit MerkleRootUpdated(_merkleRoot);
    }

    /**
     * @dev See {IMEP-804 -> rewardTokenBalance}
     */
    function rewardTokenBalance() public view returns (uint256) {
        return balanceOf(address(this));
    }

    /**
     * @dev See {IMEP-804 -> calculateFuelHealth}
     */
    function calculateFuelHealth(
        address _nftAccountAddress
    ) public view returns (uint256 fuelHealth_) {
        // get the balance of the reward token in the contract account of the nft
        uint256 _fuel = IERC20(address(this)).balanceOf(_nftAccountAddress);

        // calculate the fuel health and the reward service divides it by 1e10
        uint256 _sensorFuelHealth = ((_fuel * 1e10) /
            allTimeRewardEarned[_nftAccountAddress]);

        if (allTimeRewardEarned[_nftAccountAddress] == 0) {
            fuelHealth_ = 1;
        } else {
            fuelHealth_ = _sensorFuelHealth;
        }
    }

    function verifyProof(
        bytes32 leaf,
        MerkleVerifierLibrary.ProofValue[] calldata proof
    ) public view returns (bool) {
        return merkleRoot.verifyMerkleProof(leaf, proof);
    }

    /**
     * @dev See {IMEP-804 -> claimReward}
     * Emits an {RewardSubmitted} event indicating the reward for each sensor.
     */
    function claimReward(
        address _appContractAddress,
        address _sensorProfileAddress,
        address _nftAccountAddress,
        bytes32 _merkleRoot,
        MerkleVerifierLibrary.ProofValue[] calldata _merkleProof,
        bytes32 _leaf,
        uint256 _amount,
        uint256 _tokenId,
        uint256 _cycle
    ) external payable nonReentrant {
    // ) external view returns(bytes32) {
        // compares the contract address set at the point of deploying the contract with the address submitted
        if (_appContractAddress != applicationContractAddress) {
            revert WRONG_APPLICATION_ADDRESS();
        }
        // check if the reward of the nft account is greater than zero
        if (_cycle != cycleCount) {
            revert WRONG_CYCLE();
        }
        // check if the reward of the nft account is greater than zero
        if (_merkleRoot != merkleRoot) {
            revert WRONG_ROOT();
        }

        bool status = verifyProof(_leaf, _merkleProof);
        if (!status) {
            revert YOU_ARE_NOT_ELIGIBLE();
        }

        uint256 amount_ = _amount * 1e18;
        // update the all time earned reward for an address
        // to be used in calculation of fuel health
        allTimeRewardEarned[_nftAccountAddress] += amount_;
        // set the claim status to true
        rewardTokenClaimed[_cycle][_nftAccountAddress] = true;

        // transfers the reward to the nft contract account
        _transfer(address(this), _nftAccountAddress, amount_);
        // emits an event
        emit RewardClaimed(_appContractAddress, msg.sender);
    }



    function addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }


    function uint256ToString(uint256 value) public pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp > 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value > 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        
        return string(buffer);
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
