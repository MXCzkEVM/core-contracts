// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library H3Library {
    uint256 private constant _MIN_RESOLUTION = 7;
    uint256 private constant _MAX_RESOLUTION = 15;

    uint256 private constant MAX_H3_RES = 15;
    uint256 private constant CENTER_DIGIT = 0;
    uint256 private constant H3_DIGIT_MASK = 7;
    uint256 private constant H3_MAX_OFFSET = 63;
    uint256 private constant H3_HIGH_BIT_MASK = 1 << H3_MAX_OFFSET;
    uint256 private constant H3_MODE_OFFSET = 59;
    uint256 private constant H3_MODE_MASK = 15 << H3_MODE_OFFSET;
    uint256 private constant H3_RESERVED_OFFSET = 56;
    uint256 private constant H3_RESERVED_MASK = 7 << H3_RESERVED_OFFSET;
    uint256 private constant H3_BC_OFFSET = 45;
    uint256 private constant H3_BC_MASK = 127 << H3_BC_OFFSET;
    uint256 private constant H3_PER_DIGIT_OFFSET = 3;
    uint256 private constant NUM_BASE_CELLS = 122;
    uint256 private constant INVALID_DIGIT = 7;
    uint256 private constant NUM_DIGITS = 7;
    uint256 private constant K_AXES_DIGIT = 1;
    uint256 private constant H3_CELL_MODE = 1;
    uint256 private constant H3_RES_OFFSET = 52;
    uint256 private constant H3_RES_MASK = 15 << H3_RES_OFFSET;
    uint256 private constant H3_RES_MASK_NEGATIVE = ~H3_RES_MASK;

    function getMinResolution() internal pure returns (uint256) {
        return _MIN_RESOLUTION;
    }

    function isValidCell(uint256 h3) internal pure returns (bool) {
        if (getHighBit(h3) != 0) return false;

        if (getMode(h3) != H3_CELL_MODE) return false;

        if (getReservedBits(h3) != 0) return false;

        uint256 baseCell = getBaseCell(h3);

        if (baseCell < 0 || baseCell > NUM_BASE_CELLS) {
            return false;
        }

        uint256 res = getResolution(h3);

        if (res < _MIN_RESOLUTION || res > _MAX_RESOLUTION) {
            return false;
        }

        bool foundFirstNonZeroDigit = false;
        for (uint256 i = 1; i <= res; i++) {
            uint256 digit = getIndexDigit(h3, i);

            if (!foundFirstNonZeroDigit && digit != CENTER_DIGIT) {
                foundFirstNonZeroDigit = true;
                if (_isBaseCellPentagon(baseCell) && digit == K_AXES_DIGIT) {
                    return false;
                }
            }

            if (digit < CENTER_DIGIT || digit >= NUM_DIGITS) {
                return false;
            }
        }

        for (uint256 i = res + 1; i <= MAX_H3_RES; i++) {
            if (getIndexDigit(h3, i) != INVALID_DIGIT) {
                return false;
            }
        }

        return true;
    }

    function getResolution(uint256 h3) internal pure returns (uint256) {
        return ((h3 & H3_RES_MASK) >> H3_RES_OFFSET);
    }

    function cellToParent(
        uint256 h3Index,
        uint256 parentRes
    ) internal pure returns (uint256) {
        uint256 childRes = getResolution(h3Index);
        if (parentRes < 0 || parentRes > MAX_H3_RES) {
            return 0;
        } else if (parentRes > childRes) {
            return 0;
        } else if (parentRes == childRes) {
            return h3Index;
        }

        uint256 parentH = h3SetResolution(h3Index, parentRes);

        // TODO: fix
        for (uint256 i = parentRes + 1; i <= childRes; i++) {
            parentH = h3SetIndexDigit(parentH, i, H3_DIGIT_MASK);
        }

        return parentH;
    }

    function h3SetIndexDigit(
        uint256 h3Index,
        uint256 res,
        uint256 digit
    ) internal pure returns (uint256) {
        return
            (h3Index &
                ~(
                    (H3_DIGIT_MASK <<
                        ((MAX_H3_RES - (res)) * H3_PER_DIGIT_OFFSET))
                )) | ((digit << (MAX_H3_RES - res)) * H3_PER_DIGIT_OFFSET);
    }

    function h3SetResolution(
        uint256 h3Index,
        uint256 parentRes
    ) internal pure returns (uint256) {
        return (h3Index & H3_RES_MASK_NEGATIVE) | (parentRes << H3_RES_OFFSET);
    }

    function getHighBit(uint256 h3) internal pure returns (uint256) {
        return (h3 & H3_HIGH_BIT_MASK) >> H3_MAX_OFFSET;
    }

    function getMode(uint256 h3) internal pure returns (uint256) {
        return (h3 & H3_MODE_MASK) >> H3_MODE_OFFSET;
    }

    function getReservedBits(uint256 h3) internal pure returns (uint256) {
        return (h3 & H3_RESERVED_MASK) >> H3_RESERVED_OFFSET;
    }

    function getBaseCell(uint256 h3) internal pure returns (uint256) {
        return (h3 & H3_BC_MASK) >> H3_BC_OFFSET;
    }

    function getIndexDigit(
        uint256 h3,
        uint256 res
    ) internal pure returns (uint256) {
        return
            (h3 >> ((MAX_H3_RES - res) * H3_PER_DIGIT_OFFSET)) & H3_DIGIT_MASK;
    }

    function _isBaseCellPentagon(
        uint256 baseCell
    ) internal pure returns (bool) {
        if (baseCell < 0 || baseCell >= NUM_BASE_CELLS) {
            return false;
        }
        return baseCellData(baseCell) == 1;
    }

    function baseCellData(uint256 baseCell) internal pure returns (uint8) {
        uint8[NUM_BASE_CELLS] memory baseCellDatas = [
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0
        ];
        return baseCellDatas[baseCell];
    }
}
