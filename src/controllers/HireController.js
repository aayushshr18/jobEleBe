const mongoose = require("mongoose");
const Hireme = require("../model/Hireme"); // Adjust the path accordingly

// CREATE a new hireme
exports.createHireme = async (req, res) => {
  try {
    const newHireme = new Hireme({userId:req.user.id, ...req.body});
    await newHireme.save();
    res.status(201).json({ message: "Hireme created successfully", hireme: newHireme });
  } catch (error) {
    res.status(500).json({ message: "Error creating hireme", error: error.message });
  }
};


exports.createBulkHiremes = async (req, res) => {
  try {
    const hiremes = req.body;
    
    if (!Array.isArray(hiremes) || hiremes.some(hireme => !hireme.title || !hireme.company || !hireme.state || !hireme.city || !hireme.salary || !hireme.type)) {
      return res.status(400).json({ message: "Invalid hireme data" });
    }

    const createdHiremes = await Hireme.insertMany(hiremes);
    res.status(201).json({ message: `${createdHiremes.length} hiremes created successfully`, hiremes: createdHiremes });
  } catch (error) {
    res.status(500).json({ message: "Error creating hiremes", error: error.message });
  }
};


// GET all hiremes with optional search query
exports.getAllHiremes = async (req, res) => {
    try {
      const hiremes = await Hireme.find().sort({ createdDate: -1 }); // Sort by creation date (latest first)
      res.status(200).json({ hiremes });
    } catch (error) {
      res.status(500).json({ message: "Error fetching hiremes", error: error.message });
    }
  };
  

// GET a hireme by ID
exports.getHiremeById = async (req, res) => {
  try {
    const hireme = await Hireme.findById(req.params.id);
    if (!hireme) {
      return res.status(404).json({ message: "Hireme not found" });
    }
    res.status(200).json({ hireme });
  } catch (error) {
    res.status(500).json({ message: "Error fetching hireme", error: error.message });
  }
};

// UPDATE a hireme
exports.updateHireme = async (req, res) => {
  try {
    const hireme = await Hireme.findByIdAndUpdate(req.params.id,req.body, { new: true });

    if (!hireme) {
      return res.status(404).json({ message: "Hireme not found" });
    }
    res.status(200).json({ message: "Hireme updated successfully", hireme });
  } catch (error) {
    res.status(500).json({ message: "Error updating hireme", error: error.message });
  }
};

// DELETE a hireme
exports.deleteHireme = async (req, res) => {
  try {
    const hireme = await Hireme.findByIdAndDelete(req.params.id);
    if (!hireme) {
      return res.status(404).json({ message: "Hireme not found" });
    }
    res.status(200).json({ message: "Hireme deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting hireme", error: error.message });
  }
};
