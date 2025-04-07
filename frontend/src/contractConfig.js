import { ethers } from "ethers";

// Smart contract details
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with deployed contract address
const CONTRACT_ABI = require("../../artifacts/contracts/CertificateAuthority.sol/CertificateAuthority.json").abi; // Import ABI

// Function to get the contract instance
export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
