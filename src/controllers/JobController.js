const mongoose = require("mongoose");
const Job = require("../model/Job"); // Adjust the path accordingly

// CREATE a new job
exports.createJob = async (req, res) => {
  try {
    const newJob = new Job(...req.body);
    await newJob.save();
    res.status(201).json({ message: "Job created successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
};

// GET all jobs with optional search query
exports.getAllJobs = async (req, res) => {
    try {
      const { search = '' } = req.query;
      let query = {};
      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { company: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
            { salary: { $regex: search, $options: 'i' } },
            { type: { $regex: search, $options: 'i' } },
          ]
        };
      }
      
      const jobs = await Job.find(query).sort({ createdDate: -1 }); // Sort by creation date (latest first)
  
      res.status(200).json({ jobs });
    } catch (error) {
      res.status(500).json({ message: "Error fetching jobs", error: error.message });
    }
  };
  

// GET a job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error: error.message });
  }
};

// UPDATE a job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, {...req.body }, { new: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

// DELETE a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error: error.message });
  }
};
