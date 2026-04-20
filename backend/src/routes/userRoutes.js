const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const userController = require("../controllers/userController");


/*
================================================

CREATE USER

ADMIN ONLY

================================================
*/

router.post(

 "/create",

 authMiddleware,

 authorizeRoles("admin"),

 userController.createUser

);


/*
================================================

GET USERS

ADMIN + ANALYST

================================================
*/

router.get(

 "/list",

 authMiddleware,

 authorizeRoles(

  "admin",

  "analyst"

 ),

 userController.getUsers

);


module.exports = router;