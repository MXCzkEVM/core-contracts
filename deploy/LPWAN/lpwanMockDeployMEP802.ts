import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const ApplicationContractAddress = '0xe7e4d25905e4ac14d6151F999DEB3cC218055783';
    const LPWANContractAddress = '0xe4E21d9191D76DA650CE5Ab247b82AFFEbF0472A';

    const TOKEN_NAME = 'Walk Sensor Provisioning';
    const TOKEN_SYMBOL = 'WSP'
    const AMOUNT_1000 = ethers.utils.parseEther('1000');
    const BLOCK_1 = 2591865;

    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = LPWANMock.attach(LPWANContractAddress);

    // CREATE MEP802
    const createMEP802Txn = await lpwanMock.createMEP802(TOKEN_NAME, TOKEN_SYMBOL, AMOUNT_1000, BLOCK_1, ApplicationContractAddress);
    const createMEP802TxnReceipt: ContractReceipt = await createMEP802Txn.wait();

    // Get the transaction logs
    const createMEP802TxnEvents = createMEP802TxnReceipt.events;
    const createMEP802Event = createMEP802TxnEvents && createMEP802TxnEvents.find(
        (event) => event.event === "MEP802Created"
    );

    // Retrieve the contract addresses
    const sensorNFTContractAddress = await lpwanMock.sensorNFTContractAddresses(2);

    console.log('Verifying SENSOR NFT Contract Contract.....');
    await run("verify:verify", {
        address: sensorNFTContractAddress,
        constructorArguments: [
            TOKEN_NAME, TOKEN_SYMBOL, AMOUNT_1000, BLOCK_1, ApplicationContractAddress, lpwanMock.address
        ]
    })

    console.log("Create mep802 Log: ", createMEP802Event?.args);
    console.log("SENSOR NFT Contract Address: ", sensorNFTContractAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
