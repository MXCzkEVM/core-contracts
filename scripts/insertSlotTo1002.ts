import { MEP1004Token } from "../typechain-types";
import { getNamedSigners } from "hardhat-deploy-ethers/internal/helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "../tasks/log";
import { BigNumber } from "ethers";

const hre = require("hardhat") as HardhatRuntimeEnvironment;

async function main() {
    const network = hre.network.name;
    log.debug(`network: ${network}`);
    const { ethers } = await hre;
    const { deployer } = await getNamedSigners(hre);
    const MEP1004Token = await ethers.getContract<MEP1004Token>("MEP1004Token");
    const MEP1002TokenIds = [
        BigNumber.from("608530350842314751"), //  podgorica edcon2023.mxc
        BigNumber.from("608533319822344191"), // berlin techcode.mxc
    ];
    console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[0]));
    console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[1]));
    return;
    const tx = await MEP1004Token.insertToMEP1002Slot(
        BigNumber.from(1),
        MEP1002TokenIds[0],
        0,
        { gasLimit: 200000 }
    );
    console.log(await tx.wait());
    const tx2 = await MEP1004Token.insertToMEP1002Slot(
        BigNumber.from(2),
        MEP1002TokenIds[1],
        0,
        { gasLimit: 200000 }
    );
    console.log(await tx2.wait());
    // await MEP1004Token.insertToMEP1002Slot(
    //     BigNumber.from(3),
    //     MEP1002TokenIds[0],
    //     1,
    //     { gasLimit: 200000 }
    // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
