require("dotenv").config();
const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
    const AcademicCredentials = await ethers.getContractFactory("CertificateAuthority");
    const academicCredentials = await AcademicCredentials.deploy();

    await academicCredentials.waitForDeployment();
    const contractAddress = academicCredentials.target;
    console.log("✅ Contract deployed at:", academicCredentials.target);
    fs.appendFileSync(".env", `\nCONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
