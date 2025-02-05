const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp:{
    type:String,
  },
  otpExpiry:{
    type:Date
  },
  phone: { type: Number},
  profileType:{
    type:String,
    enum:['admin','user'],
    default:'user'
  },
  createdDate: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
