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
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
StringsUpgradeable
} from "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
contract MEP1002NamingToken is
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    IMEP1002NamingToken
{
    using StringsUpgradeable for uint256;

    string private _baseUri;

    function init(
        string memory name_,
        string memory symbol_
    ) external initializer {
        __ERC721_init(name_,symbol_);
        __Ownable_init();
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _safeMint(to, tokenId);
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseUri = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseUri;
    }
}
