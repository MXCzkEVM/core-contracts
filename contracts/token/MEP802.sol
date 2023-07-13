// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

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

    bool private isLocked;
    address applicationContractAddress;
    address public owner;
    uint256 immutable floorPriceYearOne;
    uint256 idPID;

    struct Sensor {
        uint256 expirationBlock;
        address tokenOwner;
        bytes32 pIDHash;
        uint256 amountPaid;
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

    /**
     * @notice Constructor function to initialize a new `ProvisioningContract` instance.
     * @param _name The name of the provisioning NFT
     * @param _symbol The symbol of the provisioning NFT.
     * @param _yearOneFee The fee for one year device.
     * @param _yearTwoFee The fee for two year device.
     * @param _yearFiveFee The fee for five year device.
     * @param _noOfBlockYearOne The number of blocks in one year.
     * @param _noOfBlockYearTwo The number of blocks in two years.
     * @param _noOfBlockYearFive The number of blocks in five years.
     * @param _applicationContractAddress address of the application contract.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _yearOneFee,
        uint256 _yearTwoFee,
        uint256 _yearFiveFee,
        uint256 _noOfBlockYearOne,
        uint256 _noOfBlockYearTwo,
        uint256 _noOfBlockYearFive,
        address _applicationContractAddress
    ) ERC721(_name, _symbol) {
        // set fee for one year in a state variable
        floorPriceYearOne = _yearOneFee;
        // set the fee -> block number, one year
        blockFee[_yearOneFee] = _noOfBlockYearOne;
        // set the fee -> block number, two years
        blockFee[_yearTwoFee] = _noOfBlockYearTwo;
        // set the fee -> block number, five years
        blockFee[_yearFiveFee] = _noOfBlockYearFive;
        // address of the application contract
        applicationContractAddress = _applicationContractAddress;

        owner = msg.sender;

        emit MEP802Deployed(address(this));
    }

    /**
     * @dev See {IMEP-802 -> producePID}
     * Emits an {PIDProduced} event indicating the produced PID.
     */
    function producePID(string memory _email, uint256 _amount, address _applicationContractAddress) external {
        if (_applicationContractAddress != applicationContractAddress) {
            revert WRONG_APPLICATION_ADDRESS();
        }

        idPID++;

        ProducePID storage produce = producingPID[idPID];
        produce.amount = _amount;
        produce.email = _email;

        emit PIDProduced(_email, _amount, _applicationContractAddress);
    }

    /**
     * @dev See {IMEP-802 -> mintSensorNFT}
     * Emits an {SensorNFTMinted} event indicating the sensor NFT minted.
     */
    function mintSensorNFT(bytes32 _pIDHash, string memory _tokenURI) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _buyer = msg.sender;

        if (msg.value < floorPriceYearOne) {
            revert INSUFFICIENT_AMOUNT();
        }

        uint256 tokenId = _myCounter.current();

        Sensor storage sensor = sensorNFT[tokenId];
        sensor.pIDHash = _pIDHash;
        sensor.tokenOwner = _buyer;
        sensor.amountPaid = _amountPaid;
        sensor.expirationBlock = block.number + blockFee[_amountPaid];

        pIDHashToTokenId[_pIDHash] = tokenId;

        _myCounter.increment();
        _safeMint(_buyer, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        payable(address(0)).transfer(_amountPaid); // the amount paid is transfered to address zero

        emit SensorNFTMinted(tokenId, _pIDHash);
    }

    /**
     * @dev See {IMEP-802 -> claimSensorNFT}
     * Emits an {SensorNFTClaimed} event indicating a claimed device.
     */
    function claimSensorNFT(bytes32 _pIDHash) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _claimer = msg.sender;
        uint256 tokenId = pIDHashToTokenId[_pIDHash];
        address tokenOwner = ownerOf(tokenId);
        
        Sensor storage sensor = sensorNFT[tokenId];
        sensor.tokenOwner = _claimer; // token owner will change in the mapping

        safeTransferFrom(tokenOwner, _claimer, tokenId);
        payable(address(0)).transfer(_amountPaid); // the amount paid is transfered to address zero

        emit SensorNFTClaimed(tokenId, _pIDHash, _claimer);
    }

    /**
     * @dev See {IMEP-802 -> renewPID}
     * Emits an {SensorNFTRenewed} event indicating a renewed device.
     */
    function renewPID(bytes32 _pIDHashEVM) external payable nonReentrant {
        uint256 _amountPaid = msg.value;
        address _renewer = msg.sender;
        uint256 tokenId = pIDHashToTokenId[bytes32(_pIDHashEVM)];

        if (_renewer != ownerOf(tokenId)) {
            revert ONLY_OWNER();
        }

        if (_amountPaid < floorPriceYearOne) {
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
}
