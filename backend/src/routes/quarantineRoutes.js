const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
 getQuarantinedEmails,
 releaseEmail
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


/*
================================================

RELEASE EMAIL FROM QUARANTINE

================================================
*/

router.patch(
 "/release/:id",
 authMiddleware,
 releaseEmail
);


module.exports = router;