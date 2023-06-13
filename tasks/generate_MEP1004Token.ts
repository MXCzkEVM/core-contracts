import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "./log";
import * as utils from "./utils";
import {LPWAN, MEP1004Token, ProxiedLPWAN, ProxiedMEP1002Token, ProxiedMEP1004Token} from "../typechain-types";
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
  const { deployer,owner } = await getNamedSigners(hre);
  console.log(deployer.address,owner.address)
  const LPWAN = await ethers.getContract<ProxiedLPWAN>("ProxiedLPWAN",owner);
  const MEP1002 = await ethers.getContract<ProxiedMEP1002Token>("ProxiedMEP1002Token");

  const MEP1004 = await ethers.getContract<ProxiedMEP1004Token>("ProxiedMEP1004Token");

  const MEP1002TokenIds = [
    BigNumber.from("608530350842314751"), //  podgorica edcon2023.mxc   nft 2
    BigNumber.from("608533319822344191"), // berlin techcode.mxc  nft 0,1
    BigNumber.from("609765017859915775"), //  Singapore singapore.mxc 3
    BigNumber.from("608818980848664575") // Tokyo nft tokyo.mxc 4
  ];

  const MEP1004TokenIds: { [key: string]: BigNumber[] } = {
    [MEP1002TokenIds[0].toString()]: [BigNumber.from(1), BigNumber.from(2), BigNumber.from(3)],
    [MEP1002TokenIds[1].toString()]: [BigNumber.from(4), BigNumber.from(5), BigNumber.from(6)],
    [MEP1002TokenIds[2].toString()]: [BigNumber.from(7), BigNumber.from(8), BigNumber.from(9)],
    [MEP1002TokenIds[3].toString()]: [BigNumber.from(10), BigNumber.from(11), BigNumber.from(12)]
  };

  const NftAssets: { [key: string]: string[] } = {
    [MEP1002TokenIds[0].toString()]: ["2"],
    [MEP1002TokenIds[1].toString()]: ["0", "1"],
    [MEP1002TokenIds[2].toString()]: ["3"],
    [MEP1002TokenIds[3].toString()]: ["4"]
  };

  const nonce = await owner.getTransactionCount();
  let tranCount = 0;
  //
  for (let i = 0; i < MEP1002TokenIds.length; i++) {
    // const fee = await owner.getFeeData();
    //
    // const M2XTestSNCode = getRandomM2XTestSNCode();
    // const NEOTestSNCode1 = getRandomNEOTestSNCode();
    // const NEOTestSNCode2 = getRandomNEOTestSNCode();
    // const tx = await LPWAN.mintMEP1004Stations(
    //     "0x45A83F015D0265800CBC0dACe1c430E724D49cAc",
    //     M2XTestSNCode,
    //     {
    //       nonce: nonce + tranCount,
    //       gasPrice: fee.gasPrice?.mul(200).div(100)
    //     }
    // );
    // await LPWAN.mintMEP1004Stations("0x45A83F015D0265800CBC0dACe1c430E724D49cAc", NEOTestSNCode1, {
    //   nonce: nonce + tranCount + 1,
    //   gasPrice: fee.gasPrice?.mul(200).div(100)
    //
    // });
    // await LPWAN.mintMEP1004Stations("0x45A83F015D0265800CBC0dACe1c430E724D49cAc", NEOTestSNCode2, {
    //   nonce: nonce + tranCount + 2,
    //   gasPrice: fee.gasPrice?.mul(200).div(100)
    // });
    // tranCount+=3
  }


  while (true) {
    try {
      for (let i = 0; i < MEP1002TokenIds.length; i++) {
        const MEP1002TokenId = MEP1002TokenIds[i % MEP1002TokenIds.length];
        const assets = NftAssets[MEP1002TokenId.toString()];

        for (let asset of assets) {
            const fee = await owner.getFeeData();

          const tx = await LPWAN.submitLocationProofs(
            MEP1002TokenId,
            [
              MEP1004TokenIds[MEP1002TokenId.toString()][0],
              MEP1004TokenIds[MEP1002TokenId.toString()][1],
              MEP1004TokenIds[MEP1002TokenId.toString()][2]
            ],
            asset,
              {
                gasPrice: fee.gasPrice?.mul(110).div(100),
              }
          );
          await tx.wait(1);
          tranCount += 1;
          console.log(
            `generated Proof:
                      index: ${tranCount}
                      MEP1002TokenID: ${MEP1002TokenId.toString()}
                      MEP1004Station_1: ${MEP1004TokenIds[MEP1002TokenId.toString()][0]},
                      MEP1004Station_2: ${MEP1004TokenIds[MEP1002TokenId.toString()][1]},
                      MEP1004Station_3: ${MEP1004TokenIds[MEP1002TokenId.toString()][2]},
                      NftAsset: ${asset}`
          );
        }
      }
      await sleep(600000);
    } catch (e) {
      console.log(e);
    }
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


const randomChars = "1234567890ABCDEFGHIJKL";

function randomString(length: number, chars: string) {
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
