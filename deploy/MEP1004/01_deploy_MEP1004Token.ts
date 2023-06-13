import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {MEP1004Token, ProxiedMEP1002Token, ProxiedMEP1004Token} from "../../typechain-types";
import { getAddress } from "@ethersproject/address";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tx = await deploy("ProxiedMEP1004Token", {
        from: deployer,
        proxy: {
            owner: deployer,
            proxyContract: "UUPSProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: ["MEP1004Stations", "MEP1004"],
                },
            },
        },
        args: [],
        log: true,
    });

    if (tx.newlyDeployed) {
        const ProxiedMEP1004Token = await ethers.getContract<ProxiedMEP1004Token>(
            "ProxiedMEP1004Token"
        );

        await (await ProxiedMEP1004Token.setController(deployer,true)).wait();
        const ProxiedMEP1002Token = await ethers.getContract<ProxiedMEP1002Token>("ProxiedMEP1002Token")
        await( await ProxiedMEP1004Token.setMNSToken(
            "0x2246EdAd0bc9212Bae82D43974619480A9D1f387"
        )).wait();
        await (await ProxiedMEP1004Token.setMEP1002Addr(
            ProxiedMEP1002Token.address
        )).wait();
        const ownerStorage = await ethers.provider.getStorageAt(
            tx.address,
            "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        );
        const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
        console.log("currentOwner", currentOwner);
        console.log(`Deployed MEP1004Token to ${tx.address}`);
    }
};

func.tags = ["MEP1004"];
func.dependencies = ["MEP1002"];

export default func;
