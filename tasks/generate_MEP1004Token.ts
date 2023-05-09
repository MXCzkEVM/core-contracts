import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import { LPWAN } from "../typechain-types";
import { BigNumber, utils as ethersUtils } from "ethers";
import { getNamedSigners } from "hardhat-deploy-ethers/internal/helpers";

require("dotenv").config();
const list = require("./list.json");

task("generate_MEP1004AndProofOfLocation").setAction(async (args, hre) => {
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
    const { ethers } = await hre;
    const { deployer } = await getNamedSigners(hre);
    const LPWAN = await ethers.getContract<LPWAN>("LPWAN");
    const nonce = await deployer.getTransactionCount();
    console.log(nonce.toString());
    let tranCount = 0;
    try {
        while (true) {
            const MEP1002TokenId = getRandomMEP1002TokenId();
            const M2XTestSNCode = getRandomM2XTestSNCode();
            const NEOTestSNCode1 = getRandomNEOTestSNCode();
            const NEOTestSNCode2 = getRandomNEOTestSNCode();
            const RandomAssets = getRandomAssets();
            const tx = await LPWAN.mintMEP1004Stations(
                deployer.address,
                M2XTestSNCode,
                {
                    nonce: nonce + tranCount,
                }
            );
            await LPWAN.mintMEP1004Stations(deployer.address, NEOTestSNCode1, {
                nonce: nonce + tranCount + 1,
            });
            await LPWAN.mintMEP1004Stations(deployer.address, NEOTestSNCode2, {
                nonce: nonce + tranCount + 2,
            });
            await LPWAN.submitLocationProofs(
                MEP1002TokenId,
                [
                    stringToKeccak256Bn(M2XTestSNCode),
                    stringToKeccak256Bn(NEOTestSNCode1),
                    stringToKeccak256Bn(NEOTestSNCode2),
                ],
                RandomAssets,
                {
                    nonce: nonce + tranCount + 3,
                }
            );
            tranCount += 4;
            console.log(
                `generated Proof:
                    index: ${tranCount / 4}
                    MEP1002TokenID: ${MEP1002TokenId.toString()}
                    M2X: ${M2XTestSNCode.toString()},
                    NEO1: ${NEOTestSNCode1.toString()},
                    NEO2: ${NEOTestSNCode2.toString()},
                    Assets: ${RandomAssets.toString()}`
            );
        }
    } catch (e) {
        console.log(e);
    }
}

function stringToKeccak256Bn(str: string) {
    return BigNumber.from(ethersUtils.keccak256(ethersUtils.toUtf8Bytes(str)));
}

function getRandomMEP1002TokenId() {
    const rand = Math.floor(Math.random() * list.cell.length) + 1;
    return BigNumber.from(list.cell[rand - 1].h3CellId);
}

function getRandomM2XTestSNCode() {
    return `M2XTEST${randomString(8, randomChars)}`;
}

function getRandomNEOTestSNCode() {
    return `NEOTEST${randomString(16, randomChars)}`;
}

function getRandomAssets() {
    return `P${randomString(20, randomChars)}`;
}

const randomChars = "1234567890ABCDEFGHIJKL";

function randomString(length: number, chars: string) {
    let result = "";
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
