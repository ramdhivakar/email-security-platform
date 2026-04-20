const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const emailController = require("../controllers/emailController");


/*
================================================

EMAIL INGESTION

POST /api/email/ingest

================================================
*/

router.post(

 "/ingest",

 authMiddleware,

 emailController.ingestEmail

);


/*
================================================

EMAIL LIST

GET /api/email/list

================================================
*/

router.get(

 "/list",

 authMiddleware,

 emailController.getEmails

);


/*
================================================

GET SINGLE EMAIL

GET /api/email/:id

================================================
*/

router.get(

 "/:id",

 authMiddleware,

 emailController.getEmailById

);


/*
================================================

DELETE EMAIL

DELETE /api/email/:id

================================================
*/

router.delete(

 "/:id",

 authMiddleware,

 emailController.deleteEmail

);


module.exports = router;