import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const lpwanAddress = '0xA32B8F4aaBCF53195a6feee4553E75167FB89A71';
    const PROFILE_URI = "https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu"
    
    const SensorProfile = await ethers.getContractFactory("SensorProfile");
    const sensorProfile = await SensorProfile.deploy(lpwanAddress);

    await sensorProfile.deployed()

    console.log(`Sensor Profile deployed to ${sensorProfile.address}`)


    // CREATE A SENSOR PROFILE
    const createSensorProfileTxn = await sensorProfile.createSensorProfile(lpwanAddress, PROFILE_URI);
    const createSensorProfileTxnReceipt: ContractReceipt = await createSensorProfileTxn.wait();

    // Get the transaction logs
    const createSensorProfileTxnEvents = createSensorProfileTxnReceipt.events;
    const createSensorProfileEvent = createSensorProfileTxnEvents && createSensorProfileTxnEvents.find(
        (event) => event.event === "SensorProfileCreated"
    );
    console.log("Create Sensor Profile Log: ", createSensorProfileEvent?.args);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
