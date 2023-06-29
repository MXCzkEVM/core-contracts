import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const APP_NAME = 'Walk Sensor';

    const ISOApplication = await ethers.getContractFactory("ISOApplication");
    const isoApplication = await ISOApplication.deploy();

    await isoApplication.deployed();

    console.log(
        `ISOApplication deployed to ${isoApplication.address}`
    );

    // CREATE APPLICATION
    const createApplicationTxn = await isoApplication.createApplication(APP_NAME);
    const createApplicationTxnReceipt: ContractReceipt = await createApplicationTxn.wait();

    console.log("Create Application Log: ", createApplicationTxnReceipt?.events);

    // CHECK OWNER APPLICATION
    const appNameTxn = await isoApplication.applicationName();
    console.log("Check name of application Log: ", appNameTxn);

    // CHECK OWNER OF CONTRACT
    const ownerOfContractTxn = await isoApplication.owner();
    console.log("Check owner of contract Log: ", ownerOfContractTxn);

    // CHANGE OWNER OF CONTRACT
    const changeOwnerTxn = await isoApplication.changeOwner('0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26');
    const changeOwnerTxnReceipt: ContractReceipt = await changeOwnerTxn.wait();

    console.log("Change Owner Log: ", changeOwnerTxnReceipt?.events);

    // CHECK OWNER OF CONTRACT AGAIN
    const ownerOfContractAgainTxn = await isoApplication.owner();
    console.log("Check owner of contract again Log: ", ownerOfContractAgainTxn);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
