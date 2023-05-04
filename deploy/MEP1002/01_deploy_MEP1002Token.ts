import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MEP1002NamingToken } from "../../typechain-types";
import { getAddress } from "@ethersproject/address";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const MEP1002NamingToken = await ethers.getContract<MEP1002NamingToken>(
        "MEP1002NamingToken"
    );

    const tx = await deploy("MEP1002Token", {
        from: deployer,
        proxy: {
            owner: deployer,
            proxyContract: "UUPSProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        "MEP1002Token",
                        "MEP1002",
                        MEP1002NamingToken.address,
                        deployer,
                    ],
                },
            },
        },
        args: [],
        log: true,
    });

    await MEP1002NamingToken.setController(tx.address, true);
    const ownerStorage = await ethers.provider.getStorageAt(
        tx.address,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );
    const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
    console.log("currentOwner", currentOwner);
    console.log(`Deployed MEP1002Token to ${tx.address}`);
};

func.tags = ["MEP1002"];

export default func;
