import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { BigNumber, constants } from "ethers";
import {
    MEP1004Token,
    MEP1004TokenMock,
    MEP1004TokenMock__factory,
    NameWrapperMock,
    NameWrapperMock__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getAddress } from "@ethersproject/address";

function bn(x: number): BigNumber {
    return BigNumber.from(x);
}

const ADDRESS_ZERO = constants.AddressZero;

// test.mxc name wrapper tokenid

const setupTest = deployments.createFixture(
    async ({ deployments, getNamedAccounts, ethers }, options) => {
        await deployments.fixture(); // ensure you start from a fresh deployments
        const { deployer } = await getNamedAccounts();
        const MEP1004Token = await ethers.getContract<MEP1004Token>(
            "MEP1004Token"
        );
        const NameWrapperMockFactory =
            await ethers.getContractFactory<NameWrapperMock__factory>(
                "NameWrapperMock"
            );
        const NameWrapperMock = await NameWrapperMockFactory.deploy();
        await MEP1004Token.setMNSToken(NameWrapperMock.address);

        return {
            MEP1004Token,
            NameWrapperMock,
        };
    }
);

describe("MEP1004Token", function () {
    let MEP1004Token: MEP1004Token;
    let NameWrapperMock: NameWrapperMock;
    let MEP1004TokenMock: MEP1004TokenMock;
    let MEP1004TokenMockFactory: MEP1004TokenMock__factory;
    let owner: SignerWithAddress;
    let tokenOwner: SignerWithAddress;
    let addrs: SignerWithAddress[];
    beforeEach(async function () {
        [owner, tokenOwner, ...addrs] = await ethers.getSigners();
        ({ MEP1004Token, NameWrapperMock } = await setupTest());
        MEP1004TokenMockFactory =
            await ethers.getContractFactory<MEP1004TokenMock__factory>(
                "MEP1004TokenMock"
            );
    });

    const testDotMXCTokenId = BigNumber.from(
        "68949889097187516169332801510365581835791041465326974816460712402969489861206"
    );

    const testSNCode = "testcode";
    const testSNCodeTokenId = BigNumber.from(
        `${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testSNCode))}`
    );

    describe("Init", async function () {
        it("cannot init again", async function () {
            await expect(
                MEP1004Token.initialize(
                    "MEP1004Token",
                    "MEP1004",
                    owner.address
                )
            ).to.be.revertedWith(
                "Initializable: contract is already initialized"
            );
        });
    });

    describe("Minting", async function () {
        it("should mint", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
        });

        it("cannot mint by invalid sncode", async function () {
            await expect(MEP1004Token.mint(owner.address, "")).to.be.reverted;
        });

        it("cannot mint already minted token", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await expect(
                MEP1004Token.mint(owner.address, testSNCode)
            ).to.be.revertedWithCustomError(
                MEP1004Token,
                "ERC721TokenAlreadyMinted"
            );
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should return balance", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.balanceOf(owner.address)).to.equal(
                1
            );
        });

        it("should mint token event", async function () {
            await expect(MEP1004Token.mint(owner.address, testSNCode))
                .to.emit(MEP1004Token, "Transfer")
                .withArgs(
                    "0x0000000000000000000000000000000000000000",
                    owner.address,
                    testSNCodeTokenId
                );
        });

        it("should set name event", async function () {
            await MEP1004Token.mint(owner.address, testSNCode);
            await expect(
                MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            )
                .to.emit(MEP1004Token, "MEP1004TokenUpdateName")
                .withArgs(testSNCodeTokenId, "test.mxc");
        });
        it("should setting name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
            await expect(
                await MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("test.mxc");
        });

        it("should reset name", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
            await expect(
                await MEP1004Token.setName(testSNCodeTokenId, testDotMXCTokenId)
            ).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("test.mxc");
            await expect(await MEP1004Token.resetName(testSNCodeTokenId)).to.ok;
            await expect(
                await MEP1004Token.tokenNames(testSNCodeTokenId)
            ).to.equal("");
        });

        it("should get uri", async function () {
            await MEP1004Token.setBaseURI("https://wannsee-test.mxc.com/");
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(
                await MEP1004Token.tokenURI(testSNCodeTokenId)
            ).to.equal(
                `https://wannsee-test.mxc.com/${testSNCodeTokenId.toString()}?name=`
            );
        });

        it("should return supply", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.totalSupply()).to.equal(1);
        });
    });

    describe("Contract Upgrade", async function () {
        it("should revert without upgrade", async function () {
            MEP1004TokenMock = await MEP1004TokenMockFactory.attach(
                MEP1004Token.address
            );
            await expect(
                MEP1004TokenMock.additionalFunction()
            ).to.be.revertedWithoutReason();
        });

        it("should update after upgrade", async function () {
            await expect(await MEP1004Token.mint(owner.address, testSNCode)).to
                .ok;
            await expect(await MEP1004Token.totalSupply()).to.equal(1);

            const newImple = await MEP1004TokenMockFactory.deploy();
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1004Token.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );

            await expect(await MEP1004Token.upgradeTo(newImple.address)).to.be
                .ok;
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(owner.address);
            await expect(await MEP1004TokenMock.totalSupply()).to.equal(1);
            await expect(await MEP1004TokenMock.name()).to.equal(
                "MEP1004Token V2"
            );
            await expect(await MEP1004TokenMock.additionalFunction()).to.equal(
                1
            );
        });

        it("should right admin slot after transferOwnership", async function () {
            const newImple = await MEP1004TokenMockFactory.deploy();

            await expect(await MEP1004Token.upgradeTo(newImple.address)).to.be
                .ok;
            await MEP1004Token.transferOwnership(addrs[1].address);
            const ownerStorage = await ethers.provider.getStorageAt(
                MEP1004Token.address,
                "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
            );
            const currentOwner = getAddress(`0x${ownerStorage.substr(-40)}`);
            await expect(currentOwner).to.equal(addrs[1].address);
        });

        it("should revert upgrade after transferOwnership", async function () {
            await MEP1004Token.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1004TokenMockFactory.deploy();
            await expect(
                MEP1004Token.upgradeTo(newImple2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should upgrade after transferOwnership", async function () {
            await MEP1004Token.transferOwnership(addrs[1].address);
            const newImple2 = await MEP1004TokenMockFactory.deploy();
            await expect(
                await MEP1004Token.connect(addrs[1]).upgradeTo(
                    newImple2.address
                )
            ).to.be.ok;
        });
    });

    describe("Interface support", async function () {
        it("can support IERC721", async function () {
            expect(await MEP1004Token.supportsInterface("0x80ac58cd")).to.equal(
                true
            );
        });

        it("cannot support other interfaceId", async function () {
            expect(await MEP1004Token.supportsInterface("0xffffffff")).to.equal(
                false
            );
        });
    });
});
