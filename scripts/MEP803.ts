import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

/*
Sensor Profile deployed to 0xdebBFb56b4354A3E389910088731E9702331C351
Sensor Profile Deployed Event:
Deployed Contract Address:  0xdebBFb56b4354A3E389910088731E9702331C351
Application Contract Address:  0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011
Sensor Profile URI:  {
  _isIndexed: true,
  hash: '0xd1648e9f495f1f74cf2e034f8059e07be80651dd06d997fe245534da7647e768',
  constructor: [Function: Indexed] { isIndexed: [Function (anonymous)] }
}
*/
async function main() {
  const ApplicationAddress = '0x47bEF8F10F525dC5c1aA2A6C33B33520f61b7011';
  const PROFILE_URI = "https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu"
  const TIER = "child";
  const SensorProfile = await ethers.getContractFactory("SensorProfile");
  const sensorProfile = await SensorProfile.deploy(ApplicationAddress, PROFILE_URI, TIER);

  await sensorProfile.deployed()

  console.log(`Sensor Profile deployed to ${sensorProfile.address}`)

  // Catch the SensorProfileDeployed event and its values
  const sensorProfileTxnReceipt: ContractReceipt = await sensorProfile.deployTransaction.wait();
  const sensorProfileEvents = sensorProfileTxnReceipt.events;

  const sensorProfileDeployedEvent = sensorProfileEvents && sensorProfileEvents.find(
    (event) => event.event === "SensorProfileDeployed"
  );

  if (sensorProfileDeployedEvent) {
    const deployedContractAddress = sensorProfileDeployedEvent.args![0];
    const appContractAddress = sensorProfileDeployedEvent.args![1];
    const sensorProfileURI = sensorProfileDeployedEvent.args![2];

    console.log("Sensor Profile Deployed Event:");
    console.log("Deployed Contract Address: ", deployedContractAddress);
    console.log("Application Contract Address: ", appContractAddress);
    console.log("Sensor Profile URI: ", sensorProfileURI);
  } else {
    console.log("sensorProfileDeployed event not found in the transaction receipt.");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
