import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";


/*
ISOApplication deployed to 0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011
ISO Application Deployed Event:
Deployed Contract Address:  0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011
Application Name:  {
  _isIndexed: true,
  hash: '0x4efaca4c352e005e8e861b1037b46e5a8f2550efe84632dcf78e5cf2ad75dbb9',
  constructor: [Function: Indexed] { isIndexed: [Function (anonymous)] }
}
Owner Address:  0x7A3E0DFf9B53fA0d3d1997903A48677399b22ce7
Check name of application Log:  Walk Sensor
Check owner of contract Log:  0x7A3E0DFf9B53fA0d3d1997903A48677399b22ce7
Change Owner Log:  [
  {
    transactionIndex: 2,
    blockNumber: 660256,
    transactionHash: '0x9947d56daa6774d7ccc828b8b0f313c7b9b2eaa4d88d0ec898fc70bd1f063214',
    address: '0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011',
    topics: [
      '0x0f17057c058227955304580e8ad3305c4fff882badabd5340cdc5eb55933f301',
      '0x0000000000000000000000008d5b0f873c00f8e8ea7fef0c24dbdc5ac2758d26',
      '0x0000000000000000000000000000000000000000000000000000000064c23f76'
    ],
    data: '0x',
    logIndex: 2,
    blockHash: '0x1fe5d3e68ef7fca0c413975a7ce0ee4c2095f4c8bafea9274213714e44c689bd',
    args: [
      '0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26',
      [BigNumber],
      _newOwner: '0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26',
      _time: [BigNumber]
    ],
    decode: [Function (anonymous)],
    event: 'OwnerChanged',
    eventSignature: 'OwnerChanged(address,uint256)',
    removeListener: [Function (anonymous)],
    getBlock: [Function (anonymous)],
    getTransaction: [Function (anonymous)],
    getTransactionReceipt: [Function (anonymous)]
  }
]
Check owner of contract again Log:  0x8D5b0F873c00F8e8EA7FEF0C24DBdC5Ac2758D26
*/
async function main() {
  const APP_NAME = 'Walk Sensor';

  const ISOApplication = await ethers.getContractFactory("ISOApplication");
  const isoApplication = await ISOApplication.deploy(APP_NAME);

  await isoApplication.deployed();

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
