// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IMEP802.sol";

/**
 * @title ProvisioningContract
 * @author Abiodun Awoyemi
 * @notice This contract allow user to create, add and manange sensor devices as NFTs.
 */
contract ProvisioningContract is IMEP802, ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _myCounter;

    address public applicationContractAddress;
    address public lpwanAddress;
    address public owner;
    uint256 immutable floorPrice;
    uint256 idPID;

    struct Sensor {
        uint256 expirationBlock;
        address tokenOwner;
        bytes32 pIDHash;
        uint256 amountPaid;
        address sensorProfileContractAddress;
    }

    struct ProducePID {
        string email;
        uint256 amount;
    }

    mapping(uint256 => ProducePID) public producingPID;
    mapping(uint256 => Sensor) public sensorNFT;
    mapping(uint256 => uint256) public blockFee;
    mapping(bytes32 => uint256) private pIDHashToTokenId;

    // Custom Errors
    error ONLY_OWNER();
    error INSUFFICIENT_AMOUNT();
    error ADDRESS_ZERO();
    error WRONG_APPLICATION_ADDRESS();
    error SENSOR_PROFILE_ADDRESS_DOES_NOT_MATCH();

    /**
     * @notice Constructor function to initialize a new `ProvisioningContract` instance.
     * @param _name The name of the provisioning NFT
     * @param _symbol The symbol of the provisioning NFT.
     * @param _yearFee The fee for one year device.
     * @param _noOfBlock The number of blocks in one year.
     * @param _applicationContractAddress address of the application contract.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _yearFee,
        uint256 _noOfBlock,
        address _applicationContractAddress,
        address _lpwanAddress
    ) ERC721(_name, _symbol) {
        // set fee for one year in a state variable
        floorPrice = _yearFee;
        // set the fee -> block number, one year
        blockFee[_yearFee] = _noOfBlock;
        // address of the application contract
        applicationContractAddress = _applicationContractAddress;
        lpwanAddress = _lpwanAddress;
        owner = msg.sender;

        emit ProvisioningContractDeployed(address(this));
    }

    /**
     * @dev See {IMEP-802 -> producePID}
     * Emits an {PIDProduced} ev_applicationContractAddressent indicating the produced PID.
     */
    function producePID(
        string memory _email,
        uint256 _amount,
        address _applicationContractAddress,
        address _sensorProfileContractAddress
    ) external {
        if (_applicationContractAddress != applicationContractAddress) {
            revert WRONG_APPLICATION_ADDRESS();
        }

        idPID++;

        ProducePID storage produce = producingPID[idPID];
        produce.amount = _amount;
        produce.email = _email;

        emit PIDProduced(_email, _amount, _applicationContractAddress, address(this), _sensorProfileContractAddress);
    }

    /**
     * @dev See {IMEP-802 -> mintSensorNFT}
     * Emits an {SensorNFTMinted} event indicating the sensor NFT minted.
     */
    function mintSensorNFT(bytes32 _pIDHash, string memory _tokenURI) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _buyer = msg.sender;

        if (msg.value < floorPrice) {
            revert INSUFFICIENT_AMOUNT();
        }

        uint256 tokenId = _myCounter.current();

        Sensor storage sensor = sensorNFT[tokenId];
        sensor.pIDHash = _pIDHash;
        sensor.tokenOwner = _buyer;
        sensor.amountPaid = _amountPaid;
        sensor.expirationBlock = block.number + blockFee[_amountPaid];

        pIDHashToTokenId[_pIDHash] = tokenId;

        payable(address(0)).transfer(_amountPaid); // the amount paid is transfered to address zero

        _myCounter.increment();
        _safeMint(_buyer, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit SensorNFTMinted(tokenId, _pIDHash);
    }

    /**
     * @dev See {IMEP-802 -> claimSensorNFT}
     * Emits an {SensorNFTClaimed} event indicating a claimed device.
     */
    function claimSensorNFT(string memory _pID, address _sensorProfileContractAddress) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _claimer = msg.sender;
        bytes32 _pIDHash = keccak256(abi.encodePacked(_pID));
        uint256 tokenId = pIDHashToTokenId[_pIDHash];
        address tokenOwner = ownerOf(tokenId);

        Sensor storage sensor = sensorNFT[tokenId];
        sensor.tokenOwner = _claimer; // token owner will change in the mapping
        sensor.sensorProfileContractAddress = _sensorProfileContractAddress;

        safeTransferFrom(tokenOwner, _claimer, tokenId);
        payable(address(0)).transfer(_amountPaid); // the amount paid is transfered to address zero

        emit SensorNFTClaimed(tokenId, bytes32(_pIDHash), _claimer);
    }

    /**
     * @dev See {IMEP-802 -> renewDevice}
     * Emits an {SensorNFTRenewed} event indicating a renewed device.
     */
    function renewDevice(bytes32 _pIDHashEVM) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _renewer = msg.sender;
        uint256 tokenId = pIDHashToTokenId[bytes32(_pIDHashEVM)];

        if (_renewer != ownerOf(tokenId)) {
            revert ONLY_OWNER();
        }

        if (_amountPaid < floorPrice) {
            revert INSUFFICIENT_AMOUNT();
        }

        require(_exists(tokenId), "ERC721: invalid token ID");

        Sensor storage sensor = sensorNFT[tokenId];
        sensor.amountPaid = _amountPaid;
        sensor.expirationBlock = block.number + blockFee[_amountPaid];

        payable(address(0)).transfer(_amountPaid); // the amount paid is transfered to address zero

        emit SensorNFTRenewed(tokenId, _amountPaid, _renewer);
    }

    /**
     * @dev See {IMEP-802 -> isValid}
     */
    function isValid(uint256 _tokenId) external view returns (bool) {
        Sensor storage sensor = sensorNFT[_tokenId];

        return sensor.expirationBlock > block.number;
    }

    function getSensorNFTData(uint256 _tokenId) public view returns (address) {
        return sensorNFT[_tokenId].sensorProfileContractAddress;
    }
}
