import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";

async function main() {
  const SensorNFTContractAddress = '0x860494ca7fd015FEf2377b0339c10531a8cE4F0F';
  
  const TOKENID_1 = 0;
  const TOKENID_2 = 1;
  const TOKENID_3 = 2;
  const TOKENID_4 = 3;
  const TOKENID_5 = 4;
  const TOKENID_6 = 5;
  const TOKENID_7 = 6;
  const TOKENID_8 = 7;
  
  const pIDHash1 = '0x47773d91e4913a3a9fa9b096553bc866e1cfaf7c89980b4c9f6de80446daf604';
  const pIDHash2 = '0x47bc69b4685cacbd5f8733224b0e5724a1a098eeaa5b5d2acf81705ac6a4de51';
  const pIDHash3 = '0x443a98a6042634775e5df6219d4204245c8aebec3b0aff8cb67786d69b21e12b';
  const pIDHash4 = '0x53d5dee27e1c6be3687b946cfdd90eef573064e1da149d14d6f358cc506705f2';
  const pIDHash5 = '0x805c4e58c76c661ff08ac93886c5341bf908d257ad833c18aa06a4e88974ab30';
  const pIDHash6 = '0xbd6e7b9376392d7e51a95bdfd70af98852a412dbfdf162eef5acf6397ff934d2';
  const pIDHash7 = '0xf0a92f35a40623ebc000ac9ac897599aaf04c0f72187b1b9085e07f31b4836ab';
  const pIDHash8 = '0xaf5afad71feb8a6ef5bc339150481ad420ded52dde61157166e7f29702530776';

  const AMOUNT_1000 = ethers.utils.parseEther('1000');

  const SensorNFTContract = await ethers.getContractFactory("SensorNFTContract");
  const sensorNFTContract = SensorNFTContract.attach(SensorNFTContractAddress);

  
  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn = await sensorNFTContract.renewDevice(pIDHash1, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt: ContractReceipt = await renewDeviceTxn.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents = renewDeviceTxnReceipt.events;
  const renewDeviceEvent = renewDeviceTxnEvents && renewDeviceTxnEvents.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log: ", renewDeviceEvent?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn2 = await sensorNFTContract.renewDevice(pIDHash2, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt2: ContractReceipt = await renewDeviceTxn2.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents2 = renewDeviceTxnReceipt2.events;
  const renewDeviceEvent2 = renewDeviceTxnEvents2 && renewDeviceTxnEvents2.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 2: ", renewDeviceEvent2?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn3 = await sensorNFTContract.renewDevice(pIDHash3, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt3: ContractReceipt = await renewDeviceTxn3.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents3 = renewDeviceTxnReceipt3.events;
  const renewDeviceEvent3 = renewDeviceTxnEvents3 && renewDeviceTxnEvents3.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 3: ", renewDeviceEvent3?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn4 = await sensorNFTContract.renewDevice(pIDHash4, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt4: ContractReceipt = await renewDeviceTxn4.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents4 = renewDeviceTxnReceipt4.events;
  const renewDeviceEvent4 = renewDeviceTxnEvents4 && renewDeviceTxnEvents4.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 4: ", renewDeviceEvent4?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn5 = await sensorNFTContract.renewDevice(pIDHash5, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt5: ContractReceipt = await renewDeviceTxn5.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents5 = renewDeviceTxnReceipt5.events;
  const renewDeviceEvent5 = renewDeviceTxnEvents5 && renewDeviceTxnEvents5.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 5: ", renewDeviceEvent5?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn6 = await sensorNFTContract.renewDevice(pIDHash6, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt6: ContractReceipt = await renewDeviceTxn6.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents6 = renewDeviceTxnReceipt6.events;
  const renewDeviceEvent6 = renewDeviceTxnEvents6 && renewDeviceTxnEvents6.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 6: ", renewDeviceEvent6?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn7 = await sensorNFTContract.renewDevice(pIDHash7, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt7: ContractReceipt = await renewDeviceTxn7.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents7 = renewDeviceTxnReceipt7.events;
  const renewDeviceEvent7 = renewDeviceTxnEvents7 && renewDeviceTxnEvents7.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 7: ", renewDeviceEvent7?.args);


  // RENEW A PROVISIONED DEVICE
  const renewDeviceTxn8 = await sensorNFTContract.renewDevice(pIDHash8, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt8: ContractReceipt = await renewDeviceTxn8.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents8 = renewDeviceTxnReceipt8.events;
  const renewDeviceEvent8 = renewDeviceTxnEvents8 && renewDeviceTxnEvents8.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 8: ", renewDeviceEvent8?.args);

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
