import { MEP1002Token } from "../typechain-types";
import { getNamedSigners } from "hardhat-deploy-ethers/internal/helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "../tasks/log";
import { BigNumber } from "ethers";
import h3 from "h3-js";

const hre = require("hardhat") as HardhatRuntimeEnvironment;

async function main() {
    const network = hre.network.name;
    log.debug(`network: ${network}`);
    const { ethers } = await hre;
    const { deployer } = await getNamedSigners(hre);
    const MEP1002Token = await ethers.getContract<MEP1002Token>("MEP1002Token");
    // edcon2023
    // const h3Index = h3.latLngToCell(
    //     parseFloat("42.4174489"),
    //     parseFloat("19.1991344"),
    //     7
    // );
    // const tx = await MEP1002Token.mint(BigNumber.from(`0x${h3Index}`));
    // const tx = await MEP1002Token.setName(
    //     BigNumber.from(`0x${h3Index}`),
    //     BigNumber.from(
    //         "95077202456789140163296329432349729846379008864439292530008586234721542969597" // edcon2023
    //     )
    // );
    // console.log(tx.wait());
    // berlin techcode
    const h3Index = h3.latLngToCell(
        parseFloat("52.5198169"),
        parseFloat("13.4012711"),
        7
    );

    await MEP1002Token.mint(BigNumber.from(`0x${h3Index}`), {
        gasLimit: 300000,
    });
    const tx = await MEP1002Token.setName(
        BigNumber.from(`0x${h3Index}`),
        BigNumber.from(
            "3328730917653459264487287507426558544595858341632972026639240405491088952331" // techcode
        )
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
