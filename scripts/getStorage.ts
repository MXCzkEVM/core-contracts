import { getAddress } from "@ethersproject/address";
import {
    MEP1002NamingToken,
    MEP1002Token,
    MEP1004Token,
} from "../typechain-types";
import { getNamedSigners } from "hardhat-deploy-ethers/internal/helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "../tasks/log";

const hre = require("hardhat") as HardhatRuntimeEnvironment;

async function main() {
    const network = hre.network.name;
    log.debug(`network: ${network}`);
    const { ethers } = await hre;
    const { deployer } = await getNamedSigners(hre);
    const MEP1002NamingToken = await ethers.getContract<MEP1002NamingToken>(
        "MEP1002NamingToken"
    );
    const MEP1002Token = await ethers.getContract<MEP1002Token>("MEP1002Token");
    const MEP1004Token = await ethers.getContract<MEP1002Token>("MEP1004Token");

    const MEP1002NamingTokenOwnerStorage = await ethers.provider.getStorageAt(
        MEP1002NamingToken.address,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );

    const MEP1002OwnerStorage = await ethers.provider.getStorageAt(
        MEP1002Token.address,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );
    const MEP1004OwnerStorage = await ethers.provider.getStorageAt(
        MEP1004Token.address,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );

    const MEP1002NamingOwner = getAddress(
        `0x${MEP1002NamingTokenOwnerStorage.substr(-40)}`
    );
    console.log("MEP1002NamingToken currentOwner", MEP1002NamingOwner);
    const MEP1002Owner = getAddress(`0x${MEP1002OwnerStorage.substr(-40)}`);
    console.log("MEP1002Token currentOwner", MEP1002Owner);
    const MEP1004Owner = getAddress(`0x${MEP1004OwnerStorage.substr(-40)}`);
    console.log("MEP1004Token currentOwner", MEP1004Owner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
