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

const web3 = new Web3(process.env.SEPOLIA_RPC_URL); 
const contractAddress = '0x4B389Cd12557f5C27D9990de721463692CcB8A29';
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
  console.log(accountAddress)
  console.log(accounts[accountAddress])
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
    const prefix = role === "Institution" ? "UI" 
                  : role === "Student" ? "US" 
                  : "UV"; 
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
    console.log(accounts);
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
const sendProgressEvent = (res, step, message) => {
    res.write(`data: ${JSON.stringify({ step, message })}\n\n`);
};

app.post('/api/issue-certificate', async (req, res) => {
  try {
    console.log('issue')
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendProgress = (message) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', message })}\n\n`);
    };

    sendProgress('Validating credentials...');
    const { studentId, name, degreeTitle, fatherName, branch, bdate, sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8, institutionAddress } = req.body;

    // Student/Institution Validation
    const [student, institution] = await Promise.all([
      User.findOne({ uniqueId: studentId, role: 'Student' }),
      User.findOne({ address: institutionAddress, role: "Institution" })
    ]);
    
    if (!student || !institution) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: "Invalid student or institution" })}\n\n`);
      return res.end();
    }

    // Certificate Data Preparation
    sendProgress('Calculating academic results...');
    const dob = req.body.dob;
    const sgpa = [sem1, sem2, sem3, sem4, sem5, sem6, sem7, sem8].map(s => parseFloat(s) || 0);
    const cgpa = sgpa.reduce((sum, val) => sum + val, 0) / sgpa.length;
    
    const award = cgpa >= 9.0 ? "Gold Medal" :
      cgpa >= 8.0 ? "Distinction" :
      cgpa >= 7.0 ? "First Class" :
      cgpa >= 6.0 ? "Second Class" :
      cgpa >= 5.0 ? "Pass" : "Fail";

    // Document Creation
    sendProgress('Generating certificate document...');
    const certificateDocument = {
      studentId, name, degreeTitle,
      fatherName, branch, birthDate: dob,
      sgpa, cgpa: parseFloat(cgpa.toFixed(2)), award
    };
    const certificateData = JSON.stringify(certificateDocument);
    console.log("certificateDats:",certificateData)
    // Encryption Stage
    sendProgress('Encrypting document...');
    const { encryptedCertificate, encodedAESKey } = await encryptCertificate(
      certificateData,
      Buffer.from(student.publicKey.slice(2), "hex")
    );

    // IPFS Upload
    sendProgress('Uploading to IPFS...');
    const tempFilePath = path.join(__dirname, "temp-certificate-encrypted.json");
    fs.writeFileSync(tempFilePath, JSON.stringify({ encryptedData: encryptedCertificate }));
    const ipfsHash = await uploadToIPFS(tempFilePath);
    fs.unlinkSync(tempFilePath); // Cleanup temp file

    // Blockchain Preparation
    sendProgress('Preparing blockchain transaction...');
    const sha256Hash = crypto.createHash("sha256").update(certificateData).digest();
    const digitalSignature = await signMessage(
      Buffer.from(getPrivateKey(institutionAddress).slice(2), "hex"),
      certificateData
    );
    console.log('signature checkpoint')
    const certificateId = await generateUniqueCertificateId();
    const privateKey = getPrivateKey(institutionAddress);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Transaction Execution
    sendProgress('Signing transaction...');
    console.log('signing transcation')
    const tx = certificateContract.methods.issueCertificate(
      certificateId,
      parseInt(studentId.replace(/\D/g, ''), 10),
      parseInt(institution.uniqueId.replace(/\D/g, ''), 10),
      ipfsHash,
      sha256Hash.toString("hex"),
      digitalSignature.toString("hex"),
      encodedAESKey
    );
    console.log('signing done')
    const [gas, gasPrice, nonce] = await Promise.all([
      tx.estimateGas({ from: account.address }),
      web3.eth.getGasPrice(),
      web3.eth.getTransactionCount(account.address)
    ]);
    console.log(gas)
    console.log(gasPrice)
    console.log(nonce)
    sendProgress('Broadcasting to blockchain...');
    // const bumpedGasPrice = (BigInt(gasPrice) * 500n) / 100n;
    // console.log(bumpedGasPrice)
    const signedTx = await web3.eth.accounts.signTransaction({
      to: certificateContract.options.address,
      data: tx.encodeABI(),
      gas,
      gasPrice,
      nonce,
      chainId: 11155111
    }, privateKey);
    console.log('signed')
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(receipt)
    console.log("certificate ID:",certificateId);
    console.log("student ID:",studentId);
    console.log("institution ID:",institution.uniqueId);
    console.log("ipfsHash:",ipfsHash);
    console.log("transactionHash:",receipt.transactionHash);
    // Database Update
    sendProgress('Finalizing records...');
    const newCertificate = new Certificate({
      certificateId,
      studentId,
      institutionId: institution.uniqueId,
      ipfsHash,
      transactionHash: receipt.transactionHash,
      issueTimestamp: new Date(),
      status: "Issued"
    });
    await newCertificate.save();
    console.log(newCertificate.toObject())
    // Final Respnew onse
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      data: {
        success: true,
        certificateDetails: newCertificate.toObject()
      }
    })}\n\n`);

  } catch (error) {
    console.error("Error issuing certificate:", error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: error.message
    })}\n\n`);
  } finally {
    res.end();
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
        
        console.log(certificateDetails.institutionId)
        const response = await axios.get(ipfsUrl);
        console.log(studentId)

        const student=await User.findOne({uniqueId: studentId,role: 'Student'});
        console.log(student)
        
        // Decrypt the certificate metadata using the student's private key
        const decryptedCertificate = await decryptCertificate(response.data.encryptedData, certificateDetails.encryptedAesKeyForMetadata,Buffer.from(getPrivateKey(student.address).slice(2), "hex") );
        console.log(decryptedCertificate)
        res.json({ success: true, certificate: decryptedCertificate,encryptedAesKey: certificateDetails.encryptedAesKeyForMetadata});
    } catch (error) {
        console.error("Error fetching certificate:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.post("/api/student-certificates", async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: "Student address is required" });
  }
  
  try {
    const student = await User.findOne({ address: address });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const certificates = await Certificate.find({ studentId: student.uniqueId });
    if (!certificates.length) {
      return res.status(404).json({ error: "No certificates found" });
    }

    // Get institution names for all certificates
    const certificatesWithInstitution = await Promise.all(
      certificates.map(async cert => {
        const institution = await User.findOne({uniqueId:cert.institutionId});
        return {
          ...cert._doc,
          institutionName: institution?.name || "Unknown Institution"
        };
      })
    );
    console.log(certificatesWithInstitution)

    res.json(certificatesWithInstitution);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Server error" });
  }
});

  app.get("/api/verifiers", async (req, res) => {
    try {
        const verifiers = await User.find({ role: "Verifier" }, "name uniqueId publicKey email address");
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
    const student = await User.findOne({ uniqueId: StudentId, role: "Student" });
    const verifier = await User.findOne({uniqueId:verifierId});
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
      ipfsHash:certificate.ipfsHash,
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
  console.log(verifierAddress)
  if (!verifierAddress) {
    return res.status(400).json({ success: false, message: "Verifier address required" });
  }

  try {
    // Find all certificates shared with this verifier
    const verifier=await User.findOne({address: verifierAddress,role:'Verifier'});
    const sharedCerts = await SharedCertificate.find({ verifierId: verifier.uniqueId});

    // Optionally omit encrypted AES key from the response if you want to
    const result = sharedCerts.map(cert => ({
      certificateId: cert.certificateId,
      studentId: cert.studentId,
      verifierId: cert.verifierId,
      status: cert.status,
      result:cert.result
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
    const { certificateId, studentId, verifierId } = req.body;
    const verifier=await User.findOne({uniqueId:verifierId});
    const certificate=await Certificate.findOne({certificateId:certificateId});
    const institution=await User.findOne({uniqueId:certificate.institutionId})
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

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${sharedKeyRecord.ipfsHash}`;    
    const response = await axios.get(ipfsUrl);
    const certificateData= await decryptCertificate(response.data.encryptedData, encodedKey,Buffer.from(getPrivateKey(verifier.address).slice(2), "hex") );

    console.log(certificateData);
    return res.status(200).json({
      success: true,
      certificateData:certificateData,
      institutionId:institution.uniqueId,
      institutionName:institution.name
    });

  } catch (error) {
    console.error("Error in /view-shared-certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});


app.post('/api/verifyCertificate', async (req, res) => {
  try {
    const { certificateData, verifierAddress, certificateId } = req.body;
    
    // 1. Find certificate record
    const certRecord = await Certificate.findOne({ 
      certificateId, 
      studentId: certificateData.studentId 
    });
    
    if (!certRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "Certificate not found." 
      });
    }

    // 2. Get blockchain record
    const result = await certificateContract.methods
      .getCertificateDetails(certificateId)
      .call();

    // 3. Parse blockchain data
    const blockchainDetails = {
      studentId: `US${result[0]}`,
      institutionId: `UI${result[1]}`,
      ipfsHash: result[2],
      sha256Hash: result[3],
      signature: result[4],
    };
    
    const actualInstitution = await User.findOne({uniqueId:blockchainDetails.institutionId})
    console.log()
    // 4. Hash verification
    const computedHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(certificateData))
      .digest("hex");

    const hashValid = computedHash === blockchainDetails.sha256Hash;
    
    // 5. Signature verification
    const institution = await User.findOne({ 
      uniqueId: certRecord.institutionId 
    });

    if (!institution?.publicKey) {
      return res.status(404).json({
        success: false,
        message: "Institution public key not found."
      });
    }

    const publicKeyBuffer = Buffer.from(institution.publicKey.slice(2), "hex");
    const signatureValid = await verifySignature(
      publicKeyBuffer,
      JSON.stringify(certificateData),
      blockchainDetails.signature
    );

    // 6. Final verification status
    const verificationStatus = hashValid && signatureValid ? "success" : "failed";
    await SharedCertificate.findOneAndUpdate(
      { 
        certificateId,
      },
      {
        status: 'verified',
        result: verificationStatus
      }
    );
    res.status(200).json({
      status: verificationStatus,
      hashValid,
      signatureValid,
      certificateData,
      institutionId:actualInstitution.uniqueId,
      institutionAddress:actualInstitution.address,
      institutionName:actualInstitution.name
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
// Add this code in your server.js file

// Get user details and number of certificates issued
app.post("/api/institute-dashboard", async (req, res) => {
  const { address } = req.body;

  if (!address) {
      return res.status(400).json({ error: "User  address is required" });
  }

  try {
      // Find the user by address
      const user = await User.findOne({ address:address });
      if (!user) {
          return res.status(404).json({ error: "User  not found" });
      }
      console.log(user)

      // Count the number of certificates issued to the user
      const certificateCount = await Certificate.countDocuments({ institutionId: user.uniqueId });
      console.log(certificateCount)
      // Respond with user's name and certificate count
      res.json({
          id: user.uniqueId,
          name: user.name,
          certificatesIssued: certificateCount
      });
  } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/student-dashboard", async (req, res) => {
  const { address } = req.body;

  if (!address) {
      return res.status(400).json({ error: "User  address is required" });
  }

  try {
      // Find the user by address
      const user = await User.findOne({ address:address });
      if (!user) {
          return res.status(404).json({ error: "User  not found" });
      }
      console.log(user)

      // Count the number of certificates issued to the user
      const certificateCount = await Certificate.countDocuments({ studentId: user.uniqueId });
      console.log(certificateCount)
      const sharedCount=await SharedCertificate.countDocuments({studentId:user.uniqueId});
      // Respond with user's name and certificate count
      res.json({
          id: user.uniqueId,
          name: user.name,
          certificatesIssued: certificateCount,
          sharedCount: sharedCount
      });
  } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/tamper-digital',async (req,res)=>{
  
  try {
    const {issuerId,certificateId}=req.body;
    const updatedCertificate = await Certificate.findOneAndUpdate(
      { certificateId },
      { institutionId: issuerId },
      { new: true }
    );

    if (!updatedCertificate) {
      return res.status(404).json({ message: "Certificate not found." });
    }

    return res.status(200).json({
      message: "Institution ID tampered successfully.",
      tamperedCertificate: updatedCertificate
    });
  } catch (error) {
    console.error("Error tampering digital signature:", error);
    return res.status(500).json({ message: "Internal server error." });
  }  
})

app.post('/api/tamper-content', async(req,res)=>{
  try{
    const {editedData,certificateId,verifierId}=req.body;
    const verifier=await User.findOne({uniqueId:verifierId});
    const publicKeyBuffer=Buffer.from(verifier.publicKey.slice(2),'hex');
    const certificateData=JSON.stringify(editedData);
    const { encryptedCertificate, encodedAESKey } = await encryptCertificate(
      certificateData,
      publicKeyBuffer
    );
    const tempPath = path.join(__dirname, 'temp-failed-cert.json');
    fs.writeFileSync(tempPath, JSON.stringify({ encryptedData: encryptedCertificate }));
    console.log("📦 Uploading to IPFS...");
    const ipfsHash = await uploadToIPFS(tempPath);
    fs.unlinkSync(tempPath);
    
    console.log("✅ Upload complete!");
    console.log("IPFS Hash:", ipfsHash);
    console.log("Encrypted AES Key:", encodedAESKey);
    const updatedCertificate = await SharedCertificate.findOneAndUpdate(
      { certificateId },
      { ipfsHash: ipfsHash,encryptedAesKeyForVerifier:encodedAESKey },
      { new: true }
    );
    return res.status(200).json({
      message: "Certificate content tampered successfully.",
      tamperedCertificate: updatedCertificate
    });

  }
  catch (error) {
    console.error("Error retrieving certificate data:", error);
    return res.status(500).json({ message: "Internal server error." });
  }  
})

app.post('/api/getUsers',async (req,res)=>{
  try {
    const { addresses } = req.body;
    console.log(addresses)
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: "Addresses array is required." });
    }

    const users = await User.find({ address: { $in: addresses } })
      .select('name uniqueId address role -_id'); // Customize what fields you want returned
    console.log(users);
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error getting UserDetails:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
})
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
