require("dotenv").config();
const { ethers } = require("hardhat");

// Connect to the deployed smart contract
const connectToContract = async () => {
    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    return CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);
};

// Issue a certificate on the blockchain
const issueCertificate = async (institution, studentId, institutionId, ipfsHash, sha256Hash, digitalSignature, encodedAesKey) => {
    try {
        const certificateAuthority = await connectToContract();
        const issueTx = await certificateAuthority.connect(institution).issueCertificate(
            studentId,
            institutionId,
            ipfsHash,
            sha256Hash,
            digitalSignature,
            encodedAesKey
        );
        await issueTx.wait();
        console.log("✅ Certificate Issued Successfully!");
        return issueTx.hash;
    } catch (error) {
        console.error("❌ Error issuing certificate:", error);
        return null;
    }
};

// Retrieve certificate details
const getCertificateDetails = async (certificateId) => {
    try {
        const certificateAuthority = await connectToContract();
        return await certificateAuthority.getCertificateDetails(certificateId);
    } catch (error) {
        console.error("❌ Error fetching certificate:", error);
        return null;
    }
};

// Verify certificate integrity
const verifyCertificate = async (certificateId, calculatedHash, institutionPublicKey, signature) => {
    try {
        const cert = await getCertificateDetails(certificateId);
        if (!cert) return false;

        // Check hash match
        if (calculatedHash !== cert[3]) {
            console.error("❌ Hash Mismatch: Data might be tampered!");
            return false;
        }

        // Verify digital signature
        await eccrypto.verify(institutionPublicKey, Buffer.from(calculatedHash, "hex"), Buffer.from(cert[4], "hex"));
        console.log("✅ Digital Signature Verified: Certificate is Authentic!");
        return true;
    } catch (error) {
        console.error("❌ Verification Failed:", error);
        return false;
    }
};

module.exports = { issueCertificate, getCertificateDetails, verifyCertificate };
