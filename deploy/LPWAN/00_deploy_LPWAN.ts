import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import { MEP1004Token } from "../../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    if (!hre.network.tags.hasOwnProperty("LPWAN")) {
        return;
    }
    const MEP1004Token = await ethers.getContract<MEP1004Token>("MEP1004Token");
    const tx = await deploy("LPWAN", {
        from: deployer,
        args: [MEP1004Token.address],
        log: true,
    });
    if (tx.newlyDeployed) {
        console.log(`Deployed LPWAN to ${tx.address}`);
        await MEP1004Token.setController(tx.address, true);
        console.log(`Set LPWAN as controller of MEP1004Token`);
    }
};

func.tags = ["LPWAN"];
func.dependencies = ["MEP1004"];

export default func;
