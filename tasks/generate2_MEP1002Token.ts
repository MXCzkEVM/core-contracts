import { MEP1002Token } from "../typechain-types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

require("dotenv").config();
const list = require("./list.json");

task("generate2_MEP1002Token")
    .addParam("tokenAddress", "MEP1002Token Contract Address")
    .setAction(async (args, hre) => {
        const network = hre.network.name;
        const { chainId } = await hre.ethers.provider.getNetwork();
        const deployer = await utils.getDeployer(hre);
        log.debug(`network: ${network}`);
        log.debug(`chainId: ${chainId}`);
        log.debug(`deployer: ${deployer}`);
        log.debug(`tokenAddress: ${args.tokenAddress}`);

        await execute(hre, args).catch((error) => {
            console.error(error);
            process.exitCode = 1;
        });
    });

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function execute(hre: HardhatRuntimeEnvironment, args: any) {
    const [signer] = await hre.ethers.getSigners();

    const MEP1002TokenAddr = args.tokenAddress;
    const MEP1002TokenFactory = await hre.ethers.getContractFactory(
        "MEP1002Token"
    );
    const MEP1002Token = (await MEP1002TokenFactory.attach(
        MEP1002TokenAddr
    ).connect(signer)) as MEP1002Token;
    const nonce = await signer.getTransactionCount();
    let tranCount = 0;
    try {
        for (let i = 0; i < list.cell.length; i++) {
            const owner = await MEP1002Token.ownerOf(
                list.cell[i].h3CellId
            ).catch((e) => {});
            if (!owner) {
                const res = await MEP1002Token.mint(
                    BigNumber.from(list.cell[i].h3CellId),
                    {
                        nonce: nonce + tranCount,
                        gasPrice: parseUnits("3000", "gwei"),
                        gasLimit: 800000,
                    }
                );
                tranCount++;
                console.log(
                    "index",
                    i + 1,
                    nonce + tranCount,
                    list.cell[i].h3CellId
                );
            }
        }
    } catch (e) {
        console.log(e);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
