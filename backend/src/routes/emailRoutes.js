const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const emailController = require("../controllers/emailController");

// email ingestion endpoint
router.post(

 "/email/ingest",

 authMiddleware,

 emailController.ingestEmail

);

module.exports = router;