const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");


// register company + admin user
router.post("/register", authController.register);


// login user
router.post("/login", authController.login);


module.exports = router;