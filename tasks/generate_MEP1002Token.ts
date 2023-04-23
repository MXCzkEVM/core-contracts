import { MEP1002NamingToken, MEP1002Token } from "../typechain-types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import * as h3 from "h3-js";
import { BigNumber } from "ethers";
require("dotenv").config();

task("generate_MEP1002Token")
  .addParam("tokenAddress", "MEP1002Token Contract Address")
  .setAction(async (args, hre) => {
  const network = hre.network.name;
  const { chainId } = await hre.ethers.provider.getNetwork();
  const deployer = await utils.getDeployer(hre);
  log.debug(`network: ${network}`);
  log.debug(`chainId: ${chainId}`);
  log.debug(`deployer: ${deployer}`);
  log.debug(`tokenAddress: ${args.tokenAddress}`)

  await execute(hre,args).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
})

interface JSONResult {
  nearest: {
    latt: string;
    longt: string;
  }
}
export async function execute(hre: HardhatRuntimeEnvironment, args: any) {
  const [signer] = await hre.ethers.getSigners();
  const MEP1002TokenAddr = args.tokenAddress;
  const MEP1002TokenFactory = await hre.ethers.getContractFactory("MEP1002Token");
  const MEP1002Token = await MEP1002TokenFactory.attach(MEP1002TokenAddr) as MEP1002Token;

  while (true) {
    try {
      const promises = [] as Promise<JSONResult>[];
      for(let i = 0; i < 10; i++) {
        promises.push(fetch("https://api.3geonames.org/?randomland=yes&json=1").then((res) => res.json()))
      }
      const promises2 = [] as Promise<unknown>[];
      await Promise.all(promises).then((res) => {
        for(let i = 0; i < res.length; i++) {
          const h3Index = h3.latLngToCell(parseFloat(res[i].nearest.latt), parseFloat(res[i].nearest.longt),7);
          promises2.push(MEP1002Token.connect(signer).mint(BigNumber.from(`0x${h3Index}`)))
        }
      })
      const res = await Promise.all(promises2);
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

