// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC721EnumerableUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {IMEP1004} from "./IMEP1004.sol";
import {INameWrapper} from "../mns/wrapper/INameWrapper.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {MEP1002Token} from "./MEP1002Token.sol";

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

contract MEP1004Token is ControllableUpgradeable, IMEP1004, ERC721EnumerableUpgradeable {
    using AddressUpgradeable for address payable;

    using StringsUpgradeable for uint256;

    using Counters for Counters.Counter;

    event InsertToMEP1002Slot(
        uint256 indexed MEP1002TokenId, uint256 indexed MEP1004TokenId, uint256 indexed slotIndex, uint256 SNCodeType
    );

    event RemoveFromMEP1002Slot(
        uint256 indexed MEP1002TokenId, uint256 indexed MEP1004TokenId, uint256 indexed slotIndex, uint256 SNCodeType
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

    mapping(uint256 => string) private _tokenIdRegionId;

    mapping(uint256 => uint256) private _slotExpiredBlocks;

    mapping(uint256 => int256) private _tokenIdCreateBlockHeight;
    
    mapping(uint256 => uint256) private _tokenSlotTimes;

    uint256 private _slotExpiredBlockNum;

    uint256[32] private __gap;

    function initialize(string memory name_, string memory symbol_) external initializer {
        __Controllable_init();
        _slotLimits = [10, 50];
        _exitFee = 50 ether;
        __ERC721_init(name_, symbol_);
    }

    function mint(address to, string memory _SNCode,uint256 _H3Index, string memory _regionID) external onlyController {
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
        uint256 SNCodeType = getSNCodeType(_SNCode);
        if (SNCodeType == type(uint256).max) {
            revert SNCodeNotAllow();
        }

        _safeMint(to, tokenId);
        _tokenIdCreateBlockHeight[tokenId] = int(block.number);
        _SNCodes[tokenId] = _SNCode;
        _SNCodeTokenIds[_SNCode] = tokenId;
        (bool empty, uint256 slotIndex) = getMEP1002EmptySlot(_H3Index, SNCodeType);
        if(!empty) {
            revert ExceedSlotLimit();
        }
        _insertToMEP1002Slot(to, tokenId, _H3Index, SNCodeType, _regionID, slotIndex);
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

    function setSlotExpiredBlockNum(uint256 slotExpiredBlockNum_) external onlyController {
        _slotExpiredBlockNum = slotExpiredBlockNum_;
    }

    function getSlotExpiredBlockNum() external returns (uint256) {
        return _slotExpiredBlockNum;
    }

    function setTokenCreateBlockHeight(uint256 tokenId, int256 blockHeight) external onlyController {
        _tokenIdCreateBlockHeight[tokenId] = blockHeight;
    }

    function withdrawal(address to) external onlyController {
        payable(to).sendValue(address(this).balance);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        _requireMinted(_tokenId);

        string memory baseURI = _baseURI();
        string memory tokenUri = string(abi.encodePacked(
                "?name=", _MEP1004TokenNames[_tokenId], 
                "&sn=", _SNCodes[_tokenId],
                "&regionId=", _tokenIdRegionId[_tokenId],
                "&mep1002Id=", _whereSlot[_tokenId][0].toString()
            ));
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _tokenId.toString(), tokenUri)) : tokenUri;
    }

    function tokenNames(uint256 _tokenId) external view returns (string memory) {
        return _MEP1004TokenNames[_tokenId];
    }

    /**
     * @dev Returns the status of the token.
     */
    function getStatus(uint256 _tokenId) public view returns (uint256) {
        uint status = _MEP1004Status[_tokenId];
        if(status == 0) {
            if(getSlotExpired(_tokenId)) {
                return 1;
            }
        }
        return _MEP1004Status[_tokenId];
    }

    /**
     * @dev Check the status of the token, if not zero, it will revert.
     */
    function checkStatus(uint256 _tokenId) internal view {
        if(getStatus(_tokenId) > 0) {
            revert StatusNotAllow();
        }
    }

    function getSlotExpired(uint256 _tokenId) public view returns (bool) {
        uint slotExpiredBlock = _slotExpiredBlocks[_tokenId];
        if(_tokenSlotTimes[_tokenId] == 0) {
            slotExpiredBlock += 680000;
        }
        if(_slotExpiredBlocks[_tokenId] != 0 && slotExpiredBlock < block.number) {
            return true;
        }
        return false;
    }

    /*
    * @dev Returns the encrypted S/N code of the device.
    */
    function getSNCode(uint256 _tokenId) public view returns (string memory) {
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
        uint tokenId;
        for (uint256 i = 0; i < _slotLimits.length; i++) {
            if (_MEP1002Slot[_mep1002Id][i].length == 0) {
                result[i] = new uint256[](_slotLimits[i]);
            } else {
                result[i] = _MEP1002Slot[_mep1002Id][i];
                for (uint256 j = 0; j < result[i].length; j++) {
                    if (result[i][j] == 0) {
                        continue;
                    }
                    // expired slot will be set to 0
                    if (getSlotExpired(result[i][j])) {
                        result[i][j] = 0;
                    }
                }
            }
        }
        return result;
    }

    function getMEP1002EmptySlot(uint256 _mep1002Id, uint256 SNCodeType) public view returns(bool, uint256) {
        uint256[] memory slots = _MEP1002Slot[_mep1002Id][SNCodeType];
        if(slots.length == 0) {
            return (true, 0);
        }
        for (uint256 i = 0; i < slots.length; i++) {
            if (slots[i] != 0) {
                if(getSlotExpired(slots[i])) {
                    return (true, i);
                }
            }else {
                return (true, i);
            }
        }
        return (false, 0);
    }

    function getExitFee() external view returns (uint256) {
        return _exitFee;
    }

    function getMEP1004TokenIds(address _owner) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](balanceOf(_owner));
        for (uint256 i = 0; i < result.length; i++) {
            result[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return result;
    }

    function getMEP1004TokenRegionId(uint256 _tokenId) external view returns (string memory) {
        return _tokenIdRegionId[_tokenId];
    }

    function getMEP1004TokenRegionIdBySncode(string memory _SNCode) external view returns(string memory) {
        return _tokenIdRegionId[_SNCodeTokenIds[_SNCode]];
    }

    function getMEP1004TokenCreateBlockHeight(uint256 _tokenId) external view returns (int256) {
        return _tokenIdCreateBlockHeight[_tokenId];
    }

    function setName(uint256 _tokenId, uint256 _nameWrapperTokenId) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        if (IERC721(_mnsToken).ownerOf(_nameWrapperTokenId) != _msgSender()) {
            revert NoNamingPermission();
        }
        bytes memory newName = INameWrapper(_mnsToken).names(bytes32(_nameWrapperTokenId));
        if (bytes(newName).length == 0) {
            return;
        }
        _MEP1004TokenNames[_tokenId] = string(abi.encodePacked(newName));
        emit MEP1004TokenUpdateName(_tokenId, _MEP1004TokenNames[_tokenId]);
    }

    function resetName(uint256 _tokenId) external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
        _MEP1004TokenNames[_tokenId] = "";
        emit MEP1004TokenUpdateName(_tokenId, _MEP1004TokenNames[_tokenId]);
    }

    /**
     * @dev Inserts the MEP1004 token to the specified slot within a MEP1002 token.
     */
    function insertToMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, string memory _regionID, uint256 _slotIndex) payable external {
        if (!_isApprovedOrOwner(_msgSender(), _tokenId)) {
            revert ERC721NotApprovedOrOwner();
        }
//        if (IERC721(_MEP1002Addr).ownerOf(_mep1002Id) != _MEP1002Addr) {
//            revert ERC721InvalidTokenId();
//        }
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
        if(getStatus(_tokenId) == 1) {
            if(msg.value == _exitFee) {
                _MEP1004Status[_tokenId] = 0;
            }
        }
        _insertToMEP1002Slot(_msgSender(), _tokenId, _mep1002Id, SNCodeType, _regionID, _slotIndex);
    }

    function _insertToMEP1002Slot(address to,uint256 _tokenId, uint256 _mep1002Id, uint256 _SNCodeType, string memory _regionID, uint256 _slotIndex) internal {
        checkStatus(_tokenId);
        bool exist = MEP1002Token(_MEP1002Addr).exists(_mep1002Id);
        if(!exist){
            MEP1002Token(_MEP1002Addr).mintTo(to, _mep1002Id);
        }
        if (_MEP1002Slot[_mep1002Id][_SNCodeType].length == 0) {
            _MEP1002Slot[_mep1002Id][_SNCodeType] = new uint256[](_slotLimits[_SNCodeType]);
        }
        uint slotTokenId = _MEP1002Slot[_mep1002Id][_SNCodeType][_slotIndex];
        if (slotTokenId != 0) {
            if(!getSlotExpired(slotTokenId)) {
                revert SlotAlreadyUsed();
            }
        }
        _MEP1002Slot[_mep1002Id][_SNCodeType][_slotIndex] = _tokenId;
        _slotExpiredBlocks[_tokenId] = block.number + _slotExpiredBlockNum / (2 ** _tokenSlotTimes[_tokenId]);
        _tokenSlotTimes[_tokenId]++;
        _whereSlot[_tokenId] = [_mep1002Id, _SNCodeType, _slotIndex];
        _tokenIdRegionId[_tokenId] = _regionID;
        emit InsertToMEP1002Slot(_mep1002Id, _tokenId, _slotIndex, _SNCodeType);
    }

    /**
     * @dev Removes the MEP1004 token from the specified slot within a MEP1002 token.
     */
    function removeFromMEP1002Slot(uint256 _tokenId, uint256 _mep1002Id, uint256 _slotIndex) external payable {
        bool admin = controllers[_msgSender()];
        if (!_isApprovedOrOwner(_msgSender(), _tokenId) && !admin) {
            revert ERC721NotApprovedOrOwner();
        }
        uint256 SNCodeType = getSNCodeType(_SNCodes[_tokenId]);
        if (SNCodeType == type(uint256).max) {
            revert SNCodeNotAllow();
        }
        if(_MEP1002Slot[_mep1002Id][SNCodeType].length == 0) {
            revert NotCorrectSlotIndex();
        }
        if (_MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] != _tokenId) {
            revert NotCorrectSlotIndex();
        }
        if (msg.value != _exitFee) {
            if(admin) {
                _MEP1004Status[_tokenId] = 1;
            }else {
                revert InsufficientFee();
            }
        }
        _MEP1002Slot[_mep1002Id][SNCodeType][_slotIndex] = 0;
        _slotExpiredBlocks[_tokenId] = 0;
        _whereSlot[_tokenId] = [0, 0, 0];
        emit RemoveFromMEP1002Slot(_mep1002Id, _tokenId, _slotIndex, SNCodeType);
    }

    /**
     * @dev Submit the location proofs of anything.
     */
    function LocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item)
        external
        onlyController
    {
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
        _slotExpiredBlocks[_tokenId] = 0;
        _MEP1004Status[_tokenId] = 0;
    }

    /**
     * @dev search the MEP1004 token in the specified slot within a MEP1002 token.
     */
    function whereSlot(uint256 _tokenId) external view returns (uint256[3] memory) {
        // expired auto remove
        if(getSlotExpired(_tokenId)) {
            uint256[3] memory empty;
            return empty;
        }
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
    function getLocationProofs(string memory _item, uint256 _index, uint256 _batchSize)
        external
        view
        returns (LocationProof[] memory)
    {
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
        uint256 i;
        uint256 j;
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

}

contract ProxiedMEP1004Token is Proxied, UUPSUpgradeable, MEP1004Token {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
