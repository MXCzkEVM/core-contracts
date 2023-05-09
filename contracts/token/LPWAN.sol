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

import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {MEP1004Token} from "./MEP1004Token.sol";

contract LPWAN is
ControllableUpgradeable
{

    address private _MEP1004Address;

    constructor(address MEP1004Address_) initializer {
        _MEP1004Address = MEP1004Address_;
        __Controllable_init(_msgSender());
    }

    function mintMEP1004Stations(address _to, string memory _SNCode) external onlyController {
        MEP1004Token(_MEP1004Address).mint(_to, _SNCode);
    }

    function submitLocationProofs(uint256 _MEP1002TokenId, uint256[] memory _MEP1004TokenIds, string memory _item) external onlyController {
        MEP1004Token(_MEP1004Address).LocationProofs(_MEP1002TokenId, _MEP1004TokenIds, _item);
    }

}