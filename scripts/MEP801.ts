import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

// ISOApplication deployed to 0x32e50C7761F6C4107663c8247E49f7aa2A0F1941
// Create Application Log: [ [ '0x7A3E0DFf9B53fA0d3d1997903A48677399b22ce7', [Object] ] ]
// Check name of application Log:  Dog Sensor
// Check owner of contract Log:  0x7A3E0DFf9B53fA0d3d1997903A48677399b22ce7
// Change Owner Log:  [ [
//       '0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26',
//       [BigNumber],
//       _newOwner: '0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26',
//       _time: [BigNumber]
//     ] ]
// Check owner of contract again Log:  0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26


async function main() {
    const [owner, otherAccount] = await ethers.getSigners();
    const APP_NAME = 'Dog Sensor';

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
    // const changeOwnerTxn = await isoApplication.changeOwner(otherAccount.address);
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
