const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <--- IMPORTANT: Replace with your deployed contract address
const contractAbi =[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "certificateId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "studentId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "institutionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "issuerAddress",
          "type": "address"
        }
      ],
      "name": "CertificateIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "institutionAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "authorizedBy",
          "type": "address"
        }
      ],
      "name": "InstitutionAuthorized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "institutionAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "deauthorizedBy",
          "type": "address"
        }
      ],
      "name": "InstitutionDeauthorized",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "authorizedInstitutions",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "certificateCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "certificates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "studentId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "institutionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "sha256Hash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "signature",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "encryptedAesKeyForMetadata",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "issueTimestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "contractOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_certificateId",
          "type": "uint256"
        }
      ],
      "name": "getCertificateDetails",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "studentId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "institutionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "sha256Hash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "signature",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "encryptedAesKeyForMetadata",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "issueTimestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_studentId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_institutionId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_sha256Hash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_signature",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_encryptedAesKeyForMetadata",
          "type": "string"
        }
      ],
      "name": "issueCertificate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_institutionAddress",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_isAuthorized",
          "type": "bool"
        }
      ],
      "name": "setInstitutionAuthorization",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
 ];         // <--- IMPORTANT: Replace with your contract ABI

 async function initializeContract() {
     const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
     return new ethers.Contract(contractAddress, contractAbi, provider);
 }
 
 let certificateAuthorityContract;
 
 async function verifyCertificate() {
     const certificateId = document.getElementById("certificateIdInput").value;
     const institutionPublicKeyHex = document.getElementById("institutionPublicKeyInput").value;
     const studentPrivateKeyHex = document.getElementById("studentPrivateKeyInput").value;
 
     if (!certificateId || !institutionPublicKeyHex || !studentPrivateKeyHex) {
         alert("Please enter all required fields (Certificate ID, Institution Public Key, Student Private Key).");
         return;
     }
 
     try {
         const certificateDetails = await certificateAuthorityContract.getCertificateDetails(certificateId);
 
         document.getElementById("studentIdDisplay").textContent = `Student ID: ${certificateDetails.studentId}`;
         document.getElementById("institutionIdDisplay").textContent = `Institution ID: ${certificateDetails.institutionId}`;
         document.getElementById("ipfsHashDisplay").textContent = `IPFS Hash: ${certificateDetails.ipfsHash}`;
         document.getElementById("sha256HashDisplay").textContent = `SHA-256 Hash: ${certificateDetails.sha256Hash}`;
         document.getElementById("signatureDisplay").textContent = `Signature: ${certificateDetails.signature}`;
         document.getElementById("encryptedMetadataDisplay").textContent = `Encrypted Metadata: ${certificateDetails.encryptedMetadata}`;
         document.getElementById("encryptedAesKeyForMetadataDisplay").textContent = `Encrypted AES Key: ${certificateDetails.encryptedAesKeyForMetadata}`;
         document.getElementById("issueTimestampDisplay").textContent = `Issue Timestamp: ${certificateDetails.issueTimestamp}`;
 
         // Verify Digital Signature
         const EC = elliptic.ec;
         const ec = new EC("secp256k1");
         const publicKey = ec.keyFromPublic(institutionPublicKeyHex, "hex");
         const signatureObject = JSON.parse(certificateDetails.signature);
         const signatureValid = publicKey.verify(certificateDetails.sha256Hash, signatureObject);
 
         if (signatureValid) {
             console.log("✅ Signature verified successfully!");
             document.getElementById("verificationStatusDisplay").textContent = "Verification Status: Signature Verified ✅";
             document.getElementById("verificationStatusDisplay").style.color = "green";
 
             // Fetch Certificate Document from IPFS
             const ipfsHash = certificateDetails.ipfsHash;
             const ipfsGatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
 
             try {
                 const ipfsResponse = await fetch(ipfsGatewayUrl);
                 if (!ipfsResponse.ok) throw new Error(`HTTP error! Status: ${ipfsResponse.status}`);
                 const encryptedCertificate = await ipfsResponse.json();
 
                 // Decrypt the Certificate Document
                 const decryptedCertificate = await decryptCertificate(encryptedCertificate.encryptedData, studentPrivateKeyHex);
 
                 document.getElementById("certificateDocumentDisplay").innerHTML = "<hr><strong>Decrypted Certificate Document:</strong><br><pre>" +
                     JSON.stringify(decryptedCertificate, null, 2) + "</pre>";
 
             } catch (error) {
                 console.error("Error fetching from IPFS:", error);
                 document.getElementById("certificateDocumentDisplay").textContent = "Error loading document from IPFS.";
             }
 
         } else {
             console.error("Signature verification failed!");
             document.getElementById("verificationStatusDisplay").textContent = "Verification Status: Signature INVALID ❌";
             document.getElementById("verificationStatusDisplay").style.color = "red";
             document.getElementById("certificateDocumentDisplay").textContent = "";
         }
 
     } catch (error) {
         console.error("Error verifying certificate:", error);
         document.getElementById("verificationStatusDisplay").textContent = "Verification Status: Error ❌";
         document.getElementById("verificationStatusDisplay").style.color = "red";
         document.getElementById("certificateDocumentDisplay").textContent = "";
     }
 }
 
 // AES Decryption function (to be implemented)
 async function decryptCertificate(encryptedData, privateKeyHex) {
     // Implement AES decryption using the student's private key
     // This function should decrypt `encryptedData` using `privateKeyHex`
     return {}; // Return the decrypted certificate object
 }
 
 document.addEventListener("DOMContentLoaded", async function () {
     certificateAuthorityContract = await initializeContract();
     document.getElementById("verifyButton").addEventListener("click", verifyCertificate);
 });
 