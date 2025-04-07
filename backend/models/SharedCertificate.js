const mongoose = require("mongoose");

const SharedCertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true },
  studentId: { type: String, required: true },
  verifierId: { type: String, required: true },
  encryptedAesKeyForVerifier: { type: String, required: true },
  sharedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SharedCertificate", SharedCertificateSchema);
