const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const policyController = require("../controllers/policyController");


/*
================================================

CREATE OR UPDATE POLICY

ADMIN ONLY

================================================
*/

router.post(

 "/",

 authMiddleware,

 authorizeRoles("admin"),

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

 authorizeRoles(

  "admin",

  "analyst",

  "viewer"

 ),

 policyController.getPolicy

);


module.exports = router;