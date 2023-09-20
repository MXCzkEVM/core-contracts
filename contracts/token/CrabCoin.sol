// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Importing OpenZeppelin libraries, which provide secure contract templates
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import {Proxied} from "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import {ControllableUpgradeable} from "../common/ControllableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract CrabCoin is ControllableUpgradeable, ERC20PermitUpgradeable {

    address public treasury;

    uint public LPWANFee; // 50 = 0.5%, 100 = 1%, 10000 = 100%

    mapping (address => bool) private _inWhitelist;

    address[] private _whitelist;

    uint256[46] private __gap;

    function initialize(address _treasury, address _recipient, uint _defaultLPWANFee) external initializer {
        __Controllable_init();
        __ERC20_init("Crab Coin", "CRAB");
        __ERC20Permit_init("CRAB");
        treasury = _treasury;
        LPWANFee = _defaultLPWANFee;
        _mint(_recipient, 100000000 * (10 ** decimals()));

        _inWhitelist[_recipient] = true;
        _whitelist.push(_recipient);
        _inWhitelist[_treasury] = true;
        _whitelist.push(_treasury);
    }

    function addWhiteList(address account) external onlyController {
        _inWhitelist[account] = true;
        _whitelist.push(account);
    }

    function removeWhiteList(address account) external onlyController {
        _inWhitelist[account] = false;
        for (uint i = 0; i < _whitelist.length; i++) {
            if (_whitelist[i] == account) {
                _whitelist[i] = _whitelist[_whitelist.length - 1];
                _whitelist.pop();
                break;
            }
        }
    }

    function _applyFee(uint amount) internal view returns (uint) {
        if(LPWANFee == 0) {
            return 0;
        }
        if(_inWhitelist[_msgSender()]) {
            return 0;
        }
        return amount * LPWANFee / 10000;
    }

    function setLPWANFee(uint _LPWANFee) external onlyController {
        LPWANFee = _LPWANFee;
    }

    function transfer(address to, uint amount) public override returns (bool) {
        if (_inWhitelist[msg.sender] || _inWhitelist[to]) {
            _transfer(msg.sender, to, amount);
        } else {
            uint fee = _applyFee(amount);
            _transfer(msg.sender, treasury, fee);
            _transfer(msg.sender, to, amount - fee);
        }
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        if (_inWhitelist[from] || _inWhitelist[to]) {
            _transfer(from, to, amount);
        } else {
            uint fee = _applyFee(amount);
            _transfer(from, treasury, fee);
            _transfer(from, to, amount - fee);
        }
        return true;
    }

}

contract ProxiedCrabCoin is Proxied, UUPSUpgradeable, CrabCoin  {
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
