const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  mobile: { type: String },
  email: { type: String },
  name: { type: String },
  company: { type: String },
  companyAdd: { type: String },
  companyPOC: { type: String },
  companyNo: { type: String },
  doj: { type: Date },
  description: { type: String },
  offerLetter: { type: String },
  cStatus: { type: String, enum: ["pending", "resolved"],default:'pending' },
  createdDate: { type: Date, default: Date.now },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
