// scripts/get-private-key.js

const { ethers } = require("hardhat");
const { Wallet } = require("ethers");

async function main() {
  // Define the mnemonic (you can load it from your .env file if needed)
  const mnemonic = process.env.MNEMONIC || "test test test test test test test test test test test test test test test test";

  // Generate a wallet from the mnemonic and derive the account #19 (index 18)
  const wallet = Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/18`);  // Account #19 corresponds to index 18

  // Output the private key
  console.log("Private Key of Account #19:", wallet.privateKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
