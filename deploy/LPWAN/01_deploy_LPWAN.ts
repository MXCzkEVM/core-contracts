import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import {
    Create2Factory, Create2Factory__factory,
    LPWAN,
    ProxiedMEP1004Token,
    UUPSProxy
} from "../../typechain-types";
import { getCreate2Address } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy } = deployments;

    const LPWANDeployTx = await deploy("ProxiedLPWAN", {
        from: deployer,
        log: true,
    });

    if(LPWANDeployTx.newlyDeployed) {
        const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ProxiedLPWAN"));

        // create2
        const L2Create2FactoryAddr = "0xF35626227F81aC7A059b895701F31EEF2f9d788b"
        // const Create2FactoryFactory = await ethers.getContractFactory<Create2Factory__factory>("Create2Factory");
        //
        // await deploy('Create2Factory',{from: deployer, log: true})
        //
        const create2Factory = await ethers.getContractAt<Create2Factory>("Create2Factory",L2Create2FactoryAddr)
        const implementationBytecode = LPWANDeployTx.bytecode;
        const ProxiedMEP1004Token = await ethers.getContract<ProxiedMEP1004Token>("ProxiedMEP1004Token");
        const initializeData = new ethers.utils.Interface(["function initialize(address)"]).encodeFunctionData("initialize", [ProxiedMEP1004Token.address]);
        const constructorArgs = ethers.utils.defaultAbiCoder.encode(["address", "address", "bytes"], [LPWANDeployTx.address, deployer, initializeData]);

        const initCode = `${implementationBytecode}${constructorArgs.slice(2)}`
        const expectedProxyAddress = getCreate2Address(L2Create2FactoryAddr, salt, ethers.utils.keccak256(initCode));
        console.log(`Expected proxy address: ${expectedProxyAddress}`);

        await create2Factory.createContract(salt, initCode);

        // expect address
        const proxyCode = await ethers.provider.getCode(expectedProxyAddress);
        if (proxyCode === "0x") {
            console.error(`Error: No contract found at the expected address: ${expectedProxyAddress}`);
            return;
        }
        console.log(`Deployed proxy contract to: ${expectedProxyAddress}`);

        await deployments.save("ProxiedLPWAN", {
            address: expectedProxyAddress,
            implementation: LPWANDeployTx.address,
            abi: LPWANDeployTx.abi
        })
    }
};

func.tags = ["LPWAN"];
func.dependencies = ["MEP1004"];

export default func;
