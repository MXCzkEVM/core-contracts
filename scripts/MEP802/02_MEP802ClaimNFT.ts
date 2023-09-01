import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";

async function main() {
  const SensorNFTContractAddress = '0x860494ca7fd015FEf2377b0339c10531a8cE4F0F';
  const SensorProfileContractAddress = '0x934a28a7bA195Fe3b2AC84511b7C22390304d9e6';
  const SensorProfileContractAddress2 = '0x071B5768d73401787A6512B185bc5EC8A32Eb8Bc';

  const TOKENID_1 = 0;
  const TOKENID_2 = 1;
  const TOKENID_3 = 2;
  const TOKENID_4 = 3;
  const TOKENID_5 = 4;
  const TOKENID_6 = 5;
  const TOKENID_7 = 6;
  const TOKENID_8 = 7;
  // const pID = ethers.utils.formatBytes32String('TESTPIDOOOOOOOOOOOOOOOOO');
  const pID1 = 'TESTPIDOOOOOOOOOOOOOOOOO';
  const pID2 = 'TESTPID11111111111111111';
  const pID3 = 'TESTPID22222222222222222';
  const pID4 = 'TESTPID33333333333333333';
  const pID5 = 'TESTPID44444444444444444';
  const pID6 = 'TESTPID55555555555555555';
  const pID7 = 'TESTPID66666666666666666';
  const pID8 = 'TESTPID77777777777777777';

  const AMOUNT_1000 = ethers.utils.parseEther('1000');

  const SensorNFTContract = await ethers.getContractFactory("SensorNFTContract");
  const sensorNFTContract = SensorNFTContract.attach(SensorNFTContractAddress);


  // Claim a Sensor NFT
  const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pID1, SensorProfileContractAddress, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt: ContractReceipt = await claimSensorNFTTxn.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents = claimSensorNFTTxnReceipt.events;
  const claimSensorNFTEvent = claimSensorNFTTxnEvents && claimSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log: ", claimSensorNFTEvent?.args);


  // Claim a Sensor NFT 2
  const claimSensorNFTTxn2 = await sensorNFTContract.claimSensorNFT(pID2, SensorProfileContractAddress, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt2: ContractReceipt = await claimSensorNFTTxn2.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents2 = claimSensorNFTTxnReceipt2.events;
  const claimSensorNFTEvent2 = claimSensorNFTTxnEvents2 && claimSensorNFTTxnEvents2.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 2: ", claimSensorNFTEvent2?.args);


  // Claim a Sensor NFT 3
  const claimSensorNFTTxn3 = await sensorNFTContract.claimSensorNFT(pID3, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt3: ContractReceipt = await claimSensorNFTTxn3.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents3 = claimSensorNFTTxnReceipt3.events;
  const claimSensorNFTEvent3 = claimSensorNFTTxnEvents3 && claimSensorNFTTxnEvents3.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 3: ", claimSensorNFTEvent3?.args);


  // Claim a Sensor NFT 4
  const claimSensorNFTTxn4 = await sensorNFTContract.claimSensorNFT(pID4, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt4: ContractReceipt = await claimSensorNFTTxn4.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents4 = claimSensorNFTTxnReceipt4.events;
  const claimSensorNFTEvent4 = claimSensorNFTTxnEvents4 && claimSensorNFTTxnEvents4.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 4: ", claimSensorNFTEvent4?.args);


  // Claim a Sensor NFT 4
  const claimSensorNFTTxn5 = await sensorNFTContract.claimSensorNFT(pID5, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt5: ContractReceipt = await claimSensorNFTTxn5.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents5 = claimSensorNFTTxnReceipt5.events;
  const claimSensorNFTEvent5 = claimSensorNFTTxnEvents5 && claimSensorNFTTxnEvents5.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 5: ", claimSensorNFTEvent5?.args);


  // Claim a Sensor NFT 6
  const claimSensorNFTTxn6 = await sensorNFTContract.claimSensorNFT(pID6, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt6: ContractReceipt = await claimSensorNFTTxn6.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents6 = claimSensorNFTTxnReceipt6.events;
  const claimSensorNFTEvent6 = claimSensorNFTTxnEvents6 && claimSensorNFTTxnEvents6.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 6: ", claimSensorNFTEvent6?.args);


  // Claim a Sensor NFT 7
  const claimSensorNFTTxn7 = await sensorNFTContract.claimSensorNFT(pID7, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt7: ContractReceipt = await claimSensorNFTTxn7.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents7 = claimSensorNFTTxnReceipt7.events;
  const claimSensorNFTEvent7 = claimSensorNFTTxnEvents7 && claimSensorNFTTxnEvents7.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 7: ", claimSensorNFTEvent7?.args);


  // Claim a Sensor NFT 8
  const claimSensorNFTTxn8 = await sensorNFTContract.claimSensorNFT(pID8, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt8: ContractReceipt = await claimSensorNFTTxn8.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents8 = claimSensorNFTTxnReceipt8.events;
  const claimSensorNFTEvent8 = claimSensorNFTTxnEvents8 && claimSensorNFTTxnEvents8.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 8: ", claimSensorNFTEvent8?.args);


  // CHECK IF A TOKEN IS VALID
  const isValidTxn = await sensorNFTContract.isValid(TOKENID_1);
  console.log("Validity of token: ", isValidTxn);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn2 = await sensorNFTContract.isValid(TOKENID_2);
  console.log("Validity of token 2: ", isValidTxn2);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn3 = await sensorNFTContract.isValid(TOKENID_3);
  console.log("Validity of token 3: ", isValidTxn3);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn4 = await sensorNFTContract.isValid(TOKENID_4);
  console.log("Validity of token 4: ", isValidTxn4);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn5 = await sensorNFTContract.isValid(TOKENID_5);
  console.log("Validity of token 5: ", isValidTxn5);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn6 = await sensorNFTContract.isValid(TOKENID_6);
  console.log("Validity of token 6: ", isValidTxn6);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn7 = await sensorNFTContract.isValid(TOKENID_7);
  console.log("Validity of token 7: ", isValidTxn7);

  // CHECK IF A TOKEN IS VALID
  const isValidTxn8 = await sensorNFTContract.isValid(TOKENID_8);
  console.log("Validity of token 8: ", isValidTxn8);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
