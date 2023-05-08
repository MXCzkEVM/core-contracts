import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MEP1004Token } from "../../typechain-types";
import { getAddress } from "@ethersproject/address";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tx = await deploy("MEP1004Token", {
        from: deployer,
        proxy: {
            owner: deployer,
            proxyContract: "UUPSProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: ["MEP1004Stations", "MEP1004", deployer],
                },
            },
        },
        args: [],
        log: true,
    });
    const MEP1004Token = await ethers.getContract<MEP1004Token>("MEP1004Token");
    await MEP1004Token.setMNSToken(
        "0x61C48101ccE16653573e80c64b4bD4a4C3111Ce8"
    );
    await MEP1004Token.setMEP1002Addr(
        "0x8DD0d6b0238c26C14946095181A6C9671970B7cA"
    );
    const ownerStorage = await ethers.provider.getStorageAt(
        tx.address,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );
    const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
    console.log("currentOwner", currentOwner);
    console.log(`Deployed MEP1004Token to ${tx.address}`);
};

func.tags = ["MEP1004"];

export default func;
