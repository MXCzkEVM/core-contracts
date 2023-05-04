// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IMEP1002NamingToken} from "./IMEP1002NamingToken.sol";
import {
ERC721Upgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {
ERC721EnumerableUpgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {
StringsUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {
UUPSUpgradeable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";

contract MEP1002NamingToken is
IMEP1002NamingToken,
ERC721EnumerableUpgradeable,
ControllableUpgradeable,
Proxied,
UUPSUpgradeable
{
    using StringsUpgradeable for uint256;

    string private _baseUri;

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

    function mint(address to, uint256 tokenId) external onlyController {
        _safeMint(to, tokenId);
    }

    function setBaseURI(string memory baseURI_) external onlyController {
        _baseUri = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    uint256[49] private __gap;
}
