import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {ethers, upgrades} from "hardhat";
import {
    ERC1967Proxy, ERC1967Proxy__factory, ERC1967Upgrade__factory, ERC1967UpgradeUpgradeable__factory,
    ITransparentUpgradeableProxy, ITransparentUpgradeableProxy__factory,
    LPWAN, ProxiedEthMxcPriceAggregator, ProxiedLPWAN, ProxiedLPWAN__factory,
    ProxiedMEP1004Token, TransparentUpgradeableProxy, TransparentUpgradeableProxy__factory,
} from "../../typechain-types";
import {getNamedSigners} from "hardhat-deploy-ethers/internal/helpers";
import {
    TransparentUpgradeableProxyInterface
} from "../../typechain-types/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy";
import {getTransparentUpgradeableProxyFactory} from "@openzeppelin/hardhat-upgrades/dist/utils";
import {Contract} from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer,owner } = await getNamedSigners(hre);
    const {deploy} = deployments


    const proxyAddress = "0x2000777700000000000000000000000000000001"

    const ownerStorage = await deployer.provider?.getStorageAt(
        proxyAddress,
        "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
    );

    if(!ownerStorage || !(await ownerStorage).indexOf(deployer.address)) {
        console.log("not owner",ownerStorage, deployer.address)
        return ;
    }

    const LPWANDeployTx = await deploy("ProxiedLPWAN", {
        from: deployer.address,
        log: true,
    });


    if (LPWANDeployTx.newlyDeployed) {
        const proxyFactory = await getTransparentUpgradeableProxyFactory(hre, deployer)
        const proxy = proxyFactory.attach(proxyAddress);
        await proxy.upgradeTo(LPWANDeployTx.address);


        const ProxiedMEP1004Token = await ethers.getContract<ProxiedMEP1004Token>("ProxiedMEP1004Token");


        await ProxiedMEP1004Token.setController(proxyAddress,true);

        const ProxiedLPWANFactory = await ethers.getContractFactory<ProxiedLPWAN__factory>("ProxiedLPWAN")

        const ProxiedEthMxcPriceAggregator = await ethers.getContract<ProxiedEthMxcPriceAggregator>("ProxiedEthMxcPriceAggregator");

        const LPWAN = (await ProxiedLPWANFactory.attach(proxyAddress).connect(owner))

        let tx = await LPWAN.setController("0x3AAEd79670c79f1f7E0A3Fa66118c6D9003B1Ab0", true)
        await tx.wait();
        // initialize
        await LPWAN.initialize(ProxiedMEP1004Token.address, ProxiedEthMxcPriceAggregator.address);
        await deployments.save("ProxiedLPWAN", {
            address: proxyAddress,
            implementation: LPWANDeployTx.address,
            abi: LPWANDeployTx.abi
        })
    }

    console.log(ownerStorage,deployer.address);

};

func.tags = ["LPWAN"];
func.dependencies = ["MEP1004", "EthMxcPriceAggregator"];

export default func;
