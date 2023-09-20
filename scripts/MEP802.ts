import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";

async function main() {
  const SensorNFTContractAddress = '0xcA8eC6484e9B4240084B6892D89B821D53c2174b';
  const ApplicationContractAddress = '0x9631ec0491a60d500a10d61e08ac17d00823Ff39';
  const SensorProfileContractAddress = '0xD21D048a2A5ede22BbD82fd94C29DA9dFE0fddDa';
  const SensorProfileContractAddress2 = '0x4B8E85Fad30ba08e11360F66666ed5979078070D';

  const [owner, otherAccount] = await ethers.getSigners();

  const EMAIL = 'aabiodunawoyemi@gmail.com';
  const PID_AMOUNT = 7;
  const TOKENID_1 = 0;
  const TOKENID_2 = 1;
  const TOKENID_3 = 2;
  const TOKENID_4 = 3;
  // const pID = ethers.utils.formatBytes32String('TESTPIDOOOOOOOOOOOOOOOOO');
  const pID1 = 'TESTPIDOOOOOOOOOOOOOOOOO';
  const pID2 = 'TESTPID11111111111111111';
  const pID3 = 'TESTPID22222222222222222';
  const pID4 = 'TESTPID33333333333333333';
  const pIDHash1 = '0x47773d91e4913a3a9fa9b096553bc866e1cfaf7c89980b4c9f6de80446daf604'
  const pIDHash2 = '0x47bc69b4685cacbd5f8733224b0e5724a1a098eeaa5b5d2acf81705ac6a4de51'
  const pIDHash3 = '0x443a98a6042634775e5df6219d4204245c8aebec3b0aff8cb67786d69b21e12b'
  const pIDHash4 = '0x53d5dee27e1c6be3687b946cfdd90eef573064e1da149d14d6f358cc506705f2'

  const AMOUNT_1000 = ethers.utils.parseEther('1000');
  const TOKEN_URI = 'https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu';
  const CHAINID = 5167003

  const SensorNFTContract = await ethers.getContractFactory("SensorNFTContract");
  const sensorNFTContract = SensorNFTContract.attach(SensorNFTContractAddress);

  // PRODUCE A PID
  const producePIDTxn = await sensorNFTContract.producePID(EMAIL, PID_AMOUNT, ApplicationContractAddress, SensorProfileContractAddress);
  const producePIDTxnReceipt: ContractReceipt = await producePIDTxn.wait();

  // Get the transaction logs
  const producePIDTxnEvents = producePIDTxnReceipt.events;
  const producePIDEvent = producePIDTxnEvents && producePIDTxnEvents.find(
    (event) => event.event === "PIDProduced"
  );

  console.log("Produce PID Log: ", producePIDEvent?.args);

  // MINT SENSOR NFT 1
  const mintSensorNFTTxn = await sensorNFTContract.mintSensorNFT(pIDHash1, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt: ContractReceipt = await mintSensorNFTTxn.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents = mintSensorNFTTxnReceipt.events;
  const mintSensorNFTEvent = mintSensorNFTTxnEvents && mintSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Log: ", mintSensorNFTEvent?.args);

  // MINT SENSOR NFT 2
  const mintSensorNFTTxn2 = await sensorNFTContract.mintSensorNFT(pIDHash2, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt2: ContractReceipt = await mintSensorNFTTxn2.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents2 = mintSensorNFTTxnReceipt2.events;
  const mintSensorNFTEvent2 = mintSensorNFTTxnEvents2 && mintSensorNFTTxnEvents2.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Two Log: ", mintSensorNFTEvent2?.args);

  // MINT SENSOR NFT 3
  const mintSensorNFTTxn3 = await sensorNFTContract.mintSensorNFT(pIDHash3, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt3: ContractReceipt = await mintSensorNFTTxn3.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents3 = mintSensorNFTTxnReceipt3.events;
  const mintSensorNFTEvent3 = mintSensorNFTTxnEvents3 && mintSensorNFTTxnEvents3.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Three Log: ", mintSensorNFTEvent3?.args);

  // MINT SENSOR NFT 4
  const mintSensorNFTTxn4 = await sensorNFTContract.mintSensorNFT(pIDHash4, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt4: ContractReceipt = await mintSensorNFTTxn4.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents4 = mintSensorNFTTxnReceipt4.events;
  const mintSensorNFTEvent4 = mintSensorNFTTxnEvents4 && mintSensorNFTTxnEvents4.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Four Log: ", mintSensorNFTEvent4?.args);

  const ERC6551Registry = await ethers.getContractFactory("ERC6551Registry");
  const erc6551Registry = await ERC6551Registry.deploy();

  await erc6551Registry.deployed();

  console.log(
    `ERC6551 Registry deployed to ${erc6551Registry.address}`
  );

  const ERC6551Account = await ethers.getContractFactory("ERC6551Account");
  const erc6551Account = await ERC6551Account.deploy();

  await erc6551Account.deployed();

  console.log(
    `ERC6551 Account deployed to ${erc6551Account.address}`
  );

  // CHECK OWNER OF A TOKEN
  const ownerOfTxn = await sensorNFTContract.ownerOf(0);
  console.log("Owner of token id: ", ownerOfTxn);

  // CHECK OWNER OF A TOKEN
  const ownerOfTxn2 = await sensorNFTContract.ownerOf(1);
  console.log("Owner of token id 1: ", ownerOfTxn2);

  // COMPUTE REGISTRY ACCOUNT
  const computeAccountTxn = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 0, 0);
  console.log("Account Txn Computed: ", computeAccountTxn);

  // COMPUTE REGISTRY ACCOUNT 2
  const computeAccountTxn2 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 1, 0);
  console.log("Account Txn Computed 2: ", computeAccountTxn2);

  // COMPUTE REGISTRY ACCOUNT 3
  const computeAccountTxn3 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 2, 0);
  console.log("Account Txn Computed 3: ", computeAccountTxn3);

  // COMPUTE REGISTRY ACCOUNT 4
  const computeAccountTxn4 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 3, 0);
  console.log("Account Txn Computed 4: ", computeAccountTxn4);

  // CREATE CONTRACT ACCOUNT FOR N4T
  const createAccountTxn = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 0, 0, []);

  const createAccountTxnReceipt: ContractReceipt = await createAccountTxn.wait();
  // Get the transaction logs
  const createAccountTxnEvents = createAccountTxnReceipt.events;
  const createAccountEvent = createAccountTxnEvents && createAccountTxnEvents.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent) {
    returnedNFTAccountAddress = createAccountEvent.args![0];
    console.log("Returned NFT Account Address: ", returnedNFTAccountAddress);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 1.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 0, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 2
  const createAccountTxn2 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 1, 0, []);

  const createAccountTxnReceipt2: ContractReceipt = await createAccountTxn2.wait();
  // Get the transaction logs
  const createAccountTxnEvents2 = createAccountTxnReceipt2.events;
  const createAccountEvent2 = createAccountTxnEvents2 && createAccountTxnEvents2.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress2: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent2) {
    returnedNFTAccountAddress2 = createAccountEvent2.args![0];
    console.log("Returned NFT Account Address 2: ", returnedNFTAccountAddress2);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 2.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress2,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 1, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 3
  const createAccountTxn3 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 2, 0, []);

  const createAccountTxnReceipt3: ContractReceipt = await createAccountTxn3.wait();
  // Get the transaction logs
  const createAccountTxnEvents3 = createAccountTxnReceipt3.events;
  const createAccountEvent3 = createAccountTxnEvents3 && createAccountTxnEvents3.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress3: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent3) {
    returnedNFTAccountAddress3 = createAccountEvent3.args![0];
    console.log("Returned NFT Account Address 3: ", returnedNFTAccountAddress3);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 3.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress3,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 2, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 4
  const createAccountTxn4 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 3, 0, []);

  const createAccountTxnReceipt4: ContractReceipt = await createAccountTxn4.wait();
  // Get the transaction logs
  const createAccountTxnEvents4 = createAccountTxnReceipt4.events;
  const createAccountEvent4 = createAccountTxnEvents4 && createAccountTxnEvents4.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress4: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent4) {
    returnedNFTAccountAddress4 = createAccountEvent4.args![0];
    console.log("Returned NFT Account Address 4: ", returnedNFTAccountAddress4);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 4.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress4,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 3, 0, []
  //   ]
  // })

  const NewERC6551Account = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account = NewERC6551Account.attach(returnedNFTAccountAddress);

  const NewERC6551Account2 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account2 = NewERC6551Account2.attach(returnedNFTAccountAddress2);

  const NewERC6551Account3 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account3 = NewERC6551Account3.attach(returnedNFTAccountAddress3);

  const NewERC6551Account4 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account4 = NewERC6551Account4.attach(returnedNFTAccountAddress4);

  const amountToSend = ethers.utils.parseEther("1.0"); // Amount of native tokens to send (1.0 ETH in this example)

  // Get the signer (account) to send the transaction
  const signer = ethers.provider.getSigner();
  const transaction = await signer.sendTransaction({
    to: returnedNFTAccountAddress,
    value: amountToSend,
  });
  const transaction2 = await signer.sendTransaction({
    to: returnedNFTAccountAddress2,
    value: amountToSend,
  });
  const transaction3 = await signer.sendTransaction({
    to: returnedNFTAccountAddress3,
    value: amountToSend,
  });
  const transaction4 = await signer.sendTransaction({
    to: returnedNFTAccountAddress4,
    value: amountToSend,
  });

  // Wait for the transaction to be mined
  const transactionReceipt = await transaction.wait();
  const transactionReceipt2 = await transaction2.wait();
  const transactionReceipt3 = await transaction3.wait();
  const transactionReceipt4 = await transaction4.wait();

  console.log("Transaction hash: ", transactionReceipt.transactionHash);
  console.log("Transaction hash 2: ", transactionReceipt2.transactionHash);
  console.log("Transaction hash 3: ", transactionReceipt3.transactionHash);
  console.log("Transaction hash 4: ", transactionReceipt4.transactionHash);

  const checkOwnerOfNFT = await newERC6551Account.owner()
  console.log("The owner of the NFT contract account is: ", checkOwnerOfNFT);

  const checkOwnerOfNFT2 = await newERC6551Account2.owner()
  console.log("The owner of the NFT contract account 2 is: ", checkOwnerOfNFT2);

  const checkOwnerOfNFT3 = await newERC6551Account3.owner()
  console.log("The owner of the NFT contract account 3 is: ", checkOwnerOfNFT3);

  const checkOwnerOfNFT4 = await newERC6551Account4.owner()
  console.log("The owner of the NFT contract account 4 is: ", checkOwnerOfNFT4);


  const checkNFTToken = await newERC6551Account.token()
  console.log("The details of the NFT token is: ", checkNFTToken);

  const checkNFTToken2 = await newERC6551Account2.token()
  console.log("The details of the NFT token 2 is: ", checkNFTToken2);

  const checkNFTToken3 = await newERC6551Account3.token()
  console.log("The details of the NFT token 3 is: ", checkNFTToken3);

  const checkNFTToken4 = await newERC6551Account4.token()
  console.log("The details of the NFT token 4 is: ", checkNFTToken4);

  // Claim a Sensor NFT
  const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pID1, SensorProfileContractAddress, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt: ContractReceipt = await claimSensorNFTTxn.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents = claimSensorNFTTxnReceipt.events;
  const claimSensorNFTEvent = claimSensorNFTTxnEvents && claimSensorNFTTxnEvents.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log: ", claimSensorNFTEvent?.args);


  // Claim a Sensor NFT 2
  const claimSensorNFTTxn2 = await sensorNFTContract.claimSensorNFT(pID2, SensorProfileContractAddress, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt2: ContractReceipt = await claimSensorNFTTxn2.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents2 = claimSensorNFTTxnReceipt2.events;
  const claimSensorNFTEvent2 = claimSensorNFTTxnEvents2 && claimSensorNFTTxnEvents2.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 2: ", claimSensorNFTEvent2?.args);


  // Claim a Sensor NFT 3
  const claimSensorNFTTxn3 = await sensorNFTContract.claimSensorNFT(pID3, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt3: ContractReceipt = await claimSensorNFTTxn3.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents3 = claimSensorNFTTxnReceipt3.events;
  const claimSensorNFTEvent3 = claimSensorNFTTxnEvents3 && claimSensorNFTTxnEvents3.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 3: ", claimSensorNFTEvent3?.args);


  // Claim a Sensor NFT 4
  const claimSensorNFTTxn4 = await sensorNFTContract.claimSensorNFT(pID4, SensorProfileContractAddress2, { value: AMOUNT_1000 });
  // const claimSensorNFTTxn = await sensorNFTContract.claimSensorNFT(pIDHash, { value: AMOUNT_1000 });
  const claimSensorNFTTxnReceipt4: ContractReceipt = await claimSensorNFTTxn4.wait();

  // Get the transaction logs
  const claimSensorNFTTxnEvents4 = claimSensorNFTTxnReceipt4.events;
  const claimSensorNFTEvent4 = claimSensorNFTTxnEvents4 && claimSensorNFTTxnEvents4.find(
    (event) => event.event === "SensorNFTClaimed"
  );
  console.log("Claim Sensor NFT Log 4: ", claimSensorNFTEvent4?.args);


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
  const renewDeviceTxn2 = await sensorNFTContract.renewDevice(pIDHash1, { value: AMOUNT_1000 });
  const renewDeviceTxnReceipt2: ContractReceipt = await renewDeviceTxn2.wait();

  // Get the transaction logs
  const renewDeviceTxnEvents2 = renewDeviceTxnReceipt2.events;
  const renewDeviceEvent2 = renewDeviceTxnEvents2 && renewDeviceTxnEvents2.find(
    (event) => event.event === "SensorNFTRenewed"
  );
  console.log("Renew PID Log 2: ", renewDeviceEvent2?.args);

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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
