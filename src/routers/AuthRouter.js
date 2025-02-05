const express = require("express");
const authRouter = new express.Router();
const userAuth = require("../controllers/Authorization");


authRouter.post("/register",userAuth.registration);
authRouter.post("/sendOtp",userAuth.sendOtp);
authRouter.post("/verifyOtp",userAuth.verifyOtp);


module.exports = authRouter;