// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* is ERC6059 */
interface IMEP1002 {
    // Returns the h3geo coordinate of the MEP1002.
    function geolocation(uint256 _tokenId) external view returns (uint256);
}
