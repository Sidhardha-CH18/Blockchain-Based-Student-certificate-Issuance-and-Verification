const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
const eccrypto = require("eccrypto");
const { Web3 } = require('web3');
const User = require("./models/User");
const { issueCertificate } = require("./services/issueService");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { uploadToIPFS } = require("./ipfs");
const { generateECCKeyPair, signMessage,verifySignature } = require("./signature");
const { encryptCertificate } = require("./encryption");
const {decryptCertificate}=require("./encryption")
const Certificate=require("./models/Certificate");
const SharedCertificate = require("./models/SharedCertificate");
const app = express();
app.use(cors());
app.use(express.json());
const axios= require("axios");
const { encode } = require('punycode');

const web3 = new Web3('http://localhost:8545'); 
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contractABI = require("../artifacts/contracts/CertificateAuthority.sol/CertificateAuthority.json").abi;
const certificateContract = new web3.eth.Contract(contractABI, contractAddress);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/MyDatabase")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Load accounts from .env
const accounts = JSON.parse(process.env.ACCOUNTS);
// console.log(accounts)
// Function to get private key
function getPrivateKey(accountAddress) {

    // console.log("Accounts :",accounts);
    return accounts[accountAddress] || null;
}

// Function to compute public key using eccrypto
async function getPublicKey(privateKey) {
    
    const privateKeyBuffer = Buffer.from(privateKey.slice(2), "hex"); // Convert hex to buffer
    const publicKeyBuffer = await eccrypto.getPublic(privateKeyBuffer);
    return "0x" + publicKeyBuffer.toString("hex"); // Convert buffer to hex string
}

// Function to generate a unique ID based on role
function generateUniqueId(role) {
    const prefix = role === "institution" ? "UI" 
                  : role === "student" ? "US" 
                  : "UV"; // For verifier
    const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
    return `${prefix}${randomNum}`;
}

const generateUniqueCertificateId = async () => {
  let certificateId;
  let exists = true;

  while (exists) {
      certificateId = "C" + Math.floor(100000 + Math.random() * 900000); // CANDxxxxxx
      exists = await Certificate.exists({ certificateId }); // Check if already exists
  }

  return certificateId;
};

// Signup route
app.post("/signup", async (req, res) => {
    const { address, role, email, name } = req.body;
    if (!address || !role || !email || !name) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(address);
    try {
        let user = await User.findOne({ address });
        if (user) return res.status(400).json({ error: "User already exists" });

        const privateKey = getPrivateKey(address);
        if (!privateKey) {
            return res.status(400).json({ error: "Address not recognized!" });
        }

        const publicKey = await getPublicKey(privateKey);  // Compute public key
        const uniqueId = generateUniqueId(role);  // Generate unique ID

        // Create new user entry
        user = new User({ address, publicKey, role, uniqueId, email, name });
        await user.save();

        res.json({ message: "User registered successfully!", uniqueId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login route
app.post("/login", async (req, res) => {
    const { address } = req.body;
  
    if (!address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
  
    try {
      const user = await User.findOne({ address });
  
      if (!user) {
        return res.status(404).json({ error: "User not found. Please sign up." });
      }
  
      res.json({ message: "Login successful", role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
// Issue Certificate Endpoint
app.post('/api/issue-certificate', async (req, res) => {
    console.log(req.body)
    const { studentId, name, degreeTitle, fname, branch, bdate, sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8, institutionAddress } = req.body;
    const student=await User.findOne({uniqueId: studentId,role: 'student'});
    const institution=await User.findOne({address:institutionAddress,role:"institution"});
    if (!student || !institution) {
      return res.status(400).json({ error: "Invalid student or institution" });
    }
    const dob = `${bdate.year}-${bdate.month}-${bdate.day}`;
    const sgpa = [sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8].map(s => parseFloat(s) || 0);
    const totalSemesters = sgpa.length;
    const cgpa = sgpa.reduce((sum, val) => sum + val, 0) / totalSemesters;
    let award = "Fail";
        if (cgpa >= 9.0) award = "Gold Medal";
        else if (cgpa >= 8.0) award = "Distinction";
        else if (cgpa >= 7.0) award = "First Class";
        else if (cgpa >= 6.0) award = "Second Class";
        else if (cgpa >= 5.0) award = "Pass";
        const certificateDocument = {
          studentId,
          name,
          degreeTitle,
          fatherName: fname,
          branch,
          birthDate: dob,
          sgpa,
          cgpa: parseFloat(cgpa.toFixed(2)),  // Round CGPA to 2 decimal places
          award
      };
      const certificateData = JSON.stringify(certificateDocument);
      const sha256Hash = crypto.createHash("sha256").update(certificateData).digest();
      const { encryptedCertificate, encodedAESKey } = await encryptCertificate(certificateData, Buffer.from(student.publicKey.slice(2), "hex"));
      const tempFilePath = path.join(__dirname, "temp-certificate-encrypted.json");
      fs.writeFileSync(tempFilePath, JSON.stringify({ "encryptedData": encryptedCertificate }));
      const ipfsHash = await uploadToIPFS(tempFilePath);
      const digitalSignature = await signMessage(Buffer.from(getPrivateKey(institutionAddress).slice(2), "hex"), certificateData);
      const certificateId = await generateUniqueCertificateId();
    try {
      // Call the smart contract to issue the certificate
      const result = await certificateContract.methods.issueCertificate(
        certificateId,
        parseInt(studentId.replace(/\D/g, ''), 10),
        parseInt(institution.uniqueId.replace(/\D/g, ''), 10),
        ipfsHash,
        sha256Hash.toString("hex"),
        digitalSignature.toString("hex"),
        encodedAESKey
      ).send({ from: institutionAddress });
      const newCertificate = new Certificate({
        certificateId,
        studentId,
        institutionId: institution.uniqueId,
        ipfsHash,
        transactionHash: result.transactionHash,  // Get transaction hash from blockchain
        issueTimestamp: new Date(),
        status: "Issued"
      });
      await newCertificate.save();
      res.json({ success: true,
        message: "Certificate issued successfully!",
        certificateDetails: newCertificate
      });

    } catch (error) {
      console.error("Error issuing certificate:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/get-certificate', async (req, res) => {
    const { certificateId,studentId } = req.body;
    if (!certificateId) {
        return res.status(400).json({ success: false, message: "Certificate ID is required" });
    }

    try {
        // Call the smart contract
        console.log("certificate Id: ", certificateId)
        const result = await certificateContract.methods.getCertificateDetails(certificateId.toString()).call();

        console.log("result:",result);
        if (!result) throw new Error("Certificate not found on blockchain");

        const certificateDetails = {
            studentId: result[0],
            institutionId: result[1],
            ipfsHash: result[2],
            sha256Hash: result[3],
            signature: result[4],
            encryptedAesKeyForMetadata: result[5],
            issueTimestamp: result[6],
        };
        console.log("certificate Details:",certificateDetails.ipfsHash);
        // Fetch the encrypted data from IPFS
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificateDetails.ipfsHash}`;
        
        const response = await axios.get(ipfsUrl);
        console.log(studentId)

        const student=await User.findOne({uniqueId: studentId,role: 'student'});
        console.log(student)
        
        // Decrypt the certificate metadata using the student's private key
        const decryptedCertificate = await decryptCertificate(response.data.encryptedData, certificateDetails.encryptedAesKeyForMetadata,Buffer.from(getPrivateKey(student.address).slice(2), "hex") );

        res.json({ success: true, certificate: decryptedCertificate,encryptedAesKey: certificateDetails.encryptedAesKeyForMetadata});
    } catch (error) {
        console.error("Error fetching certificate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


  app.post("/api/student-certificates", async (req, res) => {
    const { address } = req.body;
    
    console.log(address)
    if (!address) {
      return res.status(400).json({ error: "Student address is required" });
    }
    try {
        const student=await User.findOne({address: address});
        console.log(student.uniqueId)
        const certificates = await Certificate.find({ studentId:student.uniqueId });
        if (!certificates.length) {
            return res.status(404).json({ error: "No certificates found for this student" });
        }
        console.log(certificates)
        res.json(certificates);
    } catch (error) {
        console.error("Error fetching certificates:", error);
        res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/verifiers", async (req, res) => {
    try {
        const verifiers = await User.find({ role: "verifier" }, "name uniqueId publicKey email address");
        console.log(verifiers)
        res.json({ success: true, verifiers });
    } catch (error) {
        console.error("Error fetching verifiers:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.post("/api/share-certificate", async (req, res) => {
  const { certificateId, StudentId, verifierId, studentAddress, verifierPublicKey,encryptedKey } = req.body;

  try {
    // Find student and verifier users
    const student = await User.findOne({ uniqueId: StudentId, role: "student" });
    const verifier = await User.findById(verifierId);
    if (!student || !verifier) {
      return res.status(404).json({ success: false, message: "Student or Verifier not found" });
    }

    // Fetch certificate from DB
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }
    console.log("share-ccertificate:",certificate)
    // Decrypt AES key using student's private key
    console.log("encrypteKey:",encryptedKey);
    const decodedAESKey = Buffer.from(encryptedKey, "base64");
    const aesStructure = {
      iv: decodedAESKey.slice(0, 16),
      mac: decodedAESKey.slice(16, 48),
      ephemPublicKey: decodedAESKey.slice(48, 113),
      ciphertext: decodedAESKey.slice(113),
    };
    const studentPrivateKey = Buffer.from(getPrivateKey(studentAddress).slice(2), "hex");
    const decryptedAESKey = await eccrypto.decrypt(studentPrivateKey, aesStructure);

    // Encrypt AES key with verifier's public key
    const encryptedForVerifier = await eccrypto.encrypt(Buffer.from(verifierPublicKey.slice(2), "hex"), decryptedAESKey);
    const encodedForVerifier = Buffer.concat([
      encryptedForVerifier.iv,
      encryptedForVerifier.mac,
      encryptedForVerifier.ephemPublicKey,
      encryptedForVerifier.ciphertext
    ]).toString("base64");
    console.log(encryptedForVerifier);

    // Save shared certificate
    const newShared = new SharedCertificate({
      certificateId,
      studentId: student.uniqueId,
      verifierId: verifier.uniqueId,
      encryptedAesKeyForVerifier: encodedForVerifier,
      timestamp: new Date()
    });

    await newShared.save();

    res.json({ success: true, message: "Certificate shared successfully." });

  } catch (error) {
    console.error("Error sharing certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/get-shared-certificates", async (req, res) => {
  const { verifierAddress } = req.body;

  if (!verifierAddress) {
    return res.status(400).json({ success: false, message: "Verifier address required" });
  }

  try {
    // Find all certificates shared with this verifier
    const verifier=await User.findOne({address: verifierAddress,role:'verifier'});
    const sharedCerts = await SharedCertificate.find({ verifierId: verifier.uniqueId});

    // Optionally omit encrypted AES key from the response if you want to
    const result = sharedCerts.map(cert => ({
      certificateId: cert.certificateId,
      studentId: cert.studentId,
      verifierId: cert.verifierId
    }));
    console.log(result)

    return res.status(200).json({ success: true, certificates: result });
  } catch (err) {
    console.error("Error retrieving shared certificates:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/view-shared-certificate", async (req, res) => {
  try {
    const { certificateId, studentId, verifierId, verifierAddress } = req.body;

    const sharedKeyRecord = await SharedCertificate.findOne({certificateId:certificateId,studentId:studentId,verifierId:verifierId});
    console.log(sharedKeyRecord);
    if (!sharedKeyRecord) {
      return res.status(404).json({ success: false, message: "Shared certificate not found." });
    }

    const encodedKey = sharedKeyRecord.encryptedAesKeyForVerifier;

    // 2. Find the certificate record
    const certRecord = await Certificate.findOne({ certificateId, studentId });

    if (!certRecord) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certRecord.ipfsHash}`;    
    const response = await axios.get(ipfsUrl);
    const certificateData= await decryptCertificate(response.data.encryptedData, encodedKey,Buffer.from(getPrivateKey(verifierAddress).slice(2), "hex") );

    console.log(certificateData);
    return res.status(200).json({
      success: true,
      certificateData
    });

  } catch (error) {
    console.error("Error in /view-shared-certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.post('/api/verifyCertificate', async (req, res) => {
  try {
    const { certificateData, verifierAddress, certificateId } = req.body;
    const certRecord = await Certificate.findOne({ certificateId, studentId: certificateData.studentId });
    if (!certRecord) return res.status(404).json({ success: false, message: "Certificate not found." });

    const result = await certificateContract.methods.getCertificateDetails(certificateId.toString()).call();
    const certificateDetails = {
      studentId: `US${result[0]}`,
      institutionId: `UI${result[1]}`,
      ipfsHash: result[2],
      sha256Hash: result[3],
      signature: result[4],
    };

    const computedHash = crypto.createHash("sha256").update(JSON.stringify(certificateData)).digest("hex");
    const hashValid = computedHash === certificateDetails.sha256Hash;

    const institution = await User.findOne({ uniqueId: certificateDetails.institutionId });
    if (!institution || !institution.publicKey) {
      return res.status(404).json({ success: false, message: "Institution public key not found." });
    }

    const publicKeyBuffer = Buffer.from(institution.publicKey.slice(2), "hex");
    const signatureValid = await verifySignature(publicKeyBuffer,JSON.stringify(certificateData), certificateDetails.signature);
    console.log(signatureValid)
    const verificationResult = {
      status: hashValid && signatureValid ? "success" : "failed",
      hashValid,
      signatureValid,
      certificateData,
    };

    res.status(200).json(verificationResult);

  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
