import { LPWAN, MEP1004Token } from "../typechain-types";
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
  const MEP1004Token = await ethers.getContract<MEP1004Token>("ProxiedMEP1004Token");
  const LPWAN = await ethers.getContract<LPWAN>("ProxiedLPWAN");
  const nonce = await deployer.getTransactionCount();

  const MEP1002TokenIds = [
    BigNumber.from("608530350842314751"), //  podgorica edcon2023.mxc   nft 2
    BigNumber.from("608533319822344191"), // berlin techcode.mxc  nft 0,1
    BigNumber.from("609765017859915775"), //  Singapore 3
    BigNumber.from("608818980848664575") // Tokyo nft 4
  ];
  // console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[0]));
  // console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[1]));
  // console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[2]));
  // console.log(await MEP1004Token.getMEP1002Slot(MEP1002TokenIds[3]));

  // return;
  // return;
  const M2XTestSNCode = getRandomM2XTestSNCode();
  const NEOTestSNCode1 = getRandomNEOTestSNCode();
  const NEOTestSNCode2 = getRandomNEOTestSNCode();

  // return;

  // await LPWAN.mintMEP1004Stations(
  //   deployer.address,
  //   M2XTestSNCode,
  //   {
  //     nonce: nonce
  //   }
  // );
  //
  // await LPWAN.mintMEP1004Stations(deployer.address, NEOTestSNCode1, {
  //   nonce: nonce + 1
  // });
  // await LPWAN.mintMEP1004Stations(deployer.address, NEOTestSNCode2, {
  //   nonce: nonce + 2
  // });
  // await MEP1004Token.insertToMEP1002Slot(
  //   BigNumber.from(29),
  //   MEP1002TokenIds[3],
  //   0,
  //   { nonce: nonce + 3 }
  // );
  // await MEP1004Token.insertToMEP1002Slot(
  //   BigNumber.from(30),
  //   MEP1002TokenIds[3],
  //   0,
  //   { nonce: nonce + 4 }
  // );
  // await MEP1004Token.insertToMEP1002Slot(
  //   BigNumber.from(31),
  //   MEP1002TokenIds[3],
  //   1,
  //   { nonce: nonce + 5 }
  // );   .km
  // await MEP1004Token.removeFromMEP1002SlotAdmin(
  //       BigNumber.from(31),
  //       MEP1002TokenIds[3],
  //       1,
  //       { nonce: nonce }
  // )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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