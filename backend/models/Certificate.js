const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
    certificateId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, index: true },
    institutionId: { type: String, required: true }, // Unique certificate identifier
    ipfsHash: { type: String, required: true },
    transactionHash: { type: String, required: true },
    issuedTimeStamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["Issued", "Revoked"], default: "Issued" }
});

module.exports = mongoose.model("Certificate", CertificateSchema);
