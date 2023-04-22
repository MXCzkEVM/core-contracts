import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber, constants, Contract, ContractFactory } from "ethers";
import { MEP1002NamingTokenMock, MEP1002TokenMock } from "../typechain-types";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import * as h3 from 'h3-js';
import { H3Index, isValidCell } from "h3-js";

function bn(x: number): BigNumber {
  return BigNumber.from(x);
}

const ADDRESS_ZERO = constants.AddressZero;

async function getMEP1002Token(): Promise<{
  MEP1002Token: MEP1002TokenMock;
  MEP1002NamingToken: MEP1002NamingTokenMock,
}> {
  const MEP1002TokenFactory = await ethers.getContractFactory('MEP1002TokenMock');
  const MEP1002NamingTokenFactory = await ethers.getContractFactory('MEP1002NamingTokenMock');
  const MEP1002Token = (await MEP1002TokenFactory.deploy()) as MEP1002TokenMock;
  await MEP1002Token.deployed();
  const MEP1002NamingToken = (await MEP1002NamingTokenFactory.deploy()) as MEP1002NamingTokenMock;
  await MEP1002NamingToken.deployed();
  return { MEP1002Token, MEP1002NamingToken };
}

describe('MEP1002Token', function () {
  let MEP1002Token: MEP1002TokenMock;
  let MEP1002NamingToken: MEP1002NamingTokenMock;
  let owner: SignerWithAddress;
  let tokenOwner: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function() {
    [owner, tokenOwner, ...addrs] = await ethers.getSigners();
    ({ MEP1002Token, MEP1002NamingToken } = await loadFixture(getMEP1002Token));
    await MEP1002Token.init("MEP1002Token","MEP1002", MEP1002NamingToken.address);
  });

  const h3IndexRes7 = getRandomH3Index(7);

  if(!isValidCell(h3IndexRes7)) {
    console.error("Invalid h3Index", h3IndexRes7)
    return
  }
  console.log(h3IndexRes7)
  const h3IndexRes7Big = BigNumber.from(`0x${h3IndexRes7}`)
  describe("Init", async function() {
    it("should init", async function() {
      await expect(await MEP1002Token.name()).to.equal("MEP1002Token");
      await expect(await MEP1002Token.symbol()).to.equal("MEP1002");
    });
    it("cannot init again", async function() {
      await expect(MEP1002Token.init("MEP1002Token","MEP1002",MEP1002NamingToken.address)).to.be.revertedWith("Initializable: contract is already initialized");
    });
  })

  describe("Minting", async function() {
    it('should mint', async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      // await expect(await MEP1002Token.geolocation())
    });


    it('cannot mint already minted token', async function() {
      await MEP1002Token.mint(h3IndexRes7Big);
      await expect(MEP1002Token.mint(h3IndexRes7Big)).to.be.revertedWithCustomError(
        MEP1002Token,
        'ERC721TokenAlreadyMinted',
      );
  })


    describe('Interface support', async function() {
      it('can support IERC165', async function() {
        expect(await MEP1002Token.supportsInterface('0x01ffc9a7')).to.equal(true);
      });

      it('can support IERC721', async function() {
        expect(await MEP1002Token.supportsInterface('0x80ac58cd')).to.equal(true);
      });

      it('can support IERC6059', async function() {
        expect(await MEP1002Token.supportsInterface('0x42b0e56f')).to.equal(true);
      });

      it('cannot support other interfaceId', async function() {
        expect(await MEP1002Token.supportsInterface('0xffffffff')).to.equal(false);
      });
    });


    async function checkNoChildrenNorPending(parentId: number): Promise<void> {
      expect(await MEP1002Token.pendingChildrenOf(parentId)).to.eql([]);
      expect(await MEP1002Token.childrenOf(parentId)).to.eql([]);
    }

    async function checkAcceptedAndPendingChildren(
      contract: MEP1002TokenMock,
      tokenId1: number,
      expectedAccepted: any[],
      expectedPending: any[],
    ) {
      const accepted = await contract.childrenOf(tokenId1);
      expect(accepted).to.eql(expectedAccepted);

      const pending = await contract.pendingChildrenOf(tokenId1);
      expect(pending).to.eql(expectedPending);
    }
  });
})



function getRandomH3Index(res: number): H3Index {
  const MAX_LATITUDE = 90 * Math.PI / 180;
  const MAX_LONGITUDE = 180 * Math.PI / 180;

  const latitude = Math.random() * MAX_LATITUDE;
  const longitude = Math.random() * MAX_LONGITUDE;
  return h3.latLngToCell(latitude, longitude, res);
}