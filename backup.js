//issue
require("dotenv").config();
const { ethers } = require("hardhat");
const CryptoJS = require("crypto-js");
const eccrypto = require("eccrypto");
const { uploadToIPFS } = require("../../backend/ipfs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function main() {
    console.log("🚀 Starting certificate issuance process...");

    // Get signers
    const [owner, institution] = await ethers.getSigners();
    console.log("✅ Institution Address:", institution.address);

    // Connect to deployed smart contract
    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);
    
    // Authorize institution
    await certificateAuthority.setInstitutionAuthorization(institution.address, true);
    console.log("✅ Institution authorized successfully.");

    // Generate ECC key pair for institution
    const institutionPrivateKey = eccrypto.generatePrivate();
    const institutionPublicKey = eccrypto.getPublic(institutionPrivateKey);
    console.log("🔑 Institution Private Key:", institutionPrivateKey.toString("hex"));
    console.log("🔑 Institution Public Key:", institutionPublicKey.toString("hex"));

    // Create certificate document
    const certificateDocument = {
        recipient: { name: "Alice Smith", studentId: "AS12345" },
        course: { title: "Advanced Blockchain Concepts", courseCode: "BC301" },
        institution: { name: "Example University", institutionId: "EU-2024-001" },
        details: { issueDate: "2024-01-26", expiryDate: "2025-01-26", certificateId: "EX-BC-2024-001" },
        sensitiveData: { grade: "Excellent", transcript: "ipfsHashToTranscript...", notes: "Exceptional performance" }
    };
    console.log("📄 Certificate Document (Original):", JSON.stringify(certificateDocument, null, 2));

    // Compute SHA-256 hash of the certificate document
    const sha256Hash = crypto.createHash("sha256").update(JSON.stringify(certificateDocument)).digest();
    console.log("🔍 SHA-256 Hash:", sha256Hash.toString("hex"));

    // AES Encryption
    const aesKey = crypto.randomBytes(16);
    console.log("🔐 AES Key (Generated - INSECURE DEMO ONLY):", aesKey.toString("hex"));

    const encryptedCertificateDocument = CryptoJS.AES.encrypt(JSON.stringify(certificateDocument), aesKey.toString("hex")).toString();
    console.log("🔏 Encrypted Certificate Document:", encryptedCertificateDocument);

    // Save encrypted document temporarily for IPFS upload
    const tempFilePath = path.join(__dirname, "temp-certificate-encrypted.json");
    
    fs.writeFileSync(tempFilePath, JSON.stringify({ "encryptedData": encryptedCertificateDocument }));
    
    // Upload to IPFS
    console.log("🚀 Uploading encrypted certificate to IPFS...");
    const ipfsHash = await uploadToIPFS(tempFilePath);
    if (!ipfsHash) {
        console.error("❌ IPFS Upload Failed.");
        return;
    }
    console.log("✅ IPFS Upload Successful! CID:", ipfsHash);

    // Digital Signature
    const digitalSignature = await eccrypto.sign(institutionPrivateKey, sha256Hash);
    console.log("✍️ Digital Signature:", digitalSignature.toString("hex"));

    // Generate ECC key pair for student
    const studentPrivateKey = eccrypto.generatePrivate();
    const studentPublicKey = eccrypto.getPublic(studentPrivateKey);
    
    console.log("🧑‍🎓 Generated Student Private Key:", studentPrivateKey.toString("hex"));
    console.log("🧑‍🎓 Generated Student Public Key:", studentPublicKey.toString("hex"));

    // Encrypt AES Key using Student's Public Key
    const encryptedAesKey = await eccrypto.encrypt(studentPublicKey, aesKey);
    const encodedAesKey = Buffer.concat([
        encryptedAesKey.iv,
        encryptedAesKey.mac,
        encryptedAesKey.ephemPublicKey,
        encryptedAesKey.ciphertext
    ]).toString("base64");
    
    console.log("🔐 Encrypted & Encoded AES Key:", encodedAesKey);

    // Issue certificate on blockchain
    console.log("📜 Issuing certificate on blockchain...");
    try {
        const issueTx = await certificateAuthority.connect(institution).issueCertificate(
            78901, // Student ID
            67890, // Institution ID
            ipfsHash,
            sha256Hash.toString("hex"),
            digitalSignature.toString("hex"),
            encodedAesKey
        );
        await issueTx.wait();

        console.log("✅ Certificate Issued Successfully!");
        console.log("🔗 Blockchain Tx Hash:", issueTx.hash);
        console.log("📄 Stored IPFS Hash:", ipfsHash);
        console.log("🔍 Stored SHA-256 Hash:", sha256Hash.toString("hex"));
        console.log("✍️ Stored Digital Signature:", digitalSignature.toString("hex"));
        console.log("🔏 Stored Encrypted Certificate (First 100 chars):", encryptedCertificateDocument.substring(0, 100) + "...");
        console.log("🔐 Stored Encoded AES Key (First 100 chars):", encodedAesKey);
    } catch (error) {
        console.error("❌ Error issuing certificate:", error);
    }
}

main().then(() => process.exit(0)).catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
});

//retrieve
require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const eccrypto = require("eccrypto");

async function main() {
    const certificateId = 1; // Change this if needed
    console.log("\n🔍 Fetching Certificate Details...");
    console.log(`📜 Fetching details for Certificate ID: ${certificateId}...\n`);

    const [owner] = await ethers.getSigners();
    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);

    try {
        const cert = await certificateAuthority.getCertificateDetails(certificateId);

        console.log("✅ Certificate Details Retrieved Successfully:");
        console.log("--------------------------------------------");
        console.log(`🎓 Student ID: ${cert[0]}`);
        console.log(`🏛 Institution ID: ${cert[1]}`);
        console.log(`📄 IPFS Hash: ${cert[2]}`);
        console.log(`🔍 SHA-256 Hash: ${cert[3]}`);
        console.log(`✍️ Digital Signature: ${cert[4].substring(0, 60)}...`);
        console.log(`🔐 Encrypted AES Key (First 100 chars): ${cert[5].substring(0, 100)}...`);
        console.log(`⏳ Issue Timestamp: ${new Date(Number(cert[6]) * 1000).toLocaleString()}`);
        console.log("--------------------------------------------\n");

        // Fetch encrypted certificate document from IPFS
        console.log("🔄 Retrieving encrypted certificate from IPFS...");
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cert[2]}`;
        
        const response = await axios.get(ipfsUrl);
        console.log("🔍 Raw IPFS Response:", response.data);
        const encryptedCertificate = response.data.encryptedData; 
        console.log("✅ Encrypted Certificate Document retrieved.\n");

        // Parse encrypted AES key
        console.log("🔐 Encrypted AES Key (Raw):", cert[5]);
        
        // Decode the encrypted AES key from base64
        const decodedBuffer = Buffer.from(cert[5], 'base64');

        // Structure the decrypted AES key
        const decryptedAesKey = {
            iv: decodedBuffer.slice(0, 16),
            mac: decodedBuffer.slice(16, 48),
            ephemPublicKey: decodedBuffer.slice(48, 113),
            ciphertext: decodedBuffer.slice(113)
        };

        console.log("Decrypted AES Key Structure:", decryptedAesKey);

        // Retrieve Student's ECC Private Key (For Testing)
        console.log("🔓 Decrypting AES Key...");
        const studentPrivateKey = Buffer.from("c05a4d51d8f354dba9a45278741157418ce227c7da827ae55df541b9372dcbb1", "hex");
        const decryptedAesKeyBuffer = await eccrypto.decrypt(studentPrivateKey, decryptedAesKey);

        const aesKey = decryptedAesKeyBuffer.toString("hex");
        console.log(`✅ AES Key Decrypted: ${aesKey}`);

        // Decrypt Certificate Document using AES (with IV)
        console.log("🔓 Decrypting certificate document...");
        const decryptedCertificateBytes = CryptoJS.AES.decrypt(
            encryptedCertificate, aesKey.toString("hex") // Use correct IV
        );

        const decryptedCertificate = decryptedCertificateBytes.toString(CryptoJS.enc.Utf8);

        console.log("\n✅ Original Certificate Document:");
        console.log("--------------------------------------------");
        console.log(JSON.stringify(JSON.parse(decryptedCertificate), null, 2));
        console.log("--------------------------------------------\n");

    } catch (error) {
        console.error("❌ Error fetching certificate:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//verify
require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const eccrypto = require("eccrypto");

async function main() {
    const certificateId = 1; // Change as needed
    console.log("\n🔍 Verifying Certificate...");
    console.log(`📜 Verifying Certificate ID: ${certificateId}...\n`);

    const [owner] = await ethers.getSigners();
    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);

    try {
        const cert = await certificateAuthority.getCertificateDetails(certificateId);

        console.log("✅ Certificate Details Retrieved:");
        console.log("--------------------------------------------");
        console.log(`🎓 Student ID: ${cert[0]}`);
        console.log(`🏛 Institution ID: ${cert[1]}`);
        console.log(`📄 IPFS Hash: ${cert[2]}`);
        console.log(`🔍 On-Chain SHA-256 Hash: ${cert[3]}`);
        console.log(`✍️ Digital Signature: ${cert[4].substring(0, 60)}...`);
        console.log(`🔐 Encrypted AES Key: ${cert[5].substring(0, 100)}...`);
        console.log(`⏳ Issued: ${new Date(Number(cert[6]) * 1000).toLocaleString()}`);
        console.log("--------------------------------------------\n");

        // Fetch encrypted certificate from IPFS
        console.log("🔄 Retrieving encrypted certificate from IPFS...");
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cert[2]}`;
        const response = await axios.get(ipfsUrl);
        const encryptedCertificate = response.data.encryptedData;
        console.log("✅ Encrypted Certificate Retrieved.\n");

        // Parse encrypted AES key
        console.log("🔐 Parsing Encrypted AES Key...");
        const decodedBuffer = Buffer.from(cert[5], 'base64');

        const decryptedAesKey = {
            iv: decodedBuffer.slice(0, 16),
            mac: decodedBuffer.slice(16, 48),
            ephemPublicKey: decodedBuffer.slice(48, 113),
            ciphertext: decodedBuffer.slice(113)
        };

        console.log("Decrypted AES Key Structure:", decryptedAesKey);

        // Decrypt AES key using ECC private key
        console.log("🔓 Decrypting AES Key...");
        const studentPrivateKey = Buffer.from("e60271c9f3b8521c0de6bcb526ff5e9d3f81c7cdd4a8e688a252e290e33f6e03", "hex");
        const decryptedAesKeyBuffer = await eccrypto.decrypt(studentPrivateKey, decryptedAesKey);

        const aesKey = decryptedAesKeyBuffer.toString("hex");
        console.log(`✅ AES Key Decrypted: ${aesKey}`);

        // Decrypt the certificate document
        console.log("🔓 Decrypting Certificate Document...");
        const decryptedCertificateBytes = CryptoJS.AES.decrypt(
            encryptedCertificate, aesKey
        );
        const decryptedCertificate = decryptedCertificateBytes.toString(CryptoJS.enc.Utf8);

        console.log("\n✅ Decrypted Certificate Document:");
        console.log("--------------------------------------------");
        console.log(JSON.stringify(JSON.parse(decryptedCertificate), null, 2));
        console.log("--------------------------------------------\n");

        // Compute SHA-256 hash of the decrypted certificate
        console.log("🔍 Computing SHA-256 Hash...");
        const calculatedHash = crypto.createHash("sha256").update(decryptedCertificate).digest("hex");
        console.log(`✅ Computed Hash: ${calculatedHash}`);

        // Verify if the hash matches on-chain data
        if (calculatedHash === cert[3]) {
            console.log("✅ Hash Match: Certificate Integrity Verified!");
        } else {
            console.error("❌ Hash Mismatch: Data might be tampered!");
            return;
        }

        // Verify the digital signature using ECC
        console.log("🔍 Verifying Digital Signature...");
        const institutionPublicKey = Buffer.from("04dd21d3f3a662e6508571335e6fa902c71d3f6c99b9f7beb75734d4d039ab81515a610236f83b9c8b94738669d417a0a6837ce4baed7aef9668aee18cbd826034", "hex");
        const signature = Buffer.from(cert[4], "hex");

        try {
            await eccrypto.verify(institutionPublicKey, Buffer.from(calculatedHash, "hex"), signature);
            console.log("✅ Digital Signature Verified: Certificate is Authentic!\n");
        } catch (err) {
            console.error("❌ Signature Verification Failed: Certificate might be forged!");
            return;
        }

    } catch (error) {
        console.error("❌ Error verifying certificate:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
