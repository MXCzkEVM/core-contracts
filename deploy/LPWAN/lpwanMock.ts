import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = await LPWANMock.deploy();

    await lpwanMock.deployed();

    console.log('Verifying LPWAN MOCK Contract.....');
    await run("verify:verify", {
        address: lpwanMock.address,
        constructorArguments: []
    })

    console.log(
        `LPWAN Mock deployed to ${lpwanMock.address}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
