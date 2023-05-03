import { MEP1002Token } from "../typechain-types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import { getDeployments } from "./utils";

require("dotenv").config();

task("update_MEP1002Token").setAction(async (args, hre) => {
    await deployContracts(hre).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
});

export async function deployContracts(hre: HardhatRuntimeEnvironment) {
    const network = hre.network.name;
    const { chainId } = await hre.ethers.provider.getNetwork();
    const deployer = await utils.getDeployer(hre);
    log.debug(`network: ${network}`);
    log.debug(`chainId: ${chainId}`);
    log.debug(`deployer: ${deployer}`);
    const deployed = getDeployments("MEP1002Token");

    const MEP1002TokenFactory = await hre.ethers.getContractFactory(
        "MEP1002Token"
    );

    const MEP1002Token = (await MEP1002TokenFactory.attach(
        deployed.MEP1002Token
    )) as MEP1002Token;

    await MEP1002Token.setBaseURI("https://mep1002token.com/api/token/");
    await MEP1002Token.setNamingToken(
        deployed.MEP1002NamingToken,
        "https://mep1002token.com/api/namingtoken/"
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
