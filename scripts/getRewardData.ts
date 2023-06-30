import { ProxiedLPWAN} from "../typechain-types";
import { getNamedSigners } from "hardhat-deploy-ethers/internal/helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as log from "../tasks/log";
import {parseEther, parseUnits} from "ethers/lib/utils";

const hre = require("hardhat") as HardhatRuntimeEnvironment;

async function main() {
  const network = hre.network.name;
  log.debug(`network: ${network}`);
  // @ts-ignore
  const { ethers } = await hre;
  const { deployer,owner } = await getNamedSigners(hre);
  const LPWAN = await ethers.getContract<ProxiedLPWAN>("ProxiedLPWAN",deployer);
  const account = deployer.address;
  const rewardData = await LPWAN.getRewardData(account);
  const tx= await deployer.sendTransaction({
    to: "0x0000000000000000000000000000000000000000",
    value: parseEther("20000"),
    gasPrice: parseUnits("20000","gwei"),
    gasLimit: 21000
  })
  await tx.wait();
  console.log(
      "deployer",deployer.address,
      "account", account,
      "\nproposedReward",rewardData.proposedReward.toString(),
      "\nprovenReward",rewardData.provenReward.toString(),
      "\nproposedCostReward", rewardData.proposedCostReward.toString(),
      "\nprovenCostReward",rewardData.provenCostReward.toString()
  );
  // let balance = await deployer.getBalance();
  // console.log("balance",balance.toString());
  // let tx = await LPWAN.claimProposedReward(false,{gasPrice: parseUnits("20000","gwei")});
  // await tx.wait();
  // balance = await deployer.getBalance();
  // console.log("balance after claim proposed reward",balance.toString());
  // tx = await LPWAN.claimProposedCostReward(false,{gasPrice: parseUnits("20000","gwei")});
  // await tx.wait()
  // balance = await deployer.getBalance();
  // console.log("balance after claim proposed cost reward",balance.toString());
  return
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
