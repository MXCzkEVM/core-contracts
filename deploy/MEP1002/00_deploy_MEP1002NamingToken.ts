import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MEP1002NamingToken } from "../../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tx = await deploy("MEP1002NamingToken", {
        from: deployer,
        proxy: {
            owner: deployer,
            execute: {
                methodName: "init",
                args: ["MEP1002NamingToken", "MEP1002NT"],
            },
        },
        args: [],
        log: true,
    });
    console.log(`Deployed MEP1002NamingToken to ${tx.address}`);
};

func.tags = ["MEP1002"];

export default func;
