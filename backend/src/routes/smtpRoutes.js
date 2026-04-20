const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const smtpController = require("../controllers/smtpController");


/*
================================================

SIMULATED SMTP ENDPOINT

POST /api/smtp/receive

================================================
*/

router.post(

 "/receive",

 authMiddleware,

 smtpController.receiveSMTP

);


module.exports = router;