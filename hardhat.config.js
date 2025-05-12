require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts:[`0x${process.env.PRIVATE_KEY}`]
    },
  },
  accounts: {
    mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test test test test test test",
  },
};
