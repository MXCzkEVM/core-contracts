import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import {
  LPWAN,
  MEP1004Token,
  ProxiedLPWAN,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// test.mxc name wrapper tokenid

const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }, options) => {
      await deployments.fixture(); // ensure you start from a fresh deployments
      const { deployer } = await getNamedAccounts();
      const LPWANContract = await ethers.getContract<ProxiedLPWAN>(
          "ProxiedLPWAN"
      );
      return {
        LPWANContract
      };
    }
);

describe("LPWAN", function () {
  this.timeout(15000)
  let LPWANContract: LPWAN
  let owner: SignerWithAddress;
  let tokenOwner: SignerWithAddress;
  let addrs: SignerWithAddress[];
  beforeEach(async function () {
    [owner, tokenOwner, ...addrs] = await ethers.getSigners();
    ({ LPWANContract } = await setupTest());
  });

  describe("Minting", async function () {
    it("should allow admin to mint", async function () {
      await expect(await LPWANContract.mintMEP1004Stations(owner.address, "testSNCode")).to
          .ok;
    });
  })
  describe("syncProvenRewardEvent", async function() {
    it('should not revert', function () {
      // await expect(await LPWANContract.syncProvenRewardEvent([{
      //   account: undefined,
      //   amount: undefined,
      //   cost: undefined,
      //   rewardHeight: undefined
      // }]))
    });
  })
});

