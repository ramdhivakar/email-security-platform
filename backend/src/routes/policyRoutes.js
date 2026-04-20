const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const policyController = require("../controllers/policyController");


/*
================================================

CREATE OR UPDATE POLICY

================================================
*/

router.post(

 "/",

 authMiddleware,

 policyController.upsertPolicy

);


/*
================================================

GET POLICY

================================================
*/

router.get(

 "/",

 authMiddleware,

 policyController.getPolicy

);


module.exports = router;