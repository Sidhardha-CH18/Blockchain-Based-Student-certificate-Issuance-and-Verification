require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require("axios");
const { decryptCertificate } = require("../../backend/encryption");

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
        console.log("✅ Encrypted Certificate Document retrieved.\n");

        // Retrieve Student's ECC Private Key (For Testing)
        const studentPrivateKey = Buffer.from("00dfff50277be0d84554215df62d866dff2ce0367a41c39bb29cf97a5086c830", "hex");
        
        // Decrypt certificate
        console.log("🔓 Decrypting certificate...");
        const decryptedCertificate = await decryptCertificate(response.data.encryptedData, cert[5], studentPrivateKey);

        console.log("\n✅ Original Certificate Document:");
        console.log("--------------------------------------------");
        console.log(JSON.stringify(decryptedCertificate, null, 2));
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
