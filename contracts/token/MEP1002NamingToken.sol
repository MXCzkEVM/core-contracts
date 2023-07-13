// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IMEP1002NamingToken} from "./IMEP1002NamingToken.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721EnumerableUpgradeable} from
    "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {StringsUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";

contract MEP1002NamingToken is ControllableUpgradeable, IMEP1002NamingToken, ERC721EnumerableUpgradeable {
    using StringsUpgradeable for uint256;

    string private _baseUri;

    function initialize(string memory name_, string memory symbol_) external initializer {
        __Controllable_init();
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

    uint256[49] private __gap;
}

contract ProxiedMEP1002NamingToken is Proxied, UUPSUpgradeable, MEP1002NamingToken {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
