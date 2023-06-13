import { task } from "hardhat/config";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import {getNamedSigners} from "hardhat-deploy-ethers/internal/helpers";
import {sleep} from "./utils";

task("generate_transaction_L2").setAction(async (args, hre: any) => {
  await generateTransactionL2(hre);
});

export async function generateTransactionL2(hre: HardhatRuntimeEnvironment) {
  const { nopermission } = await getNamedSigners(hre);
  while (true) {
    try {
      const [nonce,fee] = await Promise.all([nopermission.getTransactionCount(), nopermission.getFeeData()])
      console.log("fee data", fee.gasPrice?.toString());
      const tx = await nopermission.sendTransaction({
        gasPrice: fee.gasPrice?.mul(110).div(100),
        to: "0x52f60448790E485F38f2Aa9c867CD0DD647c0b73",
        value: 1,
        nonce: nonce
      });
      await sleep(1000);
    } catch (e) {
      console.log(e);
      await sleep(1000)
    }
  }
}