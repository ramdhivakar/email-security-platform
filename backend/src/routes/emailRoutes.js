const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const emailController = require("../controllers/emailController");


router.post(
 "/ingest",
 authMiddleware,
 emailController.ingestEmail
);


router.get(
 "/",
 authMiddleware,
 emailController.getEmails
);


router.get(
 "/:id",
 authMiddleware,
 emailController.getEmailById
);


router.delete(
 "/:id",
 authMiddleware,
 emailController.deleteEmail
);


module.exports = router;