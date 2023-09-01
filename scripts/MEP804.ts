import { ContractReceipt } from "ethers";
import { ethers, run } from "hardhat";
import { check } from "prettier";
import MerkleProof from './merkle_proof.json'


// 0x286a62Bb0BdE46EDccF954FC0CCBad6ce7f2a55E

async function main() {
  const RewardContractAddress = '0xe0EAB72494C00fdCf736B57Be90574D0D8d769d2';
  const LPWANContractAddress = '0xe4E21d9191D76DA650CE5Ab247b82AFFEbF0472A';
  const ApplicationContractAddress = '0xe7e4d25905e4ac14d6151F999DEB3cC218055783';
  // const ApplicationContractAddress = '0xB483D0DB01251d302b3cCC2B18f4677DF8F7837c';
  const SensorProfileContractAddress1 = '0x664Cd4B6863528787b881c459026FfE5753e784F';
  const SensorProfileContractAddress2 = '0xDdC3Da0fb6F47D9424B785B6A6C5dd6F15eda170';
  const SensorProfileContractAddress3 = '0x6517F3Dfde6692E292B3329a098f4A4172D254a5';


  const NFTAccountAddress1 = "0xA0a88d7Dc432dCEaB270961AaFEadDf5B53A8BA7"; // 0, 100
  const NFTAccountAddress2 = "0x9D032C0e1F0DB80022AE241A527AF84080ceD16f"; // 1, 120
  const NFTAccountAddress3 = "0x8c7DaDD5c7E70B80890022A20A5f440afe269699"; // 2, 180
  const NFTAccountAddress4 = "0xdd792C63C72c890c27A228C617121C107b0b2420"; // 3, 150
  const NFTAccountAddress5 = "0x9A084443E3661CD1f4Af6acB9a601A8D5E46F7B9"; // 0, 101
  const NFTAccountAddress6 = "0xD50457B63Aca11Ca414d3211bF5825d23271D82B"; // 1, 121
  const NFTAccountAddress7 = "0x88e3C83E806282c9644979EfB9433Bdb8C253ebA"; // 2, 181
  const NFTAccountAddress8 = "0x9Ab38d7f3Bbf57Cc68a2E1B877374c662808FD3B"; // 3, 151


  const MerkleLeaf1 = MerkleProof[NFTAccountAddress1].leaf;
  const MerkleLeaf2 = MerkleProof[NFTAccountAddress2].leaf;
  const MerkleLeaf3 = MerkleProof[NFTAccountAddress3].leaf;
  const MerkleLeaf4 = MerkleProof[NFTAccountAddress4].leaf;
  const MerkleLeaf5 = MerkleProof[NFTAccountAddress5].leaf;
  const MerkleLeaf6 = MerkleProof[NFTAccountAddress6].leaf;
  const MerkleLeaf7 = MerkleProof[NFTAccountAddress7].leaf;
  const MerkleLeaf8 = MerkleProof[NFTAccountAddress8].leaf;

  const MerkleProof1 = MerkleProof[NFTAccountAddress1].proof;
  const MerkleProof2 = MerkleProof[NFTAccountAddress2].proof;
  const MerkleProof3 = MerkleProof[NFTAccountAddress3].proof;
  const MerkleProof4 = MerkleProof[NFTAccountAddress4].proof;
  const MerkleProof5 = MerkleProof[NFTAccountAddress5].proof;
  const MerkleProof6 = MerkleProof[NFTAccountAddress6].proof;
  const MerkleProof7 = MerkleProof[NFTAccountAddress7].proof;
  const MerkleProof8 = MerkleProof[NFTAccountAddress8].proof;

  const XToEarnFormula = { x: 'y', a: 'b' }

  const CYCLE_COUNT = 1;
  const MERKLE_ROOT = '0x5188db936900589dbdf928aa5672376cdb198a6e12672d7d681e2de51469df3b';

  const [owner, otherAccount] = await ethers.getSigners();

  /// @NOTICE: use this if you want to deploy MEP804 as stand-alone
  const RewardContract = await ethers.getContractFactory("RewardContract");
  const rewardContract = await RewardContract.deploy(ApplicationContractAddress, owner.address, LPWANContractAddress, [SensorProfileContractAddress1, SensorProfileContractAddress2, SensorProfileContractAddress3], XToEarnFormula, 'MXC Reward Token', 'MRT', ethers.utils.parseEther('3000'), MERKLE_ROOT, CYCLE_COUNT);

  await rewardContract.deployed()
  console.log(`Reward Contract deployed to ${rewardContract.address}`)

  /// @NOTICE: use this if you deployed MEP804 from the LPWAN Mock
  // const RewardContract = await ethers.getContractFactory("RewardContract");
  // const rewardContract = RewardContract.attach(RewardContractAddress);

  // GET BALANCE OF CONTRACT
  const balanceOfRewardTxn = await rewardContract.balanceOf(rewardContract.address);
  console.log("Balance Of Reward Contract Txn Log: ", balanceOfRewardTxn);

  // GET BALANCE OF LPWAN CONTRACT
  const balanceOfLPWANTxn = await rewardContract.balanceOf(LPWANContractAddress);
  console.log("Balance Of LPWAN Txn Log: ", balanceOfLPWANTxn);

  // GET NEW BALANCE OF CONTRACT
  const balanceOfRewardTxn2 = await rewardContract.balanceOf(rewardContract.address);
  console.log("Balance Of Reward Contract Txn Log: ", balanceOfRewardTxn2);


  // CLAIM REWARD 1
  const claimRewardTxn1 = await rewardContract.claimReward(
    ApplicationContractAddress,
    SensorProfileContractAddress1,
    NFTAccountAddress1,
    MERKLE_ROOT,
    MerkleProof1,
    MerkleLeaf1,
    100,
    0,
    1);
  const claimRewardTxn1Receipt: ContractReceipt = await claimRewardTxn1.wait();

  // Get the transaction logs
  const claimRewardTxn1Events = claimRewardTxn1Receipt.events;
  const claimRewardEvent1 = claimRewardTxn1Events && claimRewardTxn1Events.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward Log: ", claimRewardEvent1?.args);

  // CLAIM REWARD 2
  const claimRewardTxn2 = await rewardContract.claimReward(
    ApplicationContractAddress,
    SensorProfileContractAddress2,
    NFTAccountAddress2,
    MERKLE_ROOT,
    MerkleProof2,
    MerkleLeaf2,
    120,
    1,
    1);
  const claimRewardTxnReceipt2: ContractReceipt = await claimRewardTxn2.wait();

  // Get the transaction logs
  const claimRewardTxnEvents2 = claimRewardTxnReceipt2.events;
  const claimRewardEvent2 = claimRewardTxnEvents2 && claimRewardTxnEvents2.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 2 Log: ", claimRewardEvent2?.args);

  // CLAIM REWARD 3
  const claimRewardTxn3 = await rewardContract.claimReward(
    ApplicationContractAddress,
    SensorProfileContractAddress2,
    NFTAccountAddress3, MERKLE_ROOT, MerkleProof3, MerkleLeaf3, 180, 2, 1);
  const claimRewardTxnReceipt3: ContractReceipt = await claimRewardTxn3.wait();

  // Get the transaction logs
  const claimRewardTxnEvents3 = claimRewardTxnReceipt3.events;
  const claimRewardEvent3 = claimRewardTxnEvents3 && claimRewardTxnEvents3.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 3 Log: ", claimRewardEvent3?.args);

  // CLAIM REWARD 4
  const claimRewardTxn4 = await rewardContract.claimReward(ApplicationContractAddress, SensorProfileContractAddress2, NFTAccountAddress4, MERKLE_ROOT, MerkleProof4, MerkleLeaf4, 150, 3, 1);
  const claimRewardTxnReceipt4: ContractReceipt = await claimRewardTxn4.wait();

  // Get the transaction logs
  const claimRewardTxnEvents4 = claimRewardTxnReceipt4.events;
  const claimRewardEvent4 = claimRewardTxnEvents4 && claimRewardTxnEvents4.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 4 Log: ", claimRewardEvent4?.args);

  // CLAIM REWARD 5
  const claimRewardTxn5 = await rewardContract.claimReward(ApplicationContractAddress, SensorProfileContractAddress2, NFTAccountAddress5, MERKLE_ROOT, MerkleProof5, MerkleLeaf5, 145, 4, 1);
  const claimRewardTxnReceipt5: ContractReceipt = await claimRewardTxn5.wait();

  // Get the transaction logs
  const claimRewardTxnEvents5 = claimRewardTxnReceipt5.events;
  const claimRewardEvent5 = claimRewardTxnEvents5 && claimRewardTxnEvents5.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 5 Log: ", claimRewardEvent5?.args);


  // CLAIM REWARD 6
  const claimRewardTxn6 = await rewardContract.claimReward(ApplicationContractAddress, SensorProfileContractAddress3, NFTAccountAddress6, MERKLE_ROOT, MerkleProof6, MerkleLeaf6, 220, 5, 1);
  const claimRewardTxnReceipt6: ContractReceipt = await claimRewardTxn6.wait();

  // Get the transaction logs
  const claimRewardTxnEvents6 = claimRewardTxnReceipt6.events;
  const claimRewardEvent6 = claimRewardTxnEvents6 && claimRewardTxnEvents6.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 6 Log: ", claimRewardEvent6?.args);


  // CLAIM REWARD 7
  const claimRewardTxn7 = await rewardContract.claimReward(ApplicationContractAddress, SensorProfileContractAddress3, NFTAccountAddress7, MERKLE_ROOT, MerkleProof7, MerkleLeaf7, 195, 6, 1);
  const claimRewardTxnReceipt7: ContractReceipt = await claimRewardTxn7.wait();

  // Get the transaction logs
  const claimRewardTxnEvents7 = claimRewardTxnReceipt7.events;
  const claimRewardEvent7 = claimRewardTxnEvents7 && claimRewardTxnEvents7.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 7 Log: ", claimRewardEvent7?.args);


  // CLAIM REWARD 8
  const claimRewardTxn8 = await rewardContract.claimReward(ApplicationContractAddress, SensorProfileContractAddress3, NFTAccountAddress8, MERKLE_ROOT, MerkleProof8, MerkleLeaf8, 278, 7, 1);
  const claimRewardTxnReceipt8: ContractReceipt = await claimRewardTxn8.wait();

  // Get the transaction logs
  const claimRewardTxnEvents8 = claimRewardTxnReceipt8.events;
  const claimRewardEvent8 = claimRewardTxnEvents8 && claimRewardTxnEvents8.find(
    (event) => event.event === "RewardClaimed"
  );
  console.log("CLAIM Reward 8 Log: ", claimRewardEvent8?.args);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 1
  const newBalanceOfNFTTxn1 = await rewardContract.balanceOf(NFTAccountAddress1);
  console.log("New Balance Of NFT Contract 1 Log: ", newBalanceOfNFTTxn1);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 2
  const newBalanceOfNFTTxn2 = await rewardContract.balanceOf(NFTAccountAddress2);
  console.log("New Balance Of NFT Contract 2 Log: ", newBalanceOfNFTTxn2);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 3
  const newBalanceOfNFTTxn3 = await rewardContract.balanceOf(NFTAccountAddress3);
  console.log("New Balance Of NFT Contract 3 Log: ", newBalanceOfNFTTxn3);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 4
  const newBalanceOfNFTTxn4 = await rewardContract.balanceOf(NFTAccountAddress4);
  console.log("New Balance Of NFT Contract 4 Log: ", newBalanceOfNFTTxn4);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 5
  const newBalanceOfNFTTxn5 = await rewardContract.balanceOf(NFTAccountAddress5);
  console.log("New Balance Of NFT Contract 5 Log: ", newBalanceOfNFTTxn5);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 6
  const newBalanceOfNFTTxn6 = await rewardContract.balanceOf(NFTAccountAddress6);
  console.log("New Balance Of NFT Contract 6 Log: ", newBalanceOfNFTTxn6);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 7
  const newBalanceOfNFTTxn7 = await rewardContract.balanceOf(NFTAccountAddress7);
  console.log("New Balance Of NFT Contract 7 Log: ", newBalanceOfNFTTxn7);


  // GET REWARD BALANCE OF NFT CONTRACT AGAIN 8
  const newBalanceOfNFTTxn8 = await rewardContract.balanceOf(NFTAccountAddress8);
  console.log("New Balance Of NFT Contract 8 Log: ", newBalanceOfNFTTxn8);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
