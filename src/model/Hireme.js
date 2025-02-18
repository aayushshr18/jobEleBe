const mongoose = require("mongoose");

const hiremeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId },
  mobile: { type: String },
  email: { type: String },
  name: { type: String },
  role: { type: String },
  company: { type: String },
  companyAdd: { type: String },
  companyPOC: { type: String },
  companyNo: { type: String },
  doj: { type: Date },
  salary:{type:String},
  description: { type: String },
  createdDate: { type: Date, default: Date.now },
});

const Hireme = mongoose.model("Hireme", hiremeSchema);

module.exports = Hireme;
