// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "../MEP802.sol";
import "../MEP804.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LPWANMock {
    uint256 public mep802Id;
    uint256 public mep804Id;
    mapping(uint256 => address) public sensorNFTContractAddresses;
    mapping(uint256 => address) public rewardContractAddresses;

    event MEP802Created(address indexed _contractAddress, uint256 indexed _id);
    event MEP804Created(address indexed _contractAddress, uint256 indexed _id);

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    ///@dev only owner modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "You can't perform this transaction");
        _;
    }

    function createMEP802(
        string memory _tokenName,
        string memory _symbol,
        uint256 _yearFee,
        uint256 _noOfBlock,
        address _applicationContractAddress
    ) external {
        mep802Id++;

        bytes32 _salt = keccak256(abi.encodePacked(block.number, msg.sender));

        address sensorNFTContract_ = address(
            new SensorNFTContract{salt: _salt}(
                _tokenName,
                _symbol,
                _yearFee,
                _noOfBlock,
                _applicationContractAddress,
                address(this)
            )
        );

        sensorNFTContractAddresses[mep802Id] = sensorNFTContract_;

        emit MEP802Created(sensorNFTContract_, mep802Id);
    }

    function createMEP804(
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
    ) external {
        mep804Id++;

        bytes32 _salt = keccak256(abi.encodePacked(block.number, msg.sender));

        address rewardContract_ = address(
            new RewardContract{salt: _salt}(
                _applicationContractAddress,
                _businessOwner,
                _lpwanAddress,
                _sensorProfileAddresses,
                _xToEarnFormulaJSON,
                _name,
                _symbol,
                _totalRewardAmount,
                _merkleRoot,
                _count
            )
        );

        rewardContractAddresses[mep804Id] = rewardContract_;

        emit MEP804Created(rewardContract_, mep802Id);
    }

    /// @dev this function would be used by admin to withdraw an ERC20 token locked in the contract, providing the token address ans the amount they wish to withdraw
    function recoverToken(address _to, address _tokenAddress, uint256 _amt) external onlyOwner returns (bool) {
        require(_to != address(0), "ERC20: transfer to the zero address");

        bool transferStatus = IERC20(_tokenAddress).transfer(_to, _amt);

        return transferStatus;
    }
}
