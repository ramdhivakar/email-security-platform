const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const {

 getQuarantinedEmails,

 releaseEmail

} = require("../controllers/quarantineController");


/*
================================================

VIEW QUARANTINE

================================================
*/

router.get(

 "/",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst",

  "viewer"

 ),

 getQuarantinedEmails

);


/*
================================================

RELEASE EMAIL

ADMIN + ANALYST

================================================
*/

router.patch(

 "/release/:id",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst"

 ),

 releaseEmail

);


module.exports = router;