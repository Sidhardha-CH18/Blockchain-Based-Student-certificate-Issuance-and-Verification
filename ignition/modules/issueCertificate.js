require("dotenv").config();
const { ethers } = require("hardhat");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { uploadToIPFS } = require("../../backend/ipfs");
const { generateECCKeyPair, signMessage } = require("../../backend/signature");
const { encryptCertificate } = require("../../backend/encryption");

async function main() {
    console.log("🚀 Starting certificate issuance process...");

    // Get signers
    const [owner, institution] = await ethers.getSigners();

    // Connect to deployed smart contract
    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);

    // Authorize institution
    await certificateAuthority.setInstitutionAuthorization(institution.address, true);

    // Generate key pairs
    const { privateKey: institutionPrivateKey, publicKey: institutionPublicKey } = generateECCKeyPair();
    console.log("🔑 Institution Private Key:",institutionPrivateKey.toString("hex"));
    console.log("🔓 Institution Public Key:", institutionPublicKey.toString("hex"));
    
    const { privateKey: studentPrivateKey, publicKey: studentPublicKey } = generateECCKeyPair();
    console.log("🧑‍🎓 Student Private Key:",studentPrivateKey.toString("hex"));
    console.log("📢 Student Public Key:", studentPublicKey.toString("hex"));
    

    // Create certificate document
    const certificateDocument = {
        recipient: { name: "Alice Smith", studentId: "AS12345" },
        course: { title: "Advanced Blockchain Concepts", courseCode: "BC301" },
        institution: { name: "Example University", institutionId: "EU-2024-001" },
        details: { issueDate: "2024-01-26", expiryDate: "2025-01-26", certificateId: "EX-BC-2024-001" },
        sensitiveData: { grade: "Excellent", transcript: "ipfsHashToTranscript...", notes: "Exceptional performance" }
    };
    console.log("Certificate:",certificateDocument);
    // Compute SHA-256 hash
    const sha256Hash = crypto.createHash("sha256").update(JSON.stringify(certificateDocument)).digest();
    console.log("SHA-256 Hash:",sha256Hash);
    // AES Encryption
    const { encryptedCertificate, encodedAESKey } = await encryptCertificate(certificateDocument, studentPublicKey);

    // Save encrypted document temporarily
    const tempFilePath = path.join(__dirname, "temp-certificate-encrypted.json");
    fs.writeFileSync(tempFilePath, JSON.stringify({ "encryptedData": encryptedCertificate }));

    // Upload to IPFS
    const ipfsHash = await uploadToIPFS(tempFilePath);

    // Digital Signature
    const digitalSignature = await signMessage(institutionPrivateKey, certificateDocument);

    // Issue certificate on blockchain
    try {
        const issueTx = await certificateAuthority.connect(institution).issueCertificate(
            78901, // Student ID
            67890, // Institution ID
            ipfsHash,
            sha256Hash.toString("hex"),
            digitalSignature.toString("hex"),
            encodedAESKey
        );
        await issueTx.wait();

        console.log("✅ Certificate Issued Successfully!");
        console.log("🔗 Tx Hash:", issueTx.hash);
        console.log("📄 IPFS Hash:", ipfsHash);
    } catch (error) {
        console.error("❌ Error issuing certificate:", error);
    }
}

main().then(() => process.exit(0)).catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
});
