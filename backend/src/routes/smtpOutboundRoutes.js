const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const smtpOutboundController = require("../controllers/smtpOutboundController");


/*
================================================

SMTP OUTBOUND RELAY

================================================
*/

router.post(

 "/send",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst"

 ),

 smtpOutboundController.sendSMTP

);


module.exports = router;