// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library H3Library {

    uint256 private constant _MIN_RESOLUTION = 7;
    uint256 private constant _MAX_RESOLUTION = 15;
    uint256 constant private CENTER_DIGIT = 7;
    uint256 constant private H3_DIGIT_MASK = 7;

    function getMinResolution() internal pure returns (uint256) {
        return _MIN_RESOLUTION;
    }

    function isValidCell(uint256 h3) internal pure returns (bool) {
        if ((h3 >> 63) != 0) {
            return false;
        }

        if (((h3 >> 59) & 0x7) != 0) {
            return false;
        }

        uint32 baseCell = uint32(h3 >> 52) & 0x3F;
        if (baseCell >= 122) {
            return false;
        }

        uint256 res = getResolution(h3);
        if (res < _MIN_RESOLUTION || res > _MAX_RESOLUTION) {
            return false;
        }

        bool foundFirstNonZeroDigit = false;
        for (uint256 i = 15; i >= 15 - res; i--) {
            uint256 digit = h3 >> (i * 3) & 0x7;
            if (digit == 0) {
                if (foundFirstNonZeroDigit) {
                    return false;
                }
            } else {
                foundFirstNonZeroDigit = true;

                if (digit > 6 || (baseCell == 4 && digit == 1)) {
                    return false;
                }
            }
        }

        return true;
    }

    function getResolution(uint256 h3) internal pure returns (uint256) {
        return (h3 & 15728640) >> 52;
    }

    function cellToParent(uint256 h3Index) internal pure returns (uint256) {
        uint256 childRes = getResolution(h3Index);
        uint256 parentRes = childRes - 1;
        if (parentRes < _MIN_RESOLUTION) {
            return 0;
        }

        if (parentRes == childRes) {
            return h3Index;
        }

        uint256 parentH = h3SetResolution(h3Index, parentRes);

        if(parentH == 0) return 0;

        for (uint256 i = parentRes + 1; i <= childRes; i++) {
            parentH = h3SetIndexDigit(parentH, i, H3_DIGIT_MASK);
        }

        return parentH;
    }

    function h3SetIndexDigit(uint256 h3Index, uint256 digitIndex, uint256 digitValue) internal pure returns (uint256) {
        uint64 newH3Index;
        assembly {
            let p := add(h3Index, sub(31, mul(digitIndex, 3)))
            mstore8(p, digitValue)
            newH3Index := h3Index
        }
        return newH3Index;
    }


    function h3SetResolution(uint256 h3Index, uint256 parentRes) internal pure returns (uint256) {
        uint256 childRes = getResolution(h3Index);

        uint256 newH3Index = h3Index;

        if (parentRes < childRes) {
            uint256 numToRemove = childRes - parentRes;

            for (uint256 i = 0; i < numToRemove; i++) {
//                newH3Index = h3GetParent(newH3Index);

                newH3Index = h3SetIndexDigit(newH3Index, childRes - i, CENTER_DIGIT);
            }
        }else {
            return 0;
        }
        return newH3Index;
    }

}
