const eccrypto = require("eccrypto");
const crypto = require("crypto");

// Generate ECC key pair
function generateECCKeyPair() {
    const privateKey = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(privateKey);
    console.log(publicKey)
    return { privateKey, publicKey };
}

// Sign a message using ECC
async function signMessage(privateKey, message) {
    try {
        const messageHash = crypto.createHash("sha256").update(JSON.stringify(message)).digest();
        const signature = await eccrypto.sign(privateKey, messageHash);
        return signature.toString("hex");
    } catch (error) {
        console.error("❌ Error signing message:", error);
        return null;
    }
}

// Verify ECC signature
async function verifySignature(publicKey, message, signature) {
    try {
        const messageHash = crypto.createHash("sha256").update(JSON.stringify(message)).digest();
        await eccrypto.verify(publicKey, messageHash, Buffer.from(signature, "hex"));
        console.log("✅ Signature Verified Successfully!");
        return true;
    } catch (error) {
        console.error("❌ Signature Verification Failed:", error);
        return false;
    }
}

module.exports = {
    generateECCKeyPair,
    signMessage,
    verifySignature
};
