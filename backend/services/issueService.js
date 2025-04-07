const { ethers } = require("hardhat");
const crypto = require("crypto");
const { uploadToIPFS } = require("../ipfs");
const { generateECCKeyPair, signMessage } = require("../signature");
const { encryptCertificate } = require("../encryption");

const issueCertificate = async (formData) => {
    try {
        const { studentId, name, degreeTitle, branch, bdate, sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8, institutionAddress } = formData;

        const [owner, institution] = await ethers.getSigners();

        const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
        const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);

        // Authorize the institution (ensure it's authorized before issuing)
        await certificateAuthority.setInstitutionAuthorization(institution.address, true);

        // Generate ECC keys
        const { privateKey: institutionPrivateKey, publicKey: institutionPublicKey } = generateECCKeyPair();
        const { privateKey: studentPrivateKey, publicKey: studentPublicKey } = generateECCKeyPair();

        // Create certificate document
        const certificateDocument = {
            recipient: { name, studentId },
            degree: { title: degreeTitle, branch, bdate },
            grades: { sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8 }
        };

        // Compute SHA-256 hash
        const sha256Hash = crypto.createHash("sha256").update(JSON.stringify(certificateDocument)).digest();

        // Encrypt certificate with AES and ECC
        const { encryptedCertificate, encodedAESKey } = await encryptCertificate(certificateDocument, studentPublicKey);

        // Upload encrypted certificate to IPFS
        const ipfsHash = await uploadToIPFS(JSON.stringify(encryptedCertificate));

        // Sign the certificate
        const digitalSignature = await signMessage(institutionPrivateKey, certificateDocument);

        // Blockchain transaction
        const tx = await certificateAuthority.connect(institution).issueCertificate(
            studentId,
            1, // Hardcoded institution ID
            ipfsHash,
            sha256Hash.toString("hex"),
            digitalSignature.toString("hex"),
            encodedAESKey
        );

        await tx.wait();

        return {
            success: true,
            txHash: tx.hash,
            ipfsHash: ipfsHash
        };
    } catch (error) {
        console.error("Error issuing certificate:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { issueCertificate };
