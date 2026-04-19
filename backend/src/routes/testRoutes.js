const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const testController = require("../controllers/testController");


// protected route
router.get(

 "/test-secure",

 authMiddleware,

 testController.secureTest

);


module.exports = router;