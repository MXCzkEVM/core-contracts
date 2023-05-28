// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {
ERC721EnumerableUpgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
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
import {IMEP1004} from "./IMEP1004.sol";
import {INameWrapper} from "../mns/wrapper/INameWrapper.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";


    error ERC721InvalidTokenId();
    error ERC721NotApprovedOrOwner();
    error ERC721TokenAlreadyMinted();
    error SNCodeNotAllow();
    error ProofProverLessThanRequired();
    error AlreadyInsertOtherSlot();
    error ExceedSlotLimit();
    error SlotAlreadyUsed();
    error NotCorrectSlotIndex();
    error StatusNotAllow();
    error NoDebt();
    error NoNamingPermission();
    error InsufficientFee();

contract MEP1004Token is
ControllableUpgradeable,
IMEP1004,
ERC721EnumerableUpgradeable
{

    using AddressUpgradeable for address payable;

    using StringsUpgradeable for uint256;

    using Counters for Counters.Counter;


    event InsertToMEP1002Slot(
        uint256 indexed MEP1002TokenId,
        uint256 indexed MEP1004TokenId,
        uint256 indexed slotIndex,
        uint256 SNCodeType
    );

    event RemoveFromMEP1002Slot(
        uint256 indexed MEP1002TokenId,
        uint256 indexed MEP1004TokenId,
        uint256 indexed slotIndex,
        uint256 SNCodeType
    );

    event MEP1004TokenUpdateName(uint256 indexed tokenId, string name);

    mapping(string => LocationProof[]) private _locationProofs;

    mapping(uint256 => string) private _SNCodes;

    mapping(uint256 => mapping(uint256 => uint256[])) private _MEP1002Slot;

    // tokenId => slotIndex => [MEP1002TokenId, SNCodeType, slotIndex]
    mapping(uint256 => uint256[3]) private _whereSlot;

    // 0 = normal, 1 = debt
    mapping(uint256 => uint256) private _MEP1004Status;

    mapping(uint256 => string) private _MEP1004TokenNames;

    string private _baseUri;

    address private _mnsToken;

    address private _MEP1002Addr;

    uint256[] private _slotLimits;

    uint256 private _exitFee;

    Counters.Counter private _tokenIds;

    mapping(string => uint256) private _SNCodeTokenIds;


    function initialize(
        string memory name_,
        string memory symbol_
    ) external initializer {
        __Controllable_init();
        _slotLimits = [10, 50];
        _exitFee = 50 ether;
        __ERC721_init(name_, symbol_);
    }

    function mint(address to, string memory _SNCode) external onlyController {
        if (bytes(_SNCode).length == 0) {
            revert ERC721TokenAlreadyMinted();
        }
        uint256 tokenId = _tokenIds.current();
        if (tokenId == 0) {
            _tokenIds.increment();
            tokenId = _tokenIds.current();
        }
        _tokenIds.increment();
        if (_SNCodeTokenIds[_SNCode] != 0) {
            revert ERC721TokenAlreadyMinted();
        }
        if (getSNCodeType(_SNCode) == type(uint256).max) {
            revert SNCodeNotAllow();
        }
        _safeMint(to, tokenId);
        _SNCodes[tokenId] = _SNCode;
        _SNCodeTokenIds[_SNCode] = tokenId;
    }

    function setBaseURI(string memory baseURI_) external onlyController {
        _baseUri = baseURI_;
    }

    function setMNSToken(address mnsToken_) external onlyController {
        _mnsToken = mnsToken_;
    }

    function setMEP1002Addr(address MEP1002Addr_) external onlyController {
        _MEP1002Addr = MEP1002Addr_;
    }

    function setExitFee(uint256 exitFee_) external onlyController {
        _exitFee = exitFee_;
    }

    function setSlotLimit(uint256[] memory slotLimits_) external onlyController {
        _slotLimits = slotLimits_;
    }

    function withdrawal() external onlyController {
        payable(_msgSender()).transfer(address(this).balance);
    }

    function removeFromMEP1002SlotAdmin(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) onlyController external {
        uint256 SNCodeType = getSNCodeType(_SNCodes[_tokenId]);
        if (SNCodeType == type(uint256).max) {
            revert SNCodeNotAllow();
        }
        if (_MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] != _tokenId) {
            revert NotCorrectSlotIndex();
        }
        _MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] = 0;
        _MEP1004Status[_tokenId] = 1;
        _whereSlot[_tokenId] = [0, 0, 0];
        emit RemoveFromMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex,
            SNCodeType
        );
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(
        uint256 _tokenId
    ) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(
            abi.encodePacked(
                baseURI,
                _tokenId.toString(),
                "?name=",
                _MEP1004TokenNames[_tokenId]
            )
        ) : "";
    }


    function tokenNames(uint256 _tokenId) external view returns (string memory) {
        return _MEP1004TokenNames[_tokenId];
    }

    /**
     * @dev Returns the status of the token.
     */
    function getStatus(uint256 _tokenId) public view returns (uint256) {
        return _MEP1004Status[_tokenId];
    }

    /**
     * @dev Check the status of the token, if not zero, it will revert.
     */
    function checkStatus(uint256 _tokenId) internal view {
        if (_MEP1004Status[_tokenId] > 0) {
            revert StatusNotAllow();
        }
    }

    /*
    * @dev Returns the encrypted S/N code of the device.
    */
    function getSNCode(uint256 _tokenId) external view returns (string memory) {
        return _SNCodes[_tokenId];
    }

    /*
        * @dev Returns the tokenId of the encrypted S/N code.
    */
    function getTokenId(string memory _SNCode) external view returns (uint256) {
        return _SNCodeTokenIds[_SNCode];
    }

    /**
    * @dev Returns the limit number of slots that can be inserted with the MEP1002 token.
     */
    function slotLimits() external view returns (uint256[] memory) {
        return _slotLimits;
    }

    /**
     * @dev Returns the number of slots inserted with the MEP1004 token in the specified MEP1002 token.
     */
    function getMEP1002Slot(uint256 _mep1002Id) external view returns (uint256[][] memory) {
        uint256[][] memory result = new uint256[][](_slotLimits.length);
        for (uint256 i = 0; i < _slotLimits.length; i++) {
            if (_MEP1002Slot[_mep1002Id][i].length == 0) {
                result[i] = new uint256[](_slotLimits[i]);
            } else {
                result[i] = _MEP1002Slot[_mep1002Id][i];
            }
        }
        return result;
    }


    function getExitFee() external view returns (uint256) {
        return _exitFee;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function setName(uint256 _tokenId, uint256 _nameWrapperTokenId) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (IERC721(_mnsToken).ownerOf(_nameWrapperTokenId) != _msgSender())
            revert NoNamingPermission();
        bytes memory newName = INameWrapper(_mnsToken).names(bytes32(_nameWrapperTokenId));
        if (bytes(newName).length == 0) {
            return;
        }
        _MEP1004TokenNames[_tokenId] = string(abi.encodePacked(newName));
        emit MEP1004TokenUpdateName(
            _tokenId,
            _MEP1004TokenNames[_tokenId]
        );
    }

    function resetName(uint256 _tokenId) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        _MEP1004TokenNames[_tokenId] = "";
        emit MEP1004TokenUpdateName(
            _tokenId,
            _MEP1004TokenNames[_tokenId]
        );
    }


    /**
     * @dev Inserts the MEP1004 token to the specified slot within a MEP1002 token.
     */
    function insertToMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (IERC721(_MEP1002Addr).ownerOf(_mep1002Id) != _MEP1002Addr) {
            revert ERC721InvalidTokenId();
        }
        uint256 SNCodeType = getSNCodeType(_SNCodes[_tokenId]);
        if (SNCodeType == type(uint256).max) {
            revert SNCodeNotAllow();
        }
        if (_slotIndex >= _slotLimits[SNCodeType]) {
            revert ExceedSlotLimit();
        }
        if (_whereSlot[_tokenId][0] > 0) {
            revert AlreadyInsertOtherSlot();
        }
        if (_MEP1002Slot[_mep1002Id][SNCodeType].length == 0) {
            _MEP1002Slot[_mep1002Id][SNCodeType] = new uint256[](_slotLimits[SNCodeType]);
        }
        if (_MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] > 0) {
            revert SlotAlreadyUsed();
        }
        checkStatus(_tokenId);
        _MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] = _tokenId;
        _whereSlot[_tokenId] = [_mep1002Id, SNCodeType, _slotIndex];
        emit InsertToMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex,
            SNCodeType
        );
    }

    /**
     * @dev Removes the MEP1004 token from the specified slot within a MEP1002 token.
     */
    function removeFromMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external payable {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        uint256 SNCodeType = getSNCodeType(_SNCodes[_tokenId]);
        if (SNCodeType == type(uint256).max) {
            revert SNCodeNotAllow();
        }
        if (_MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] != _tokenId) {
            revert NotCorrectSlotIndex();
        }
        if (msg.value != _exitFee) {
            revert InsufficientFee();
        }
        _MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] = 0;
        _whereSlot[_tokenId] = [0, 0, 0];
        emit RemoveFromMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex,
            SNCodeType
        );
    }

    /**
     * @dev Submit the location proofs of anything.
     */
    function LocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) onlyController external {
        if (IERC721(_MEP1002Addr).ownerOf(_MEP1002TokenId) != _MEP1002Addr) {
            revert ERC721InvalidTokenId();
        }
        if (_MEP1004TokenIds.length < 3) {
            revert ProofProverLessThanRequired();
        }
        LocationProof memory locationProof = LocationProof({
            MEP1002TokenId: _MEP1002TokenId,
            MEP1004TokenIds: _MEP1004TokenIds,
            item: _item,
            timestamp: block.timestamp
        });
        _locationProofs[_item].push(locationProof);
        emit NewLocationProof(_MEP1002TokenId, _item, locationProof);
    }

    function payExitFee(uint256 _tokenId) external payable {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (getStatus(_tokenId) != 1) {
            revert NoDebt();
        }
        if (msg.value < _exitFee) {
            revert InsufficientFee();
        }
        _MEP1004Status[_tokenId] = 0;
    }

    /**
     * @dev search the MEP1004 token in the specified slot within a MEP1002 token.
     */
    function whereSlot(uint256 _tokenId) external view returns (uint256[3] memory) {
        return _whereSlot[_tokenId];
    }

    /**
     * @dev get the latest location proofs of anything.
     */
    function latestLocationProofs(string memory _item) external view returns (LocationProof memory) {
        return _locationProofs[_item][_locationProofs[_item].length - 1];
    }

    /**
     * @dev get the recent location proofs of anything.
     */
    function getLocationProofs(string memory _item, uint256 _index, uint256 _batchSize) external view returns (LocationProof[] memory) {
        // length
        uint256 length = _batchSize;
        if (_index >= _locationProofs[_item].length) {
            return new LocationProof[](0);
        }
        if (_batchSize > _locationProofs[_item].length - _index) {
            length = _locationProofs[_item].length - _index;
        }
        if (length == 0) {
            return new LocationProof[](0);
        }
        LocationProof[] memory resultArr = new LocationProof[](length);
        uint256 i = 0;
        while (i < _batchSize && _index < _locationProofs[_item].length) {
            resultArr[i] = _locationProofs[_item][_index];
            i++;
            _index++;
        }
        return resultArr;
    }


    function getSNCodeType(string memory _str) internal pure returns (uint256) {
        bytes memory strBytes = bytes(_str);
        bytes memory m2xBytes = bytes("M2X");
        uint256 m2xIdx = indexOf(strBytes, m2xBytes);
        if (m2xIdx != type(uint256).max) {
            return 0;
        }

        bytes memory neoBytes = bytes("NEO");
        uint256 neoIdx = indexOf(strBytes, neoBytes);
        if (neoIdx != type(uint256).max) {
            return 1;
        }
        return type(uint256).max;
    }

    function indexOf(bytes memory _str, bytes memory _subStr) internal pure returns (uint256) {
        require(_subStr.length <= _str.length, "Cannot find a longer string in a shorter one");
        uint i;
        uint j;
        for (i = 0; i <= _str.length - _subStr.length; i++) {
            bool found = true;
            for (j = 0; j < _subStr.length; j++) {
                if (_str[i + j] != _subStr[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return i;
            }
        }

        return type(uint256).max;
        // String does not contain substring

    }

    uint256[37] private __gap;
}

contract ProxiedMEP1004Token is Proxied, UUPSUpgradeable, MEP1004Token {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
