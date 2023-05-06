import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { BigNumber, constants } from "ethers";
import {
    MEP1002NamingToken,
    MEP1002NamingTokenMock,
    MEP1002NamingTokenMock__factory,
    MEP1002Token,
    MEP1002TokenMock,
    MEP1002TokenMock__factory,
    NameWrapperMock,
    NameWrapperMock__factory,
} from "../typechain-types";
import * as h3 from "h3-js";
import { H3Index, isValidCell } from "h3-js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { namehash } from "ethers/lib/utils";
import { getAddress } from "@ethersproject/address";

function bn(x: number): BigNumber {
    return BigNumber.from(x);
}

const ADDRESS_ZERO = constants.AddressZero;

const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }, options) => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const { deployer } = await getNamedAccounts();
        const MEP1002NamingToken = await ethers.getContract<MEP1002NamingToken>(
            "MEP1002NamingToken"
        );
        const MEP1002Token = await ethers.getContract<MEP1002Token>(
            "MEP1002Token"
        );
        const NameWrapperMockFactory =
            await ethers.getContractFactory<NameWrapperMock__factory>(
                "NameWrapperMock"
            );
        const NameWrapperMock = await NameWrapperMockFactory.deploy();
        await MEP1002Token.setMNSToken(NameWrapperMock.address);

        return {
            MEP1002Token,
            MEP1002NamingToken,
            NameWrapperMock,
        };
    }
);

describe("MEP1002Token", function () {
    let MEP1002Token: MEP1002Token;
    let MEP1002NamingToken: MEP1002NamingToken;
    let MEP1002TokenMock: MEP1002TokenMock;
    let MEP1002NamingTokenMock: MEP1002NamingTokenMock;
    let MEP1002NamingTokenMockFactory: MEP1002NamingTokenMock__factory;
    let MEP1002TokenMockFactory: MEP1002TokenMock__factory;
    let NameWrapperMock: NameWrapperMock;
    let owner: SignerWithAddress;
    let tokenOwner: SignerWithAddress;
    let addrs: SignerWithAddress[];
    beforeEach(async function () {
        [owner, tokenOwner, ...addrs] = await ethers.getSigners();
        ({ MEP1002Token, MEP1002NamingToken, NameWrapperMock } =
            await setupTest());
        MEP1002NamingTokenMockFactory =
            await ethers.getContractFactory<MEP1002NamingTokenMock__factory>(
                "MEP1002NamingTokenMock"
            );
        MEP1002TokenMockFactory =
            await ethers.getContractFactory<MEP1002TokenMock__factory>(
                "MEP1002TokenMock"
            );
    });

    const h3IndexRes7 = getRandomH3Index(7);
    const h3IndexRes8 = getRandomH3Index(8);
    const h3IndexRes8Parent = h3.cellToParent(h3IndexRes8, 7);
    console.log(h3.getResolution(h3IndexRes8Parent));
    if (
        !isValidCell(h3IndexRes7) ||
        !isValidCell(h3IndexRes8) ||
        !isValidCell(h3IndexRes8Parent)
    ) {
        console.error("Invalid h3Index");
        return;
    }
    console.log(
        "h3IndexRes7",
        h3IndexRes7,
        BigNumber.from(`0x${h3IndexRes7}`).toString()
    );
    console.log(
        "h3IndexRes8",
        h3IndexRes8,
        BigNumber.from(`0x${h3IndexRes8}`).toString()
    );
    console.log(
        "h3IndexRes8Parent",
        h3IndexRes8Parent,
        BigNumber.from(`0x${h3IndexRes8Parent}`).toString()
    );
    const h3IndexRes7Big = BigNumber.from(`0x${h3IndexRes7}`);
    const h3IndexRes8Big = BigNumber.from(`0x${h3IndexRes8}`);
    const h3IndexRes8ParentBig = BigNumber.from(`0x${h3IndexRes8Parent}`);

    // test.mxc name wrapper tokenid
    const testDotMXCTokenId = BigNumber.from(
        "68949889097187516169332801510365581835791041465326974816460712402969489861206"
    );
    describe("Init", async function () {
        it("cannot init again MEP1002Token", async function () {
            await expect(
                MEP1002Token.initialize(
                    "MEP1002Token",
                    "MEP1002",
                    MEP1002Token.address,
                    owner.address
                )
            ).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
        it("cannot init again MEP1002NamingToken", async function () {
            await expect(
                MEP1002Token.initialize(
                    "MEP1002NamingToken",
                    "MEP1002NT",
                    MEP1002NamingToken.address,
                    owner.address
                )
            ).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
    });

    describe("Minting", async function () {
        it("should mint", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
        });

        it("should mint naming token", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002NamingToken.balanceOf(owner.address)
            ).to.equal(1);
        });

        it("cannot mint by invalid h3index", async function () {
            await expect(
                MEP1002Token.mint(BigNumber.from(1))
            ).to.be.revertedWithCustomError(MEP1002Token, "InvalidGeolocation");
        });

        it("cannot mint already minted token", async function () {
            await MEP1002Token.mint(h3IndexRes7Big);
            await expect(
                MEP1002Token.mint(h3IndexRes7Big)
            ).to.be.revertedWithCustomError(
                MEP1002Token,
                "ERC721TokenAlreadyMinted"
            );
            await expect(
                await MEP1002Token.balanceOf(MEP1002Token.address)
            ).to.equal(1);
            await expect(
                await MEP1002NamingToken.balanceOf(owner.address)
            ).to.equal(1);
        });

        it("cannot mint res not 7", async function () {
            await expect(
                MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(1)}`))
            ).to.be.revertedWithCustomError(MEP1002Token, "InvalidGeolocation");
            await expect(
                MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(2)}`))
            ).to.be.revertedWithCustomError(MEP1002Token, "InvalidGeolocation");
            await expect(
                MEP1002Token.mint(h3IndexRes8Big)
            ).to.be.revertedWithCustomError(MEP1002Token, "InvalidGeolocation");
            await expect(
                MEP1002Token.mint(BigNumber.from(`0x${getRandomH3Index(9)}`))
            ).to.be.revertedWithCustomError(MEP1002Token, "InvalidGeolocation");
            await expect(
                await MEP1002Token.balanceOf(MEP1002Token.address)
            ).to.equal(0);
            await expect(
                await MEP1002NamingToken.balanceOf(owner.address)
            ).to.equal(0);
        });

        it("cannot transfer", async function () {
            await MEP1002Token.mint(h3IndexRes7Big);
            await expect(
                MEP1002Token.connect(owner).transferFrom(
                    owner.address,
                    tokenOwner.address,
                    h3IndexRes7Big
                )
            ).to.be.revertedWithCustomError(
                MEP1002Token,
                "NotApprovedOrDirectOwner"
            );
        });

        it("cannot set name without naming Token", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                MEP1002Token.connect(addrs[1]).setName(
                    h3IndexRes7Big,
                    BigNumber.from(namehash("test"))
                )
            ).to.be.revertedWithCustomError(MEP1002Token, "NoNamingPermission");
        });

        it("should return balance", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002Token.balanceOf(MEP1002Token.address)
            ).to.equal(1);
            await expect(await MEP1002Token.balanceOf(owner.address)).to.equal(
                0
            );
        });

        it("should mint token event", async function () {
            await expect(MEP1002Token.mint(h3IndexRes7Big))
                .to.emit(MEP1002Token, "MEP1002TokenUpdateName")
                .withArgs(h3IndexRes7Big, "");
        });

        it("should set name event", async function () {
            await MEP1002Token.mint(h3IndexRes7Big);
            await expect(
                MEP1002Token.setName(h3IndexRes7Big, testDotMXCTokenId)
            )
                .to.emit(MEP1002Token, "MEP1002TokenUpdateName")
                .withArgs(h3IndexRes7Big, "test.mxc");
            await expect(MEP1002Token.resetName(h3IndexRes7Big))
                .to.emit(MEP1002Token, "MEP1002TokenUpdateName")
                .withArgs(h3IndexRes7Big, "");
        });
        it("should setting name", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002Token.tokenNames(h3IndexRes7Big)
            ).to.equal("");
            await expect(
                await MEP1002Token.setName(h3IndexRes7Big, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1002Token.tokenNames(h3IndexRes7Big)
            ).to.equal("test.mxc");
        });

        it("should reset name", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002Token.tokenNames(h3IndexRes7Big)
            ).to.equal("");
            await expect(
                await MEP1002Token.setName(h3IndexRes7Big, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1002Token.tokenNames(h3IndexRes7Big)
            ).to.equal("test.mxc");
            await expect(await MEP1002Token.resetName(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002Token.tokenNames(h3IndexRes7Big)
            ).to.equal("");
        });

        it("should get uri", async function () {
            await MEP1002Token.setBaseURI("https://wannsee-test.mxc.com/");
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002Token.tokenURI(h3IndexRes7Big)).to.equal(
                `https://wannsee-test.mxc.com/${h3IndexRes7Big.toString()}?name=`
            );
        });

        it("should reset baseuri", async function () {
            await expect(
                await MEP1002Token.setBaseURI("https://wannsee-test-2.mxc.com/")
            ).to.ok;
            await expect(
                await MEP1002Token.setNamingToken(
                    MEP1002NamingToken.address,
                    "https://wannsee-test-3.mxc.com/"
                )
            ).to.ok;
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002Token.tokenURI(h3IndexRes7Big)).to.equal(
                `https://wannsee-test-2.mxc.com/${h3IndexRes7Big.toString()}?name=`
            );
            await expect(
                await MEP1002NamingToken.tokenURI(h3IndexRes7Big)
            ).to.equal(
                `https://wannsee-test-3.mxc.com/${h3IndexRes7Big.toString()}`
            );
        });

        it("should return supply", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002Token.totalSupply()).to.equal(1);
        });

        // it('should mint children both mint parent', async function() {
        //   await expect(await MEP1002Token.mint(h3IndexRes8Big)).to.ok;
        // await expect(await MEP1002Token.geolocation(2)).to.equal(h3IndexRes8Big);
        // await expect(await MEP1002Token.geolocationToTokenId(h3IndexRes8ParentBig)).to.equal(1);
        // await expect(await MEP1002Token.geolocation(2)).to.equal(h3IndexRes8Big);
        // await expect(await MEP1002Token.geolocationToTokenId(h3IndexRes8Big)).to.equal(2);
        // await expect(await MEP1002Token.mint(h3IndexRes8ParentBig)).to.ok;
        // });
    });
    describe("Naming token", async function () {
        it("should transfer naming token", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                MEP1002NamingToken.transferFrom(
                    owner.address,
                    addrs[1].address,
                    1
                )
            ).to.be.ok;
        });

        it("should transfer by approve", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(MEP1002NamingToken.approve(addrs[1].address, 1)).to.be
                .ok;
            await expect(
                MEP1002NamingToken.connect(addrs[1]).transferFrom(
                    owner.address,
                    addrs[1].address,
                    1
                )
            ).to.be.ok;
        });

        it("cannot transfer not owner or approved", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                MEP1002NamingToken.connect(addrs[1]).transferFrom(
                    addrs[1].address,
                    owner.address,
                    h3IndexRes7Big
                )
            ).to.be.revertedWith(
                "ERC721: caller is not token owner or approved"
            );
        });

        it("should get token uri", async function () {
            await MEP1002Token.setNamingToken(
                MEP1002NamingToken.address,
                "https://wannsee-test-2.mxc.com/"
            );
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(
                await MEP1002NamingToken.tokenURI(h3IndexRes7Big)
            ).to.equal(
                `https://wannsee-test-2.mxc.com/${h3IndexRes7Big.toString()}`
            );
        });

        it("should return supply", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002NamingToken.totalSupply()).to.equal(1);
        });
    });

    describe("Contract Upgrade MEP1002Token", async function () {
        it("should revert without upgrade", async function () {
            MEP1002TokenMock = await MEP1002TokenMockFactory.attach(
                MEP1002Token.address
            );
            await expect(
                MEP1002TokenMock.additionalFunction()
            ).to.be.revertedWithoutReason();
        });

        it("should update after upgrade", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002TokenMock.totalSupply()).to.equal(1);
            await expect(await MEP1002TokenMock.name()).to.equal(
                "MEP1002Token"
            );

            const newImple = await MEP1002TokenMockFactory.deploy();
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1002Token.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );

            await expect(await MEP1002Token.upgradeTo(newImple.address)).to.be
                .ok;
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(owner.address);
            await expect(await MEP1002TokenMock.totalSupply()).to.equal(1);
            await expect(await MEP1002TokenMock.name()).to.equal(
                "MEP1002Token V2"
            );
            await expect(await MEP1002TokenMock.additionalFunction()).to.equal(
                1
            );
        });

        it("should right admin slot after transferOwnership", async function () {
            const newImple = await MEP1002NamingTokenMockFactory.deploy();

            await expect(await MEP1002NamingToken.upgradeTo(newImple.address))
                .to.be.ok;
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1002NamingToken.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(addrs[1].address);
        });

        it("should revert upgrade after transferOwnership", async function () {
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1002NamingTokenMockFactory.deploy();
            await expect(
                MEP1002NamingToken.upgradeTo(newImple2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should upgrade after transferOwnership", async function () {
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1002NamingTokenMockFactory.deploy();
            await expect(
                await MEP1002NamingToken.connect(addrs[1]).upgradeTo(
                    newImple2.address
                )
            ).to.be.ok;
        });
    });

    describe("Contract Upgrade MEP1002NamingToken", async function () {
        it("should revert without upgrade", async function () {
            MEP1002NamingTokenMock = await MEP1002NamingTokenMockFactory.attach(
                MEP1002NamingToken.address
            );
            await expect(
                MEP1002NamingTokenMock.additionalFunction()
            ).to.be.revertedWithoutReason();
        });

        it("should update after upgrade", async function () {
            await expect(await MEP1002Token.mint(h3IndexRes7Big)).to.ok;
            await expect(await MEP1002NamingTokenMock.totalSupply()).to.equal(
                1
            );
            await expect(await MEP1002NamingTokenMock.name()).to.equal(
                "MEP1002NamingToken"
            );

            const newImple = await MEP1002NamingTokenMockFactory.deploy();
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1002NamingToken.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );

            await expect(await MEP1002NamingToken.upgradeTo(newImple.address))
                .to.be.ok;
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(owner.address);
            await expect(await MEP1002NamingTokenMock.totalSupply()).to.equal(
                1
            );
            await expect(await MEP1002NamingTokenMock.name()).to.equal(
                "MEP1002NamingToken V2"
            );
            await expect(
                await MEP1002NamingTokenMock.additionalFunction()
            ).to.equal(1);
        });

        it("should right admin slot after transferOwnership", async function () {
            const newImple = await MEP1002NamingTokenMockFactory.deploy();

            await expect(await MEP1002NamingToken.upgradeTo(newImple.address))
                .to.be.ok;
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1002NamingToken.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(addrs[1].address);
        });

        it("should revert upgrade after transferOwnership", async function () {
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1002NamingTokenMockFactory.deploy();
            await expect(
                MEP1002NamingToken.upgradeTo(newImple2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should upgrade after transferOwnership", async function () {
            await MEP1002NamingToken.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1002NamingTokenMockFactory.deploy();
            await expect(
                await MEP1002NamingToken.connect(addrs[1]).upgradeTo(
                    newImple2.address
                )
            ).to.be.ok;
        });
    });

    describe("Interface support", async function () {
        it("can support IERC721", async function () {
            expect(await MEP1002Token.supportsInterface("0x80ac58cd")).to.equal(
                true
            );
        });

        it("can support IERC6059", async function () {
            expect(await MEP1002Token.supportsInterface("0x42b0e56f")).to.equal(
                true
            );
        });

        it("cannot support other interfaceId", async function () {
            expect(await MEP1002Token.supportsInterface("0xffffffff")).to.equal(
                false
            );
        });
    });

    async function checkNoChildrenNorPending(parentId: number): Promise<void> {
        expect(await MEP1002Token.pendingChildrenOf(parentId)).to.eql([]);
        expect(await MEP1002Token.childrenOf(parentId)).to.eql([]);
    }

    async function checkAcceptedAndPendingChildren(
        contract: MEP1002Token,
        tokenId1: number,
        expectedAccepted: any[],
        expectedPending: any[]
    ) {
        const accepted = await contract.childrenOf(tokenId1);
        expect(accepted).to.eql(expectedAccepted);

        const pending = await contract.pendingChildrenOf(tokenId1);
        expect(pending).to.eql(expectedPending);
    }
});

function getRandomH3Index(res: number): H3Index {
    const MAX_LATITUDE = (90 * Math.PI) / 180;
    const MAX_LONGITUDE = (180 * Math.PI) / 180;

    const latitude = Math.random() * MAX_LATITUDE;
    const longitude = Math.random() * MAX_LONGITUDE;
    return h3.latLngToCell(latitude, longitude, res);
}
