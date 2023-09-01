import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const APP_NAME = 'Walk Sensor';

    const ISOApplication = await ethers.getContractFactory("ISOApplication");
    const isoApplication = await ISOApplication.deploy(APP_NAME, {
        gasPrice: ethers.utils.parseUnits("600000000", "gwei"), // Set gas price to 10 gwei
    });

    await isoApplication.deployed();

    console.log('Verifying Application Contract.....');
    await run("verify:verify", {
        address: isoApplication.address,
        constructorArguments: [
            APP_NAME
        ]
    })

    console.log(`ISOApplication deployed to ${isoApplication.address}`);

    // Catch the ISOApplicationDeployed event and its values
    const isoApplicationTxnReceipt: ContractReceipt = await isoApplication.deployTransaction.wait();
    const isoApplicationEvents = isoApplicationTxnReceipt.events;

    const isoApplicationDeployedEvent = isoApplicationEvents && isoApplicationEvents.find(
        (event) => event.event === "ISOApplicationDeployed"
    );

    if (isoApplicationDeployedEvent) {
        const deployedContractAddress = isoApplicationDeployedEvent.args![0];
        const applicationName = isoApplicationDeployedEvent.args![1];
        const ownerAddress = isoApplicationDeployedEvent.args![2];

        console.log("ISO Application Deployed Event:");
        console.log("Deployed Contract Address: ", deployedContractAddress);
        console.log("Application Name: ", applicationName);
        console.log("Owner Address: ", ownerAddress);
    } else {
        console.log("ISOApplicationDeployed event not found in the transaction receipt.");
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
