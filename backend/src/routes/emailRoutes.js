const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const emailController = require("../controllers/emailController");


/*
EMAIL INGESTION
*/

router.post(

 "/email/ingest",

 authMiddleware,

 emailController.ingestEmail

);


/*
EMAIL LIST
*/

router.get(

 "/email/list",

 authMiddleware,

 emailController.getEmails

);


module.exports = router;