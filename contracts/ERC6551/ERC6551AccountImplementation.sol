pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "../libs/sstore2/utils/Bytecode.sol";
import "../interfaces/IERC6551Account.sol";

contract ERC6551AccountImplementation is IERC165, IERC1271, IERC6551Account {

    uint public accountNonce;

    receive() external payable {}

    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable returns (bytes memory result) {
        require(msg.sender == owner(), "Not token owner");

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
        ++accountNonce;
    }

    function token()
    external
    view
    returns (
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    )
    {
        uint256 length = address(this).code.length;
        (chainId, tokenContract, tokenId) =
        abi.decode(
        Bytecode.codeAt(address(this), length - 0x60, length),
        (uint256, address, uint256)
        );
    }

    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = this
        .token();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    function nonce() external view returns (uint256){
        return accountNonce;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return (interfaceId == type(IERC165).interfaceId ||
        interfaceId == type(IERC6551Account).interfaceId);
    }

    function isValidSignature(bytes32 hash, bytes memory signature)
    external
    view
    returns (bytes4 magicValue)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(
            owner(),
            hash,
            signature
        );

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return "";
    }
}