const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  state: { type: String },
  city: { type: String },
  salary: { type: String },
  type: { type: String },
  createdDate: { type: Date, default: Date.now },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
