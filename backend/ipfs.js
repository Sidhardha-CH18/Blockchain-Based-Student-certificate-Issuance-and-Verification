    require("dotenv").config();
    const fs = require("fs");
    const path = require("path");
    const pinataSDK = require("@pinata/sdk");

    // Initialize Pinata
    const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

    // Upload certificate to IPFS via Pinata SDK
    async function uploadToIPFS(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`❌ File not found: ${filePath}`);
            }

            console.log("🚀 Uploading certificate to IPFS via Pinata SDK...");

            const readableStream = fs.createReadStream(filePath);

            const options = {
                pinataMetadata: { name: "certificate" },
                pinataOptions: { cidVersion: 1 },
            };

            const result = await pinata.pinFileToIPFS(readableStream, options);
            console.log("✅ IPFS Upload Successful! CID:", result.IpfsHash);
            return result.IpfsHash;
        } catch (error) {
            console.error("❌ Error uploading to IPFS:", error.message);
            return null;
        }
    }

    // Export function
    module.exports = { uploadToIPFS };
