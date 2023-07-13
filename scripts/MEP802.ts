import { ContractReceipt } from "ethers";
import { ethers } from "hardhat";

async function main() {
    const ProvisioningContractAddress = '0xDc2b519641ea2bB7d213eADe01FBFE6Dc7B62d30';
    const ApplicationContractAddress = '0x32e50C7761F6C4107663c8247E49f7aa2A0F1941';

    const [owner, otherAccount] = await ethers.getSigners();

    const EMAIL = 'aabiodunawoyemi@gmail.com';
    const PID_AMOUNT = 7;
    const TOKENID_1 = 0;
    const pIDHash = '0x3d51c5416f078e9d8f557c14191cf1a9cb1ef0f18b808af8587eff456f419833'

    const AMOUNT_500 = ethers.utils.parseEther('500');
    const TOKEN_URI = 'ipfs.io/ipfs/bafyreibe5vld2enofsuy55xq4oeuhkokxk2knnp2b5r7au5pijnqlublj4';

    const ProvisioningContract = await ethers.getContractFactory("ProvisioningContract");
    const provisioningContract = ProvisioningContract.attach(ProvisioningContractAddress);

    // PRODUCE A PID
    const producePIDTxn = await provisioningContract.producePID(EMAIL, PID_AMOUNT, ApplicationContractAddress);
    const producePIDTxnReceipt: ContractReceipt = await producePIDTxn.wait();

    // Get the transaction logs
    const producePIDTxnEvents = producePIDTxnReceipt.events;
    const producePIDEvent = producePIDTxnEvents && producePIDTxnEvents.find(
        (event) => event.event === "PIDProduced"
    );

    console.log("Produce PID Log: ", producePIDEvent?.args);


    // MINT SENSOR NFT
    const mintSensorNFTTxn = await provisioningContract.mintSensorNFT(pIDHash, TOKEN_URI, { value: AMOUNT_500 });
    const mintSensorNFTTxnReceipt: ContractReceipt = await mintSensorNFTTxn.wait();

    // Get the transaction logs
    const mintSensorNFTTxnEvents = mintSensorNFTTxnReceipt.events;
    const mintSensorNFTEvent = mintSensorNFTTxnEvents && mintSensorNFTTxnEvents.find(
        (event) => event.event === "SensorNFTMinted"
    );
    console.log("Mint Sensor NFT Log: ", mintSensorNFTEvent?.args);

    // Claim a Sensor NFT
    const claimSensorNFTTxn = await provisioningContract.claimSensorNFT(pIDHash, { value: AMOUNT_500 });
    const claimSensorNFTTxnReceipt: ContractReceipt = await claimSensorNFTTxn.wait();

    // Get the transaction logs
    const claimSensorNFTTxnEvents = claimSensorNFTTxnReceipt.events;
    const claimSensorNFTEvent = claimSensorNFTTxnEvents && claimSensorNFTTxnEvents.find(
        (event) => event.event === "SensorNFTClaimed"
    );
    console.log("Claim Sensor NFT Log: ", claimSensorNFTEvent?.args);

    // RENEW A PROVISIONED DEVICE
    const renewDeviceTxn = await provisioningContract.renewPID(pIDHash, { value: AMOUNT_500 });
    const renewDeviceTxnReceipt: ContractReceipt = await renewDeviceTxn.wait();

    // Get the transaction logs
    const renewDeviceTxnEvents = renewDeviceTxnReceipt.events;
    const renewDeviceEvent = renewDeviceTxnEvents && renewDeviceTxnEvents.find(
        (event) => event.event === "SensorNFTRenewed"
    );
    console.log("Renew PID Log: ", renewDeviceEvent?.args);

    // CHECK IF A TOKEN IS VALID
    const isValidTxn = await provisioningContract.isValid(TOKENID_1);
    console.log("Validity of token: ", isValidTxn);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
