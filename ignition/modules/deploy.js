require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    const AcademicCredentials = await ethers.getContractFactory("CertificateAuthority");
    const academicCredentials = await AcademicCredentials.deploy();

    await academicCredentials.waitForDeployment();
    console.log("✅ Contract deployed at:", academicCredentials.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
