const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateAuthority", function () {
    let CertificateAuthority;
    let certificateAuthority;
    let owner;
    let institution1;
    let institution2;
    let unauthorizedAccount;

    beforeEach(async function () {
        [owner, institution1, institution2, unauthorizedAccount] = await ethers.getSigners();
        CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
        certificateAuthority = await CertificateAuthority.deploy();
        await certificateAuthority.waitForDeployment();
    });

    it("Should deploy the CertificateAuthority contract", async function () {
        expect(certificateAuthority.address).to.not.equal(0);
    });

    describe("Institution Authorization", function () {
        it("Only contract owner should be able to authorize institutions", async function () {
            await expect(
                certificateAuthority.connect(institution1).setInstitutionAuthorization(institution2.address, true)
            ).to.be.revertedWith("Only owner can call this function.");

            await certificateAuthority.setInstitutionAuthorization(institution1.address, true);
            expect(await certificateAuthority.authorizedInstitutions(institution1.address)).to.be.true;
        });

        it("Only authorized institutions should be able to issue certificates", async function () {
            // Authorize institution1
            await certificateAuthority.setInstitutionAuthorization(institution1.address, true);

            const issueCertificateTx = certificateAuthority.connect(institution1).issueCertificate(
                12345, 67890, "QmValidIPFSHash", "validSHA256Hash", "validSignature", "encryptedMetadata", "encryptedAesKey"
            );
            await expect(issueCertificateTx).to.not.be.reverted; // Authorized institution should be able to issue

            // institution2 is not authorized
            await expect(
                certificateAuthority.connect(institution2).issueCertificate(
                    54321, 98765, "QmInvalidIPFSHash", "invalidSHA256Hash", "invalidSignature", "otherEncryptedMetadata", "otherEncryptedAesKey"
                )
            ).to.be.revertedWith("Only authorized institutions can call this function.");

            // Unauthorized account should also not be able to issue
            await expect(
                certificateAuthority.connect(unauthorizedAccount).issueCertificate(
                    99999, 11111, "QmAnotherInvalidHash", "anotherInvalidHash", "anotherInvalidSig", "yetAnotherEncryptedMeta", "yetAnotherEncryptedAesKey"
                )
            ).to.be.revertedWith("Only authorized institutions can call this function.");
        });

        it("Should emit InstitutionAuthorized and InstitutionDeauthorized events", async function () {
            await expect(certificateAuthority.setInstitutionAuthorization(institution1.address, true))
                .to.emit(certificateAuthority, "InstitutionAuthorized")
                .withArgs(institution1.address, owner.address);

            await expect(certificateAuthority.setInstitutionAuthorization(institution1.address, false))
                .to.emit(certificateAuthority, "InstitutionDeauthorized")
                .withArgs(institution1.address, owner.address);
        });

        it("Should emit CertificateIssued event when a certificate is issued", async function () {
            await certificateAuthority.setInstitutionAuthorization(institution1.address, true); // Authorize institution first

            const studentId = 12345;
            const institutionId = 67890;
            const ipfsHash = "QmEventTestIPFSHash";
            const sha256Hash = "eventTestSHA256Hash";
            const signature = "eventTestSignature";
            const encryptedMetadata = "eventTestEncryptedMetadata";
            const encryptedAesKeyForMetadata = "eventTestAesKey";

            await expect(
                certificateAuthority.connect(institution1).issueCertificate(
                    studentId, institutionId, ipfsHash, sha256Hash, signature, encryptedMetadata, encryptedAesKeyForMetadata
                )
            )
            .to.emit(certificateAuthority, "CertificateIssued")
            .withArgs(1, studentId, institutionId, institution1.address); // Certificate ID will be 1 because it's the first issued
        });
    });
});