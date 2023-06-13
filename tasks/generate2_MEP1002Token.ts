import {MEP1002Token, ProxiedMEP1002Token} from "../typechain-types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import {ethers} from "hardhat";

require("dotenv").config();
const list = require("./list.json");

task("generate2_MEP1002Token")
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
  const {ethers} = hre;
    const [signer] = await ethers.getSigners();
    const MEP1002Token = await ethers.getContract<ProxiedMEP1002Token>(
      "ProxiedMEP1002Token"
    );
    const nonce = await signer.getTransactionCount();
    let tranCount = 0;
    try {
        for (let i = 0; i < list.cell.length; i++) {
            const fee = await signer.getFeeData();
            const owner = await MEP1002Token.ownerOf(
                list.cell[i].h3CellId
            ).catch((e) => {});
            if (!owner) {
                const res = await MEP1002Token.mint(
                    BigNumber.from(list.cell[i].h3CellId),
                    {
                        nonce: nonce + tranCount,
                        gasPrice: fee.gasPrice?.mul(110).div(100)
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
