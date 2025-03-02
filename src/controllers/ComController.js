const Complaint = require("../model/Complaint"); // Adjust the path accordingly
const nodemailer = require("nodemailer");
const User = require("../model/UserAuth"); // Adjust the path accordingly

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APPS_PASSWORD,
  },
});

// CREATE a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const newComplaint = new Complaint({
     ...req.body
    });
    await newComplaint.save();
    res.status(201).json({ message: "Complaint created successfully", complaint: newComplaint });
  } catch (error) {
    res.status(500).json({ message: "Error creating complaint", error: error.message });
  }
};

// GET all complaints with optional search query
exports.getAllComplaints = async (req, res) => {
  try {
    const { search = "" } = req.query;

    let query = {};
    
    if (search) {
      query = {
        $or: [
          { company: { $regex: search, $options: "i" } },
          { companyAdd: { $regex: search, $options: "i" } },
          { companyPOC: { $regex: search, $options: "i" } },
          { companyNo: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { offerLetter: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    const complaints = await Complaint.find(query).sort({ createdDate: -1 }); // Sort by creation date (latest first)
    res.status(200).json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};

// GET a complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ complaint });
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaint", error: error.message });
  }
};

// UPDATE a complaint
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    // Update complaint
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // If remarks are provided, send email to the user
    if (remark) {
      const user = await User.findOne({email:complaint.email}); // Assuming the complaint has a userId

      if (user) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: user.email,
          subject: "Complaint Updated - Remarks",
          html: `
            <p>Dear ${user.name||"User"},</p>
            <p>Your complaint with ID <strong>${complaint._id}</strong> has been updated. Below are the remarks:</p>
            <p><strong>Remarks:</strong></p>
            <p>${remark}</p>
            <p>Thank you for your patience!</p>
            <p>Best regards,</p>
            <p>Support Team</p>
            <p>Job Elevator - Advertrone</p>
          `,
        };

        await transporter.sendMail(mailOptions);
      }
    }

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating complaint",
      error: error.message,
    });
  }
};


// DELETE a complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting complaint", error: error.message });
  }
};
