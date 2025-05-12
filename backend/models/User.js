const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uniqueId: { type: String, required: true, unique: true }, // Unique ID based on role
    address: { type: String, required: true, unique: true }, // MetaMask Address
    name: { type: String, required: true }, // Account Name (Editable if ENS not available)
    email: { type: String, required: true, unique: true }, // User Email
    role: { type: String, required: true, enum: ["Institution", "Student", "Verifier"] }, // User Role
    publicKey: { type: String, required: true }, // Public Key from MetaMask
    createdAt: { type: Date, default: Date.now }
});
//createdAt?

module.exports = mongoose.model("User", userSchema);
