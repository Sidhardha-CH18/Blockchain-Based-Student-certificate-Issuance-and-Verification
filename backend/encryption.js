const CryptoJS = require("crypto-js");
const eccrypto = require("eccrypto");
const crypto = require("crypto");

async function encryptCertificate(certificate, studentPublicKey) {
    try {
        console.log("🔐 Encrypting certificate...");

        // Generate AES Key
        const aesKey = crypto.randomBytes(16);
        console.log("🔑 AES Key Generated:", aesKey.toString("hex"));

        // Encrypt Certificate using AES
        const encryptedCertificate = CryptoJS.AES.encrypt(JSON.stringify(certificate),aesKey.toString("hex")).toString();
        console.log("🔏 Encrypted Certificate:", encryptedCertificate);

        // Encrypt AES Key using Student's Public Key
        const encryptedAESKey = await eccrypto.encrypt(studentPublicKey, aesKey);
        const encodedAESKey = Buffer.concat([
            encryptedAESKey.iv,
            encryptedAESKey.mac,
            encryptedAESKey.ephemPublicKey,
            encryptedAESKey.ciphertext
        ]).toString("base64");

        console.log("🔒 AES Key Encrypted for Student:", encodedAESKey);

        return {
            encryptedCertificate,
            encodedAESKey
        };
    } catch (error) {
        console.error("❌ Error during encryption:", error);
        throw error;
    }
}

async function decryptCertificate(encryptedCertificate, encryptedAESKey, studentPrivateKey) {
    try {
        console.log("🔓 Decrypting AES Key...");

        // Decode AES Key structure
        const decodedBuffer = Buffer.from(encryptedAESKey, "base64");
        const decryptedStructure = {
            iv: decodedBuffer.slice(0, 16),
            mac: decodedBuffer.slice(16, 48),
            ephemPublicKey: decodedBuffer.slice(48, 113),
            ciphertext: decodedBuffer.slice(113)
        };

        // Decrypt AES Key using Student's Private Key
        const decryptedAESKey = await eccrypto.decrypt(studentPrivateKey, decryptedStructure);
        const aesKeyHex = decryptedAESKey.toString("hex");
        console.log("🔑 Decrypted AES Key:", aesKeyHex);

        // Decrypt the Certificate using AES
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedCertificate, aesKeyHex);
        const decryptedCertificate = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
        console.log("📜 Decrypted Certificate:", decryptedCertificate);

        return decryptedCertificate;
    } catch (error) {
        console.error("❌ Error during decryption:", error);
        throw error;
    }
}

module.exports = {
    encryptCertificate,
    decryptCertificate
};
