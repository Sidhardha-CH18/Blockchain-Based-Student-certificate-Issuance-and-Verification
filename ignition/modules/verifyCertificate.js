require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require("axios");
const crypto = require("crypto");
const eccrypto = require("eccrypto");
const { decryptCertificate } = require("../../backend/encryption");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function verifyCertificate(certificateId, studentPrivateKey, institutionPublicKey) {
    console.log(`\n🔍 Verifying Certificate ID: ${certificateId}...`);

    const CertificateAuthority = await ethers.getContractFactory("CertificateAuthority");
    const certificateAuthority = await CertificateAuthority.attach(process.env.CONTRACT_ADDRESS);

    try {
        const cert = await certificateAuthority.getCertificateDetails(certificateId);

        // Fetch and decrypt certificate
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cert[2]}`;
        const response = await axios.get(ipfsUrl);
        const encryptedCertificate = response.data.encryptedData;

        const decryptedCertificate = await decryptCertificate(
            encryptedCertificate,
            cert[5],
            Buffer.from(studentPrivateKey, "hex")
        );

        // Compute SHA-256 hash
        const calculatedHash = crypto.createHash("sha256").update(JSON.stringify(decryptedCertificate)).digest("hex");

        // Handle integrity check
        if (calculatedHash === cert[3]) {
            console.log("✅ Certificate Integrity Verified!");
        } else {
            console.error("❌ Hash Mismatch: Data might be tampered!");
            rl.question("Would you like to try again? (yes/no): ", (answer) => {
                if (answer.toLowerCase() === "yes") {
                    startVerification(); // Retry the verification process
                } else {
                    console.log("Exiting...");
                    rl.close();
                }
            });
            return; // Exit the function if integrity check fails
        }

        // Verify digital signature
        try {
            await eccrypto.verify(
                Buffer.from(institutionPublicKey, "hex"),
                Buffer.from(calculatedHash, "hex"),
                Buffer.from(cert[4], "hex")
            );
            console.log("✅ Digital Signature Verified: Certificate is Authentic!");
        } catch (err) {
            console.error("❌ Signature Verification Failed: Certificate might be forged!");
            rl.question("Would you like to try again? (yes/no): ", (answer) => {
                if (answer.toLowerCase() === "yes") {
                    startVerification(); // Retry the verification process
                } else {
                    console.log("Exiting...");
                    rl.close();
                }
            });
        }

    } catch (error) {
        console.error("❌ Error verifying certificate:", error);
    }
}

// Function to handle user input and start verification
function startVerification() {
    rl.question('Enter Certificate ID: ', (certificateId) => {
        rl.question('Enter Student Private Key (hex): ', (studentPrivateKey) => {
            rl.question('Enter Institution Public Key (hex): ', (institutionPublicKey) => {
                verifyCertificate(certificateId, studentPrivateKey, institutionPublicKey);
                rl.close();  // Close the readline interface after input is complete
            });
        });
    });
}

// Start the verification process
startVerification();
