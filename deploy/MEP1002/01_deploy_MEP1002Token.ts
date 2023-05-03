import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MEP1002NamingToken } from "../../typechain-types";

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
            execute: {
                methodName: "init",
                args: ["MEP1002NToken", "MEP1002", MEP1002NamingToken.address],
            },
        },
        args: [],
        log: true,
    });

    await MEP1002NamingToken.setController(tx.address, true);

    console.log(`Deployed MEP1002Token to ${tx.address}`);
};

func.tags = ["MEP1002"];

export default func;
