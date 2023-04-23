import { MEP1002NamingToken, MEP1002Token } from "../typechain-types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
require("dotenv").config();

task("deploy_MEP1002Token").setAction(async (args, hre) => {
  const network = hre.network.name;
  const { chainId } = await hre.ethers.provider.getNetwork();
  const deployer = await utils.getDeployer(hre);
  log.debug(`network: ${network}`);
  log.debug(`chainId: ${chainId}`);
  log.debug(`deployer: ${deployer}`);


  await deployContracts(hre).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
})

export async function deployContracts(hre: HardhatRuntimeEnvironment) {

  const MEP1002NamingTokenFactory = await hre.ethers.getContractFactory("MEP1002NamingToken");
  const MEP1002TokenFactory = await hre.ethers.getContractFactory("MEP1002Token");

  const MEP1002NamingToken = (await MEP1002NamingTokenFactory.deploy()) as MEP1002NamingToken;
  const MEP1002Token = await MEP1002TokenFactory.deploy() as MEP1002Token;

  await MEP1002NamingToken.deployed();
  await MEP1002Token.deployed();

  await MEP1002Token.init("MEP1002Token", "MEP1002", MEP1002NamingToken.address);


  console.log("MEP1002NamingToken deployed to:", MEP1002NamingToken.address);
  console.log("MEP1002Token deployed to:", MEP1002Token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

