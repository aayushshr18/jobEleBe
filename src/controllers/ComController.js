const Complaint = require("../model/Complaint"); // Adjust the path accordingly

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
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {...req.body},
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ message: "Complaint updated successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error updating complaint", error: error.message });
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
