import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
  const APP_NAME = 'Walk Sensor';

  const ISOApplication = await ethers.getContractFactory("ISOApplication");
  const isoApplication = await ISOApplication.deploy(APP_NAME);

  await isoApplication.deployed();

  console.log('Verifying Application Contract.....');
  await run("verify:verify", {
    address: isoApplication.address,
    constructorArguments: [
      APP_NAME
    ]
  })

  console.log(
    `ISOApplication deployed to ${isoApplication.address}`
  );

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
