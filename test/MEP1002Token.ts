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
  const h3IndexRes8 = getRandomH3Index(8);
  const h3IndexRes8Parent = h3.cellToParent(h3IndexRes8, 7);
  console.log(h3.getResolution(h3IndexRes8Parent))
  if(!isValidCell(h3IndexRes7) || !isValidCell(h3IndexRes8) || !isValidCell(h3IndexRes8Parent)) {
    console.error("Invalid h3Index")
    return
  }
  console.log("h3IndexRes7", h3IndexRes7, BigNumber.from(`0x${h3IndexRes7}`).toString());
  console.log("h3IndexRes8", h3IndexRes8,  BigNumber.from(`0x${h3IndexRes8}`).toString())
  console.log("h3IndexRes8Parent", h3IndexRes8Parent, BigNumber.from(`0x${h3IndexRes8Parent}`).toString())
  const h3IndexRes7Big = BigNumber.from(`0x${h3IndexRes7}`)
  const h3IndexRes8Big = BigNumber.from(`0x${h3IndexRes8}`)
  const h3IndexRes8ParentBig = BigNumber.from(`0x${h3IndexRes8Parent}`)
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
      });


      it("should mint naming token", async function() {
        await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
        await expect(await MEP1002NamingToken.balanceOf(owner.address)).to.equal(1);
      });

      it("should geolocation", async function() {
        await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
        await expect(await MEP1002Token.geolocation(1)).to.equal(h3IndexRes7Big);
        await expect(await MEP1002Token.geolocationToTokenId(h3IndexRes7Big)).to.equal(1);
      })

    it("cannot mint by invalid h3index", async function() {
      await expect(MEP1002Token.mint(BigNumber.from(1))).to.be.revertedWithCustomError(
        MEP1002Token,
        "InvalidGeolocation"
      )
    })

      it('cannot mint already minted token', async function() {
        await MEP1002Token.mint(h3IndexRes7Big);
        await expect(MEP1002Token.mint(h3IndexRes7Big)).to.be.revertedWithCustomError(
          MEP1002Token,
          'ERC721TokenAlreadyMinted',
        );
        await expect(await MEP1002Token.balanceOf(MEP1002Token.address)).to.equal(1);
        await expect(await MEP1002NamingToken.balanceOf(owner.address)).to.equal(1);
      })

      it("cannot mint res not 7", async function() {
        await expect(MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(1)}`))).to.be.revertedWithCustomError(
          MEP1002Token,
          "InvalidGeolocation"
        );
        await expect(MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(2)}`))).to.be.revertedWithCustomError(
          MEP1002Token,
          "InvalidGeolocation"
        );
        await expect(MEP1002Token.mint(h3IndexRes8Big)).to.be.revertedWithCustomError(
          MEP1002Token,
          "InvalidGeolocation"
        );
        await expect(MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(9)}`))).to.be.revertedWithCustomError(
          MEP1002Token,
          "InvalidGeolocation"
        );
        await expect(await MEP1002Token.balanceOf(MEP1002Token.address)).to.equal(0);
        await expect(await MEP1002NamingToken.balanceOf(owner.address)).to.equal(0);
      })

      it("cannot transfer", async function() {
        await MEP1002Token.mint(h3IndexRes7Big);
        await expect(MEP1002Token.connect(owner).transferFrom(owner.address, tokenOwner.address, 1)).to.be.revertedWithCustomError(
          MEP1002Token,
          "NotApprovedOrDirectOwner"
        )
      })

    it("cannot set name without naming Token", async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      await expect(MEP1002Token.connect(addrs[1]).setName(1, "test")).to.be.revertedWithCustomError(
        MEP1002Token,
        "NoNamingPermission")
    })

    it("should return balance", async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      await expect(await MEP1002Token.balanceOf(MEP1002Token.address)).to.equal(1);
      await expect(await MEP1002Token.balanceOf(owner.address)).to.equal(0);
    });

    it("should mint token event", async function() {
      await expect(MEP1002Token.mint(h3IndexRes7Big)).to.emit(MEP1002Token, "MEP1002TokenUpdateAttr").withArgs(1, h3IndexRes7Big, 1, h3IndexRes7Big.toString());
      await expect(MEP1002Token.setName(1,"test")).to.emit(MEP1002Token, "MEP1002TokenUpdateAttr").withArgs(1, h3IndexRes7Big, 1, "test");
    });

    it("should setting name", async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      await expect((await MEP1002Token.getAttr(1))["3"]).to.be.equal(h3IndexRes7Big.toString());
      await expect(await MEP1002Token.setName(1, "test")).to.be.ok;
      await expect((await MEP1002Token.getAttr(1))["3"]).to.be.equal("test");
    });

    it("should return attr", async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      // [parentId, geolocation, namingRightTokenId, name]
      await expect((await MEP1002Token.getAttr(1))["0"]).to.be.equal(0);
      await expect((await MEP1002Token.getAttr(1))["1"]).to.be.equal(h3IndexRes7Big);
      await expect((await MEP1002Token.getAttr(1))["2"]).to.be.equal(1);
      await expect((await MEP1002Token.getAttr(1))["3"]).to.be.equal(h3IndexRes7Big.toString());
    });



    // it('should mint children both mint parent', async function() {
      //   await expect(await MEP1002Token.mint(h3IndexRes8Big)).to.be.ok;
        // await expect(await MEP1002Token.geolocation(2)).to.equal(h3IndexRes8Big);
        // await expect(await MEP1002Token.geolocationToTokenId(h3IndexRes8ParentBig)).to.equal(1);
        // await expect(await MEP1002Token.geolocation(2)).to.equal(h3IndexRes8Big);
        // await expect(await MEP1002Token.geolocationToTokenId(h3IndexRes8Big)).to.equal(2);
        // await expect(await MEP1002Token.mint(h3IndexRes8ParentBig)).to.be.ok;
      // });
  })
  describe("Naming token", async function() {


    it("should transfer naming token", async function() {
        await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
        await expect(MEP1002NamingToken.transferFrom(owner.address, addrs[1].address, 1)).to.be.ok;
    });


    it("should transfer by approve", async function() {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      await expect(MEP1002NamingToken.approve(addrs[1].address, 1)).to.be.ok;
      await expect(MEP1002NamingToken.connect(addrs[1]).transferFrom(owner.address, addrs[1].address, 1)).to.be.ok;
    });

    it("cannot transfer not owner or approved", async function () {
      await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.be.ok;
      await expect(MEP1002NamingToken.connect(addrs[1]).transferFrom(addrs[1].address, owner.address, 1)).to.be.revertedWith(
        "ERC721: caller is not token owner or approved"
      );
    })

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
})



function getRandomH3Index(res: number): H3Index {
  const MAX_LATITUDE = 90 * Math.PI / 180;
  const MAX_LONGITUDE = 180 * Math.PI / 180;

  const latitude = Math.random() * MAX_LATITUDE;
  const longitude = Math.random() * MAX_LONGITUDE;
  return h3.latLngToCell(latitude, longitude, res);
}