const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const policyController = require("../controllers/policyController");


/*
================================================

CREATE OR UPDATE POLICY

POST /api/policy

================================================
*/

router.post(

 "/",

 authMiddleware,

 policyController.savePolicy

);


/*
================================================

GET POLICY

GET /api/policy

================================================
*/

router.get(

 "/",

 authMiddleware,

 policyController.getPolicy

);


module.exports = router;