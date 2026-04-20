const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const logController = require("../controllers/logController");


/*
================================================

GET LOGS

GET /api/logs

Optional filters:

?type=email_scan
?severity=critical

================================================
*/

router.get(

 "/",

 authMiddleware,

 logController.getLogs

);


module.exports = router;