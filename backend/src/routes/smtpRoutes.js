const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const smtpController = require("../controllers/smtpController");


/*
================================================

SMTP INBOUND ENDPOINT

================================================
*/

router.post(

 "/receive",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst"

 ),

 smtpController.receiveSMTP

);


module.exports = router;