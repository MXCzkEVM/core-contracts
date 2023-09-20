import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";


async function main() {
  const SensorNFTContractAddress = '0x2D4c1ba92438d11f9E5EF081A8bd8fD515d749F4';
  const ApplicationContractAddress = '0xe7e4d25905e4ac14d6151F999DEB3cC218055783';
  const SensorProfileContractAddress1 = '0x664Cd4B6863528787b881c459026FfE5753e784F';
  const SensorProfileContractAddress2 = '0xDdC3Da0fb6F47D9424B785B6A6C5dd6F15eda170';
  const SensorProfileContractAddress3 = '0x6517F3Dfde6692E292B3329a098f4A4172D254a5';

  const [owner, otherAccount] = await ethers.getSigners();

  const EMAIL = 'aabiodunawoyemi@gmail.com';
  const PID_AMOUNT = 7;
  const TOKENID_1 = 0;
  const TOKENID_2 = 1;
  const TOKENID_3 = 2;
  const TOKENID_4 = 3;
  const TOKENID_5 = 4;
  const TOKENID_6 = 5;
  const TOKENID_7 = 6;
  const TOKENID_8 = 7;
  // const pID = ethers.utils.formatBytes32String('TESTPIDOOOOOOOOOOOOOOOOO');
  const pIDHash1 = '0x47773d91e4913a3a9fa9b096553bc866e1cfaf7c89980b4c9f6de80446daf604'
  const pIDHash2 = '0x47bc69b4685cacbd5f8733224b0e5724a1a098eeaa5b5d2acf81705ac6a4de51'
  const pIDHash3 = '0x443a98a6042634775e5df6219d4204245c8aebec3b0aff8cb67786d69b21e12b'
  const pIDHash4 = '0x53d5dee27e1c6be3687b946cfdd90eef573064e1da149d14d6f358cc506705f2'
  const pIDHash5 = '0x805c4e58c76c661ff08ac93886c5341bf908d257ad833c18aa06a4e88974ab30'
  const pIDHash6 = '0xbd6e7b9376392d7e51a95bdfd70af98852a412dbfdf162eef5acf6397ff934d2'
  const pIDHash7 = '0xf0a92f35a40623ebc000ac9ac897599aaf04c0f72187b1b9085e07f31b4836ab'
  const pIDHash8 = '0xaf5afad71feb8a6ef5bc339150481ad420ded52dde61157166e7f29702530776'

  const AMOUNT_1000 = ethers.utils.parseEther('1000');
  const TOKEN_URI = 'https://gateway.pinata.cloud/ipfs/Qmav5akQh5ZzWZ1UKAQ66LaXZZFnYqC3GYw6xVVJiXfQfu';
  const CHAINID = 5167003

  const SensorNFTContract = await ethers.getContractFactory("SensorNFTContract");
  const sensorNFTContract = SensorNFTContract.attach(SensorNFTContractAddress);

  // PRODUCE A PID
  const producePIDTxn = await sensorNFTContract.producePID(EMAIL, PID_AMOUNT, ApplicationContractAddress, SensorProfileContractAddress1);
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

  // MINT SENSOR NFT 5
  const mintSensorNFTTxn5 = await sensorNFTContract.mintSensorNFT(pIDHash5, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt5: ContractReceipt = await mintSensorNFTTxn5.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents5 = mintSensorNFTTxnReceipt5.events;
  const mintSensorNFTEvent5 = mintSensorNFTTxnEvents5 && mintSensorNFTTxnEvents5.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Five Log: ", mintSensorNFTEvent5?.args);

  // MINT SENSOR NFT 6
  const mintSensorNFTTxn6 = await sensorNFTContract.mintSensorNFT(pIDHash6, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt6: ContractReceipt = await mintSensorNFTTxn6.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents6 = mintSensorNFTTxnReceipt6.events;
  const mintSensorNFTEvent6 = mintSensorNFTTxnEvents6 && mintSensorNFTTxnEvents6.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Six Log: ", mintSensorNFTEvent6?.args);

  // MINT SENSOR NFT 7
  const mintSensorNFTTxn7 = await sensorNFTContract.mintSensorNFT(pIDHash7, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt7: ContractReceipt = await mintSensorNFTTxn7.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents7 = mintSensorNFTTxnReceipt7.events;
  const mintSensorNFTEvent7 = mintSensorNFTTxnEvents7 && mintSensorNFTTxnEvents7.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Seven Log: ", mintSensorNFTEvent7?.args);

  // MINT SENSOR NFT 8
  const mintSensorNFTTxn8 = await sensorNFTContract.mintSensorNFT(pIDHash8, TOKEN_URI, { value: AMOUNT_1000 });
  const mintSensorNFTTxnReceipt8: ContractReceipt = await mintSensorNFTTxn8.wait();

  // Get the transaction logs
  const mintSensorNFTTxnEvents8 = mintSensorNFTTxnReceipt8.events;
  const mintSensorNFTEvent8 = mintSensorNFTTxnEvents8 && mintSensorNFTTxnEvents8.find(
    (event) => event.event === "SensorNFTMinted"
  );
  console.log("Mint Sensor NFT Eight Log: ", mintSensorNFTEvent8?.args);

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

  // COMPUTE REGISTRY ACCOUNT 5
  const computeAccountTxn5 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 4, 0);
  console.log("Account Txn Computed 5: ", computeAccountTxn5);

  // COMPUTE REGISTRY ACCOUNT 6
  const computeAccountTxn6 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 5, 0);
  console.log("Account Txn Computed 6: ", computeAccountTxn6);

  // COMPUTE REGISTRY ACCOUNT 7
  const computeAccountTxn7 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 6, 0);
  console.log("Account Txn Computed 7: ", computeAccountTxn7);

  // COMPUTE REGISTRY ACCOUNT 8
  const computeAccountTxn8 = await erc6551Registry.account(erc6551Account.address, CHAINID, SensorNFTContractAddress, 7, 0);
  console.log("Account Txn Computed 8: ", computeAccountTxn8);

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

  // CREATE CONTRACT ACCOUNT FOR NFT 5
  const createAccountTxn5 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 4, 0, []);

  const createAccountTxnReceipt5: ContractReceipt = await createAccountTxn5.wait();
  // Get the transaction logs
  const createAccountTxnEvents5 = createAccountTxnReceipt5.events;
  const createAccountEvent5 = createAccountTxnEvents5 && createAccountTxnEvents5.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress5: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent5) {
    returnedNFTAccountAddress5 = createAccountEvent5.args![0];
    console.log("Returned NFT Account Address 5: ", returnedNFTAccountAddress5);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 5.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress5,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 4, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 6
  const createAccountTxn6 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 5, 0, []);

  const createAccountTxnReceipt6: ContractReceipt = await createAccountTxn6.wait();
  // Get the transaction logs
  const createAccountTxnEvents6 = createAccountTxnReceipt6.events;
  const createAccountEvent6 = createAccountTxnEvents6 && createAccountTxnEvents6.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress6: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent6) {
    returnedNFTAccountAddress6 = createAccountEvent6.args![0];
    console.log("Returned NFT Account Address 6: ", returnedNFTAccountAddress6);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 6.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress6,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 5, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 7
  const createAccountTxn7 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 6, 0, []);

  const createAccountTxnReceipt7: ContractReceipt = await createAccountTxn7.wait();
  // Get the transaction logs
  const createAccountTxnEvents7 = createAccountTxnReceipt7.events;
  const createAccountEvent7 = createAccountTxnEvents7 && createAccountTxnEvents7.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress7: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent7) {
    returnedNFTAccountAddress7 = createAccountEvent7.args![0];
    console.log("Returned NFT Account Address 7: ", returnedNFTAccountAddress7);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 7.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress7,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 6, 0, []
  //   ]
  // })

  // CREATE CONTRACT ACCOUNT FOR NFT 8
  const createAccountTxn8 = await erc6551Registry.createAccount(erc6551Account.address, CHAINID, SensorNFTContractAddress, 7, 0, []);

  const createAccountTxnReceipt8: ContractReceipt = await createAccountTxn8.wait();
  // Get the transaction logs
  const createAccountTxnEvents8 = createAccountTxnReceipt8.events;
  const createAccountEvent8 = createAccountTxnEvents8 && createAccountTxnEvents8.find(
    (event) => event.event === "AccountCreated"
  );
  let returnedNFTAccountAddress8: any;
  // Check if the event exists before accessing its args
  if (createAccountEvent8) {
    returnedNFTAccountAddress8 = createAccountEvent8.args![0];
    console.log("Returned NFT Account Address 8: ", returnedNFTAccountAddress8);
  } else {
    console.log("AccountCreated event not found in the transaction receipt.");
  }

  // console.log('Verifying NFT Account 8.....');
  // await run("verify:verify", {
  //   address: returnedNFTAccountAddress8,
  //   constructorArguments: [
  //     erc6551Account.address, CHAINID, SensorNFTContractAddress, 7, 0, []
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

  const NewERC6551Account5 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account5 = NewERC6551Account5.attach(returnedNFTAccountAddress5);

  const NewERC6551Account6 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account6 = NewERC6551Account6.attach(returnedNFTAccountAddress6);

  const NewERC6551Account7 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account7 = NewERC6551Account7.attach(returnedNFTAccountAddress7);

  const NewERC6551Account8 = await ethers.getContractFactory("ERC6551Account");
  const newERC6551Account8 = NewERC6551Account8.attach(returnedNFTAccountAddress8);

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
  const transaction5 = await signer.sendTransaction({
    to: returnedNFTAccountAddress5,
    value: amountToSend,
  });
  const transaction6 = await signer.sendTransaction({
    to: returnedNFTAccountAddress6,
    value: amountToSend,
  });
  const transaction7 = await signer.sendTransaction({
    to: returnedNFTAccountAddress7,
    value: amountToSend,
  });
  const transaction8 = await signer.sendTransaction({
    to: returnedNFTAccountAddress8,
    value: amountToSend,
  });

  // Wait for the transaction to be mined
  const transactionReceipt = await transaction.wait();
  const transactionReceipt2 = await transaction2.wait();
  const transactionReceipt3 = await transaction3.wait();
  const transactionReceipt4 = await transaction4.wait();
  const transactionReceipt5 = await transaction5.wait();
  const transactionReceipt6 = await transaction6.wait();
  const transactionReceipt7 = await transaction7.wait();
  const transactionReceipt8 = await transaction8.wait();

  console.log("Transaction hash: ", transactionReceipt.transactionHash);
  console.log("Transaction hash 2: ", transactionReceipt2.transactionHash);
  console.log("Transaction hash 3: ", transactionReceipt3.transactionHash);
  console.log("Transaction hash 4: ", transactionReceipt4.transactionHash);
  console.log("Transaction hash 5: ", transactionReceipt5.transactionHash);
  console.log("Transaction hash 6: ", transactionReceipt6.transactionHash);
  console.log("Transaction hash 7: ", transactionReceipt7.transactionHash);
  console.log("Transaction hash 8: ", transactionReceipt8.transactionHash);

  const checkOwnerOfNFT = await newERC6551Account.owner()
  console.log("The owner of the NFT contract account is: ", checkOwnerOfNFT);

  const checkOwnerOfNFT2 = await newERC6551Account2.owner()
  console.log("The owner of the NFT contract account 2 is: ", checkOwnerOfNFT2);

  const checkOwnerOfNFT3 = await newERC6551Account3.owner()
  console.log("The owner of the NFT contract account 3 is: ", checkOwnerOfNFT3);

  const checkOwnerOfNFT4 = await newERC6551Account4.owner()
  console.log("The owner of the NFT contract account 4 is: ", checkOwnerOfNFT4);

  const checkOwnerOfNFT5 = await newERC6551Account5.owner()
  console.log("The owner of the NFT contract account 5 is: ", checkOwnerOfNFT5);

  const checkOwnerOfNFT6 = await newERC6551Account6.owner()
  console.log("The owner of the NFT contract account 6 is: ", checkOwnerOfNFT6);

  const checkOwnerOfNFT7 = await newERC6551Account7.owner()
  console.log("The owner of the NFT contract account 7 is: ", checkOwnerOfNFT7);

  const checkOwnerOfNFT8 = await newERC6551Account8.owner()
  console.log("The owner of the NFT contract account 8 is: ", checkOwnerOfNFT8);


  const checkNFTToken = await newERC6551Account.token()
  console.log("The details of the NFT token is: ", checkNFTToken);

  const checkNFTToken2 = await newERC6551Account2.token()
  console.log("The details of the NFT token 2 is: ", checkNFTToken2);

  const checkNFTToken3 = await newERC6551Account3.token()
  console.log("The details of the NFT token 3 is: ", checkNFTToken3);

  const checkNFTToken4 = await newERC6551Account4.token()
  console.log("The details of the NFT token 4 is: ", checkNFTToken4);

  const checkNFTToken5 = await newERC6551Account5.token()
  console.log("The details of the NFT token 5 is: ", checkNFTToken5);

  const checkNFTToken6 = await newERC6551Account6.token()
  console.log("The details of the NFT token 6 is: ", checkNFTToken6);

  const checkNFTToken7 = await newERC6551Account7.token()
  console.log("The details of the NFT token 7 is: ", checkNFTToken7);

  const checkNFTToken8 = await newERC6551Account8.token()
  console.log("The details of the NFT token 8 is: ", checkNFTToken8);
  

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
