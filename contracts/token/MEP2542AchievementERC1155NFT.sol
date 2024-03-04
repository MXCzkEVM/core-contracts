// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {SignatureCheckerUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";


error ERC721NotApprovedOrOwner();
error Minted();
error InvalidSignature();
contract MEP2542AchievementERC1155NFT is ControllableUpgradeable,ERC1155Upgradeable {

    address private MEP1004Token;
    string public name;
    string public symbol;
    mapping(uint id => mapping(uint mep1004TokenId => bool)) public tokenMinted;
    address public permitOwner;


    function initialize(address MEP1004Token_,string memory name_, string memory symbol_, string memory uri_, address permitOwner_) external initializer {
        MEP1004Token = MEP1004Token_;
        name = name_;
        symbol = symbol_;
        permitOwner = permitOwner_;
        __Controllable_init();
        __ERC1155_init(uri_);
    }

    // uri = https://[wannsee-]mining.matchx.io/api/metadata/{id} or ipns ?
    function setURI(string memory newuri) external onlyController {
        _setURI(newuri);
    }

    function setPermitOwner(address permitOwner_) external onlyController {
        permitOwner = permitOwner_;
    }

    function mint(address _to, uint id, uint amount, bytes memory data) external onlyController {
        _mint(_to, id, amount, data);
    }

    function mintWithPermit(uint mep1004TokenId, address _to, uint id, bytes calldata signature) external {
        if(IERC721(MEP1004Token).ownerOf(mep1004TokenId) != _msgSender()) {
            revert ERC721NotApprovedOrOwner();
        }
        if(tokenMinted[id][mep1004TokenId]) {
            revert Minted();
        }
        if (!SignatureCheckerUpgradeable.isValidSignatureNow(permitOwner, _permitHash(mep1004TokenId, permitOwner, _msgSender(), id), signature)) {
            revert InvalidSignature();
        }
        tokenMinted[id][mep1004TokenId] = true;
        _mint(_to, id, 1, "");
    }

    function PERMIT_TYPEHASH() public pure returns (bytes32) {
        return keccak256("Permit(uint256 mep1004TokenId,address owner,address spender,uint256 tokenId)");
    }

    function _permitHash(
        uint _mep1004TokenId,
        address _owner,
        address _spender,
        uint _tokenId
    ) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH(), _mep1004TokenId, _owner, _spender, _tokenId))
            )
        );
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _computeDomainSeparator();
    }

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")),
                keccak256(abi.encodePacked("MEP2542AchievementERC1155NFT")),
                keccak256(abi.encodePacked("1")),
                block.chainid,
                address(this)
            )
        );
    }
}


contract ProxiedMEP2542AchievementERC1155NFT is Proxied, UUPSUpgradeable, MEP2542AchievementERC1155NFT {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
