const express = require("express");
const routerV1 = new express.Router();
const userAuth = require("../controllers/Authorization");
const Job= require("../controllers/JobController")
const Com= require("../controllers/ComController")



//user auth
routerV1.get("/users",userAuth.allUserDetails);
routerV1.get("/user",userAuth.userDetails);
routerV1.patch("/user",userAuth.updateUser);
routerV1.delete("/user",userAuth.deleteUser);


routerV1.post("/job", Job.createJob );
routerV1.post("/bulkjob", Job.createBulkJobs );
routerV1.get("/jobs", Job.getAllJobs );
routerV1.get("/job/:id", Job.getJobById );
routerV1.patch("/job/:id", Job.updateJob );
routerV1.delete("/job/:id", Job.deleteJob );


routerV1.post("/complaint", Com.createComplaint );
routerV1.get("/complaints", Com.getAllComplaints );
routerV1.get("/complaint/:id", Com.getComplaintById );
routerV1.patch("/complaint/:id", Com.updateComplaint );
routerV1.delete("/complaint/:id", Com.deleteComplaint );



module.exports = routerV1;