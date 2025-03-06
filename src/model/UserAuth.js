const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  email: {
    type: String,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  gst:{
    type: String
  },
  companyId:{
    type:String
  },
  pucName: { type: String },
  pucEmail: { type: String },
  pucPhone: { type: String },
  phone: { type: Number },
  profileType: {
    type: String,
    enum: ["admin", "user", "employer"],
    default: "user",
  },

  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },
  summary: { type: String },
  skills: [
    {
      skillName: { type: String },
      proficiency: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      },
    },
  ],
  experience: [
    {
      jobTitle: { type: String },
      company: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      location: { type: String },
      description: { type: String },
    },
  ],
  education: [
    {
      degree: { type: String },
      institution: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      description: { type: String },
    },
  ],
  certifications: [
    {
      title: { type: String },
      institution: { type: String },
      dateIssued: { type: Date },
      expirationDate: { type: Date },
    },
  ],
  languages: [
    {
      language: { type: String },
      proficiency: {
        type: String,
        enum: ["Basic", "Intermediate", "Fluent", "Native"],
      },
    },
  ],
  expiry:{type: Date},
  balance:{
    type:Number,
    default:0
  },
  projects: [
    {
      projectName: { type: String },
      description: { type: String },
      technologiesUsed: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  ],
  viewedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdDate: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
