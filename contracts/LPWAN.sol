// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {
StringsUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {
UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
AddressUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {SignatureCheckerUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/SignatureCheckerUpgradeable.sol";
import {ControllableUpgradeable} from "./common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {MEP1004Token} from "./token/MEP1004Token.sol";
import {LibAddress} from "./libs/LibAddress.sol";
import {ReentrancyGuard} from "./libs/ReentrancyGuard.sol";
import {AggregatorInterface} from "./interfaces/AggregatorInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";



error INVALID_SIGNATURE();
error INVALID_REWARD();

/**
 * @title LPWAN
 * @dev The LPWAN contract provides a set of functionalities for managing the LPWAN token system, including reward systems and token minting.
 * @notice This contract inherits from ControllableUpgradeable and ReentrancyGuard
 */
contract LPWAN is
ControllableUpgradeable, ReentrancyGuard
{
    using LibAddress for address;

    event ClaimReward(address indexed account, address indexed to, uint amount);

    event BurnExcessToken(uint indexed id, uint amount);

    address private _MEP1004Address;

    mapping(address => uint) private claimedReward;

    uint256[98] private __gap;

    /**
     * @dev initialize contract with initial variables
     * @param MEP1004Address_ Address of the MEP1004 token
     */
    function initialize(
        address MEP1004Address_
    ) external initializer {
        _MEP1004Address = MEP1004Address_;
        __Controllable_init();
    }

    function getMEP1004Addr() external view returns (address) {
        return _MEP1004Address;
    }

    function setMEP1004Addr(address MEP1004Address) external onlyController returns (address)  {
        return _MEP1004Address = MEP1004Address;
    }

    // @dev admin mint MEP1004 token for device owner
    function mintMEP1004Stations(address _to, string memory _SNCode, uint _H3Index,string memory _regionID) external onlyController {
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode, _H3Index, _regionID);
    }

    function mintMEP1004StationsBySignature(address _to, uint _H3Index, string memory _SNCode, string memory regionID, address _signer, bytes calldata _signature) external {
        // check _signature
        _checkMintSignature(_H3Index, _SNCode, _signer, _signature);
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode, _H3Index, regionID);
    }

    function _checkMintSignature(uint _H3Index, string memory _SNCode, address _signer, bytes calldata _signature) internal {
        if(!controllers[_signer]) {
            revert INVALID_SIGNATURE();
        }
        bytes32 _hash = _permitHash(_H3Index, _SNCode, _signer, _msgSender());
        if (!SignatureCheckerUpgradeable.isValidSignatureNow(_signer, _hash, _signature)) {
            revert INVALID_SIGNATURE();
        }
    }

    function PERMIT_TYPEHASH() public view returns (bytes32) {
        return keccak256("Permit(uint256 h3Index,string sncode,address owner,address spender)");
    }

    function PERMIT_TYPEHASH2() public view returns (bytes32) {
        return keccak256("Permit(uint256 amount,address owner,address spender)");
    }

    function _permitHash(
        uint _H3Index,
        string memory _SNCode,
        address _owner,
        address _spender
    ) private returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH(),_H3Index,_SNCode, _owner, _spender))
            )
        );
    }

    function _claimSuperNodePermitHash(
        uint totalReward,
        address _owner,
        address _spender
    ) private returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(PERMIT_TYPEHASH2(), totalReward, _owner, _spender))
            )
        );
    }

    function _computeDomainSeparator() private view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("LPWAN")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function DOMAIN_SEPARATOR() public view returns (bytes32) {
        return _computeDomainSeparator();
    }

    // @dev admin submit the location proof of the asset
    function submitLocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external onlyController {
        MEP1004Token(_MEP1004Address).LocationProofs(_MEP1002TokenId, _MEP1004TokenIds, _item);
    }

    // @dev admin burn mxc
    function burnExcessToken(uint amount) external onlyController {
        address(0).sendEtherUnchecked(amount);
        emit BurnExcessToken(block.number, amount);
    }

    // @dev admin withdrawal mxc for sync reward cost or other cost
    function withdrawal(address to,uint amount) external onlyController {
        to.sendEther(amount);
    }

    // admin transfer approve token to spender
    function approveToken(address token, address spender, uint amount) external onlyController returns (bool) {
        return IERC20(token).approve(spender, amount);
    }

    // @dev validator claim reward
    function claimSupernodeReward(address to, uint totalReward, bool burn, address _signer, bytes calldata _signature) external nonReentrant {
        if(!controllers[_signer]) {
            revert INVALID_SIGNATURE();
        }
        bytes32 _hash = _claimSuperNodePermitHash(totalReward, _signer, _msgSender());
        if (!SignatureCheckerUpgradeable.isValidSignatureNow(_signer, _hash, _signature)) {
            revert INVALID_SIGNATURE();
        }
        if (claimedReward[_msgSender()] > totalReward) {
            revert INVALID_REWARD();
        }
        uint amount = totalReward - claimedReward[_msgSender()];
        claimedReward[_msgSender()] = totalReward;

        if (burn) {
            address(0).sendEtherUnchecked(amount);
        } else {
            to.sendEther(amount);
        }
        emit ClaimReward(_msgSender(), burn ? address(0) : to, amount);
    }
}

contract ProxiedLPWAN is Proxied, UUPSUpgradeable, LPWAN{
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}