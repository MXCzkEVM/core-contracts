import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
  const ApplicationAddress = '0x9631ec0491a60d500a10d61e08ac17d00823Ff39';
  const PROFILE_URI = "https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu"
  const TIER = "adult";
  const SensorProfile = await ethers.getContractFactory("SensorProfile");
  const sensorProfile = await SensorProfile.deploy(ApplicationAddress, PROFILE_URI, TIER);

  await sensorProfile.deployed()

  console.log('Verify Sensor Profile Contract.....');
  await run("verify:verify", {
    address: sensorProfile.address,
    constructorArguments: [
      ApplicationAddress,
      PROFILE_URI,
      TIER
    ]
  })

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
