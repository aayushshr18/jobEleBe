const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/UserAuth");
const nodemailer = require("nodemailer");
const otpTemplate = require("../emailTemps/Otp");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APPS_PASSWORD,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.registration = async (req, res) => {
  try {
    const { email } = req.body;
    const newEmail = email.toLowerCase();
    const otp = generateOTP();
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() + 3);

    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", status: false });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email already exists", status: false });
    }

    const newUser = new User({
      ...req.body,
      email: newEmail,
      otp: otp,
      otpExpiry: timestamp,
    });
    await newUser.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: newEmail,
      subject: `${otp} is your  OTP for your Job Elevator account`,
      html: otpTemplate(otp),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(200).json({
          success: true,
          message: "OTP Sent Successfully!",
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (email === process.env.DEV_ACCOUNT_EMAIL) {
      return res.status(200).send({
        success: true,
        message: "OTP Sent Successfully!",
      });
    }
    const newEmail = email.toLowerCase();
    const otp = generateOTP();
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() + 3);
    const user = await User.findOneAndUpdate(
      { email: newEmail },
      { $set: { otp, otpExpiry: timestamp } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: newEmail,
      subject: `${otp} is your  OTP for your Job Elevator account`,
      html: otpTemplate(otp),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.status(200).json({
          success: true,
          message: "OTP Sent Successfully!",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    if (
      !user ||
      user.otp !== otp ||
      (user.email !== process.env.DEV_ACCOUNT_EMAIL &&
        user.otpExpiry < new Date())
    ) {
      return res.status(400).json({
        msg: "Invalid or expired OTP",
        eq: user.otp !== otp,
        expi: user.otpExpiry < new Date(),
      });
    }
    if (user.email !== process.env.DEV_ACCOUNT_EMAIL) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const userToken = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({ status: true, userToken: userToken });
  } catch (error) {}
};

exports.userDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
    .select('-password -createdDate -__v') // Exclude sensitive fields
    .populate('viewedUsers', '-password -createdDate -__v');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }

}

exports.getPaidUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const emp = await User.findById(req.user.id);

    if (emp.profileType !== "employer" || emp.balance < 3) {
      return res.status(404).json({ success: false, message: "Insufficient Balance" });
    }

    emp.balance -= 3;
    if (!emp.viewedUsers.includes(userId)) {
      emp.viewedUsers.push(userId);
    }

    await emp.save();

    const user = await User.findById(userId).select('-password -createdDate -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

exports.allUserDetails = async (req, res) => {
  try {
    const {profileType}=req.query;
    let users;
    if(profileType){
      users = await User.find({profileType});
    }else{
      users = await User.find();
    }

    res.json({
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }

}

exports.empUserDetails = async (req, res) => {
  try {
    const emp = await User.findById(req.user.id);
    const users = await User.find({ profileType:"user", _id: { $nin: emp.viewedUsers } });

    res.json({
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }

}

exports.updateUser = async (req, res) => {
  try {
    const _id = req.user.id;
    const updates = req.body;
    if (updates.password) {
      const saltRounds = 10;
      updates.password = await bcrypt.hash(updates.password, saltRounds);
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    res.json({
      message: "User updated successfully",
      status: true,
      data: updatedUser,
    });
  } catch (error) {

    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (deletedUser) {
      res.send({
        message: `Successfully deleted user ${req.user.email}`,
        status: true,
      });
    } else {
      res.send({ message: "User is not found", status: false });
    }
  } catch (error) {
    res.send({ message: "500 Internal Error", status: false });
  }
};

exports.bulkCreateUsers = async (req, res) => {
  try {
    const usersData = req.body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ message: "Please provide a valid array of users." });
    }

    const createdUsers = await User.insertMany(usersData);

    res.status(201).json({
      message: "Users created successfully",
      data: createdUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating users",
      error: error.message,
    });
  }
};