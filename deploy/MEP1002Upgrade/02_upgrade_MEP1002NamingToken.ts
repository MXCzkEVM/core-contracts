import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
    MEP1002NamingToken,
    MEP1002NamingToken__factory,
} from "../../typechain-types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network, upgrades, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    if (!network.tags.hasOwnProperty("upgrade") || network.live) {
        return false;
    }

    const MEP1002NamingToken = await ethers.getContract<MEP1002NamingToken>(
        "MEP1002NamingToken"
    );
    const newMEP1002NamingTokenFactory =
        await ethers.getContractFactory<MEP1002NamingToken__factory>(
            "MEP1002NamingToken"
        );

    const tx = await upgrades.forceImport(
        MEP1002NamingToken.address,
        newMEP1002NamingTokenFactory
    );
    console.log(`Upgrade New MEP1002NamingToken to ${tx.address}`);

    await tx.deployed();
    // const name = await newMEP1002NamingToken.attach(tx.address).name();
    // console.log(name);
};

func.tags = ["MEP1002", "upgrade"];
func.dependencies = ["MEP1002NamingToken"];

export default func;
