const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const fs = require('fs');
const path = require('path');
const eccrypto = require('eccrypto');

const { encryptCertificate } = require('./encryption'); // AES + ECC encryption
const { uploadToIPFS } = require('./ipfs');             // Pinata uploader

const accounts = JSON.parse(process.env.ACCOUNTS);

// Certificate data to encrypt
const certificatePayload = {
  studentId: "US256090",
  name: "John Doe",
  degreeTitle: "B. Tech",
  fatherName: "James Cooper",
  branch: "Information Technology",
  birthDate: "2001-01-01",
  sgpa: [9, 9, 9, 9, 9, 9, 9, 9],
  cgpa: 9.5,
  award: "Gold Medal"
};

const institutionAddress = "0xa7173add81a7a0e6f8f06a758e36bd5540575808";

async function runFailScript() {
  try {
    console.log("🔐 Encrypting failed certificate...");

    const privateKey = accounts[institutionAddress];
    const publicKey='0x04ad58c985204981707769424abbae41ce4dc2c74d2461b1961ccf5fd04be99760dd18184bb0c4cc4d0b9bea07b875e8313d843c48ef6603257319d0c92e55acf2'
    if (!privateKey) {
      throw new Error("Institution address not found in accounts");
    }

    const certificateData = JSON.stringify(certificatePayload);
    const privateKeyBuffer = Buffer.from(publicKey.slice(2), 'hex');

    const { encryptedCertificate, encodedAESKey } = await encryptCertificate(
      certificateData,
      privateKeyBuffer
    );

    const tempPath = path.join(__dirname, 'temp-failed-cert.json');
    fs.writeFileSync(tempPath, JSON.stringify({ encryptedData: encryptedCertificate }));

    console.log("📦 Uploading to IPFS...");
    const ipfsHash = await uploadToIPFS(tempPath);
    fs.unlinkSync(tempPath);

    console.log("✅ Upload complete!");
    console.log("IPFS Hash:", ipfsHash);
    console.log("Encrypted AES Key:", encodedAESKey);

  } catch (err) {
    console.error("❌ Failed to execute script:", err.message);
  }
}

runFailScript();
