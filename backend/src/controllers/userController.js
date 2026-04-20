const bcrypt = require("bcryptjs");

const User = require("../models/User");

const createLog = require("../services/logService");


/*
================================================

CREATE USER (ADMIN ONLY)

================================================
*/

exports.createUser = async (req, res) => {

 try {

  const {

   email,

   password,

   role

  } = req.body;


  const tenantId = req.user.tenantId;


  /*
  hash password
  */

  const hashedPassword = await bcrypt.hash(

   password,

   10

  );


  /*
  create user
  */

  const user = await User.create({

   email,

   password: hashedPassword,

   tenantId,

   role

  });


  /*
  log event
  */

  await createLog({

   tenantId,

   type: "user_mgmt",

   severity: "info",

   message: "User created",

   metadata: {

    email,

    role

   }

  });


  res.json({

   message: "User created",

   userId: user._id,

   role: user.role

  });

 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};



/*
================================================

GET USERS LIST

================================================
*/

exports.getUsers = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  const users = await User.find({

   tenantId

  }).select("-password");


  res.json({

   count: users.length,

   users

  });

 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};