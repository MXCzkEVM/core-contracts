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

    error ERC721NotApprovedOrOwner();
    error ERC721TokenAlreadyMinted();
    error ProofProverLessThanRequired();
    error AlreadyInsertOtherSlot();
    error ExceedSlotLimit();
    error SlotAlreadyUsed();
    error NotCorrectSlotIndex();
    error StatusNotAllow();
    error NoDebt();
    error NoNamingPermission();

contract MEP1004Token is
IMEP1004,
ERC721EnumerableUpgradeable,
ControllableUpgradeable,
Proxied,
UUPSUpgradeable
{
    using AddressUpgradeable for address payable;

    using StringsUpgradeable for uint256;


    event MEP1004TokenUpdateName(uint256 indexed tokenId, string indexed name);

    mapping(string => LocationProof[]) private _locationProofs;

    mapping(uint256 => string) private _SNCodes;

    mapping(uint256 => uint256[]) private _MEP1002Slot;

    mapping(uint256 => uint256[2]) private _whereSlot;

    // 0 = normal, 1 = debt
    mapping(uint256 => uint256) private _MEP1004Status;

    mapping(uint256 => string) private _MEP1004TokenNames;

    string private _baseUri;

    address private _mnsToken;

    uint256 private _slotLimit;

    uint256 private _exitFee;


    function initialize(
        string memory name_,
        string memory symbol_,
        address _admin
    ) external proxied initializer {
        __Controllable_init(_admin);
        assembly {
            sstore(0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103, _admin)
        }
        __UUPSUpgradeable_init();
        __ERC721_init(name_, symbol_);
    }

    function mint(address to, string memory _SNCode) external onlyController {
        if (bytes(_SNCode).length == 0) {
            revert ERC721TokenAlreadyMinted();
        }
        uint256 tokenId = uint256(keccak256(bytes(_SNCode)));
        if (_exists(tokenId)) {
            revert ERC721TokenAlreadyMinted();
        }
        _safeMint(to, tokenId);
        _SNCodes[tokenId] = _SNCode;
    }

    function setBaseURI(string memory baseURI_) external onlyController {
        _baseUri = baseURI_;
    }

    function setMNSToken(address mnsToken_) external onlyController {
        _mnsToken = mnsToken_;
    }

    function setExitFee(uint256 exitFee_) external onlyController {
        _exitFee = exitFee_;
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

    function _authorizeUpgrade(address) internal override onlyOwner {}

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

    function tokenNames(uint256 _tokenId) external view returns (string memory) {
        return _MEP1004TokenNames[_tokenId];
    }

    // Returns the status of the token.
    function getStatus(uint256 _tokenId) public view returns (uint256) {
        return _MEP1004Status[_tokenId];
    }

    // Check the status of the token, if not zero, it will revert.
    function checkStatus(uint256 _tokenId) internal view {
        if (_MEP1004Status[_tokenId] > 0) {
            revert StatusNotAllow();
        }
    }

    // Returns the encrypted S/N code of the device.
    function getSNCode(uint256 _tokenId) external view returns (string memory) {
        return _SNCodes[_tokenId];
    }

    // Returns the limit number of slots that can be inserted with the MEP1002 token.
    function slotLimit(uint256 _mep1002Id) external view returns (uint256) {
        return _slotLimit;
    }

    // Returns the number of slots inserted with the MEP1004 token in the specified MEP1002 token.
    function numInsertedSlots(uint256 _mep1002Id) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < _slotLimit; i++) {
            if (_MEP1002Slot[_mep1002Id][i] > 0) {
                count++;
            }
        }
        return count;
    }

    // Inserts the MEP1004 token to the specified slot within a MEP1002 token.
    function insertToMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (_slotIndex >= _slotLimit) {
            revert ExceedSlotLimit();
        }
        if (_MEP1002Slot[_mep1002Id][_slotIndex] > 0) {
            revert SlotAlreadyUsed();
        }
        if (_whereSlot[_tokenId][0] > 0) {
            revert AlreadyInsertOtherSlot();
        }
        checkStatus(_tokenId);
        _MEP1002Slot[_mep1002Id][_slotIndex] = _tokenId;
        _whereSlot[_tokenId] = [_mep1002Id, _slotIndex];
        emit InsertToMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex
        );
    }

    // Removes the MEP1004 token from the specified slot within a MEP1002 token.
    function removeFromMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external payable {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (_MEP1002Slot[_mep1002Id][_slotIndex] != _tokenId) {
            revert NotCorrectSlotIndex();
        }
        payable(address(this)).sendValue(_exitFee);
        _MEP1002Slot[_mep1002Id][_slotIndex] = 0;
        _whereSlot[_tokenId] = [0, 0];
        emit RemoveFromMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex
        );
    }

    // Inserts the MEP1004 token to the specified slot within a MEP1002 token.
    function removeFromMEP1002SlotAdmin(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) onlyController external {
        if (_MEP1002Slot[_mep1002Id][_slotIndex] != _tokenId) {
            revert NotCorrectSlotIndex();
        }
        _MEP1002Slot[_mep1002Id][_slotIndex] = 0;
        _MEP1004Status[_tokenId] = 1;
        _whereSlot[_tokenId] = [0, 0];
        emit RemoveFromMEP1002Slot(
            _mep1002Id,
            _tokenId,
            _slotIndex
        );
    }

    // pay exit fee
    function payExitFee(uint256 _tokenId) external payable {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (getStatus(_tokenId) != 1) {
            revert NoDebt();
        }
        payable(address(this)).sendValue(_exitFee);
        _MEP1004Status[_tokenId] = 0;
    }

    // search the MEP1004 token in the specified slot within a MEP1002 token.
    function whereSlot(uint256 _tokenId) external view returns (uint256[2] memory) {
        return _whereSlot[_tokenId];
    }

    // Submit the location proofs of anything.
    function LocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) onlyController external {
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

    // get the latest location proofs of anything.
    function latestLocationProofs(string memory _item) external view returns (LocationProof memory) {
        return _locationProofs[_item][_locationProofs[_item].length - 1];
    }

    // get the recent location proofs of anything.
    function getLocationProofs(string memory _item, uint256 _index, uint256 _batchSize) external view returns (LocationProof[] memory) {
        // length
        uint256 length = _batchSize;
        if (_batchSize > _locationProofs[_item].length - _index) {
            length = _locationProofs[_item].length - _index;
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

    uint256[40] private __gap;
}

