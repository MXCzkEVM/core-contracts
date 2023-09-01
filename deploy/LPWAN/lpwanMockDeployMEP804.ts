import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";

async function main() {
    const ApplicationContractAddress = '0xe7e4d25905e4ac14d6151F999DEB3cC218055783';
    const LPWANContractAddress = '0xe4E21d9191D76DA650CE5Ab247b82AFFEbF0472A';
    const SensorProfileContractAddress1 = '0x664Cd4B6863528787b881c459026FfE5753e784F';
    const SensorProfileContractAddress2 = '0xDdC3Da0fb6F47D9424B785B6A6C5dd6F15eda170';
    const SensorProfileContractAddress3 = '0x6517F3Dfde6692E292B3329a098f4A4172D254a5';
    const MerkleRoot = '0x5188db936900589dbdf928aa5672376cdb198a6e12672d7d681e2de51469df3b'

    const NAME = 'MXC Reward Token';
    const SYMBOL = 'MRT';
    const AMOUNT = ethers.utils.parseEther("3000");
    const XToEarnFormula = { x: 'y', a: 'b' }

    const [owner, otherAccount] = await ethers.getSigners();

    const LPWANMock = await ethers.getContractFactory("LPWANMock");
    const lpwanMock = LPWANMock.attach(LPWANContractAddress);

    // CREATE MEP804
    const createMEP804Txn = await lpwanMock.createMEP804(
        ApplicationContractAddress, owner.address, LPWANContractAddress,
        [SensorProfileContractAddress1, SensorProfileContractAddress2, SensorProfileContractAddress3],
        XToEarnFormula, NAME, SYMBOL, AMOUNT, MerkleRoot, 1

    );
    const createMEP804TxnReceipt: ContractReceipt = await createMEP804Txn.wait();

    // Get the transaction logs
    const createMEP804TxnEvents = createMEP804TxnReceipt.events;
    const createMEP804Event = createMEP804TxnEvents && createMEP804TxnEvents.find(
        (event) => event.event === "MEP804Created"
    );
    console.log("Create mep804 Log: ", createMEP804Event?.args);
    // return;

    // Retrieve the contract addresses
    const rewardContractAddress = await lpwanMock.rewardContractAddresses(4);
    console.log("Reward Contract Address: ", rewardContractAddress);

    console.log('Verifying Reward Contract.....');
    await run("verify:verify", {
        address: rewardContractAddress,
        constructorArguments: [
            ApplicationContractAddress, owner.address, LPWANContractAddress,
            [SensorProfileContractAddress1, SensorProfileContractAddress2, SensorProfileContractAddress3],
            XToEarnFormula, NAME, SYMBOL, AMOUNT, MerkleRoot, 1
        ]
    })


    const RewardContract = await ethers.getContractFactory("RewardContract");
    const rewardContract = RewardContract.attach(rewardContractAddress);

    // GET x2earn formula
    const xToEarnFormulaJSON = await rewardContract.xToEarnFormulaJSON();
    console.log("XToEarnFormulaJSON Log: ", xToEarnFormulaJSON);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
