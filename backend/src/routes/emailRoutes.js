const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const emailController = require("../controllers/emailController");


/*
================================================

EMAIL INGEST

================================================
*/

router.post(

 "/ingest",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst"

 ),

 emailController.ingestEmail

);


/*
================================================

EMAIL LIST

================================================
*/

router.get(

 "/list",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst",

  "viewer"

 ),

 emailController.getEmails

);


/*
================================================

EMAIL DETAILS

================================================
*/

router.get(

 "/:id",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst",

  "viewer"

 ),

 emailController.getEmailById

);


/*
================================================

DELETE EMAIL

ADMIN ONLY

================================================
*/

router.delete(

 "/:id",

 authMiddleware,

 authorizeRoles(

  "admin"

 ),

 emailController.deleteEmail

);


module.exports = router;