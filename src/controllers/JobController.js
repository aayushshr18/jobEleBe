const mongoose = require("mongoose");
const Job = require("../model/Job"); // Adjust the path accordingly
const User = require("../model/UserAuth");

// CREATE a new job
exports.createJob = async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ message: "Job created successfully", job: newJob });
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
};


exports.createBulkJobs = async (req, res) => {
  try {
    const jobs = req.body;
    
    if (!Array.isArray(jobs) || jobs.some(job => !job.title || !job.company || !job.state || !job.city || !job.salary || !job.type)) {
      return res.status(400).json({ message: "Invalid job data" });
    }

    const createdJobs = await Job.insertMany(jobs);
    res.status(201).json({ message: `${createdJobs.length} jobs created successfully`, jobs: createdJobs });
  } catch (error) {
    res.status(500).json({ message: "Error creating jobs", error: error.message });
  }
};


// GET all jobs with optional search query
exports.getAllJobs = async (req, res) => {
  try {
    // Extract query parameters
    const { title, company, state, city, salary, type } = req.query;

    let query = {};
    const user = await User.findById(req.user.id);
    if (user.profileType === "user" && user.expiry && new Date(user.expiry) < new Date()) {
      return res.status(403).json({success:false, message: "Subscription expired. Please renew to access the data." });
    }
    

    // Check if any search parameters are provided and add them to the query
    if (title || company || state || city || salary || type) {
      query = {
        $or: []
      };

      if (title) query.$or.push({ title: { $regex: title, $options: 'i' } });
      if (company) query.$or.push({ company: { $regex: company, $options: 'i' } });
      if (state) query.$or.push({ state: { $regex: state, $options: 'i' } });
      if (city) query.$or.push({ city: { $regex: city, $options: 'i' } });
      if (salary) query.$or.push({ salary: { $regex: salary, $options: 'i' } });
      if (type) query.$or.push({ type: { $regex: type, $options: 'i' } });
    }

    // Fetch the jobs from the database with optional filters and sort by createdDate (latest first)
    const jobs = await Job.find(query).sort({ createdDate: -1 });

    res.status(200).json({success:true, jobs });
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
    const job = await Job.findByIdAndUpdate(req.params.id,req.body, { new: true });

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
