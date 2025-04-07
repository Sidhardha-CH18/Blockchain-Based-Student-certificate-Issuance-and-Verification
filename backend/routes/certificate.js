const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const Certificate = require("../models/Certificate"); // Mongoose model

router.post("/issue-certificate", async (req, res) => {
    try {
        const { studentId, institutionId, certificateData } = req.body;

        if (!studentId || !institutionId || !certificateData) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log("📜 Initiating certificate issuance for:", studentId);

        // Run Hardhat script
        exec(`npx hardhat run scripts/issueCertificate.js --network localhost`, async (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Hardhat Script Error:", stderr);
                return res.status(500).json({ error: "Blockchain issuance failed" });
            }

            console.log("✅ Blockchain Response:", stdout);

            // Extract relevant details (mock example, adjust based on actual output)
            const transactionHash = stdout.match(/Blockchain Tx Hash: (.*)/)?.[1];
            const ipfsHash = stdout.match(/Stored IPFS Hash: (.*)/)?.[1];

            if (!transactionHash || !ipfsHash) {
                return res.status(500).json({ error: "Failed to retrieve blockchain details" });
            }

            // Store in MongoDB
            const newCertificate = new Certificate({
                studentId,
                institutionId,
                ipfsHash,
                transactionHash,
                issueTimestamp: new Date(),
            });

            await newCertificate.save();

            res.json({ success: true, message: "Certificate issued!", transactionHash });
        });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
