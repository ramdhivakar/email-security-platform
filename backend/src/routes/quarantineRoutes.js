const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

 getQuarantinedEmails

} = require("../controllers/quarantineController");


/*
================================================

GET QUARANTINE LIST

================================================
*/

router.get(

 "/",

 authMiddleware,

 getQuarantinedEmails

);


module.exports = router;