const mongoose = require("mongoose");

const SharedCertificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true },
  studentId: { type: String, required: true },
  verifierId: { type: String, required: true },
  ipfsHash:{type:String,required:true},
  encryptedAesKeyForVerifier: { type: String, required: true },
  status: {type:String,default:'pending'},
  sharedAt: { type: Date, default: Date.now },
  result:{type:String,default:''}
});

module.exports = mongoose.model("SharedCertificate", SharedCertificateSchema);
