import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

// Sensor Profile deployed to 0x0867cC5176E8cc1272a5a579479089F57BbA2dAe
// Create Sensor Profile Log: [
//     '0xA32B8F4aaBCF53195a6feee4553E75167FB89A71',
//     {
//       _isIndexed: true,
//       hash: '0xd1648e9f495f1f74cf2e034f8059e07be80651dd06d997fe245534da7647e768',
//       constructor: [Function]
//     }
//   ]

async function main() {
    const lpwanAddress = '0xA32B8F4aaBCF53195a6feee4553E75167FB89A71';
    const PROFILE_URI = "https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu"
    
    const [owner, otherAccount] = await ethers.getSigners();

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
