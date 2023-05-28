import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {MEP1002NamingToken, MEP1002Token, ProxiedMEP1002NamingToken, ProxiedMEP1002Token} from "../../typechain-types";
import { getAddress } from "@ethersproject/address";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const ProxiedMEP1002NamingToken = await ethers.getContract<ProxiedMEP1002NamingToken>(
        "ProxiedMEP1002NamingToken"
    );

    const tx = await deploy("ProxiedMEP1002Token", {
        from: deployer,
        proxy: {
            owner: deployer,
            proxyContract: "UUPSProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [
                        "MEP1002 Hexagon Token",
                        "MEP1002",
                        ProxiedMEP1002NamingToken.address
                    ],
                },
            }
        },
        args: [],
        log: true,
    });
    if (tx.newlyDeployed) {
        const ProxiedMEP1002Token = await ethers.getContract<ProxiedMEP1002Token>(
            "ProxiedMEP1002Token"
        );
        await ProxiedMEP1002NamingToken.setController(ProxiedMEP1002Token.address, true);
        await ProxiedMEP1002Token.setController(deployer, true);
        await ProxiedMEP1002Token.setMNSToken(
            "0x61C48101ccE16653573e80c64b4bD4a4C3111Ce8"
        );
        const ownerStorage = await ethers.provider.getStorageAt(
            tx.address,
            "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        );
        const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
        console.log("currentOwner", currentOwner);
        console.log(`Deployed MEP1002Token to ${tx.address}`);
    }
};

func.tags = ["MEP1002"];

export default func;
