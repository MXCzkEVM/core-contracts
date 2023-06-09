import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MEP1002NamingToken, UUPSProxy } from "../../typechain-types";
import { ethers } from "hardhat";
import { getAddress } from "@ethersproject/address";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const tx = await deploy("ProxiedEthMxcPriceAggregator", {
    from: deployer,
    proxy: {
      owner: deployer,
      proxyContract: "UUPSProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [90000],
        },
      },
    },
    args: [],
    log: true,
  });
  const ownerStorage = await ethers.provider.getStorageAt(
      tx.address,
      "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
  );
  const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
  console.log("currentOwner", currentOwner);
  console.log(`Deployed ProxiedEthMxcPriceAggregator to ${tx.address}`);
};

func.tags = ["LPWAN", "EthMxcPriceAggregator"];

export default func;
