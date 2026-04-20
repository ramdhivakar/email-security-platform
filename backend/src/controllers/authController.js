const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const Tenant = require("../models/Tenant");


/*
================================================

REGISTER CONTROLLER

Creates company + admin user

================================================
*/

exports.register = async (req, res) => {

 try {

  const {

   companyName,

   domain,

   email,

   password,

   role = "admin"

  } = req.body;


  /*
  find tenant by domain
  */

  let tenant = await Tenant.findOne({

   domain

  });


  /*
  create tenant only first time
  */

  if (!tenant) {

   tenant = await Tenant.create({

    companyName,

    domain

   });

  }


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

   tenantId: tenant._id,

   role

  });


  res.json({

   message: "User created",

   tenantId: tenant._id,

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

LOGIN CONTROLLER

Creates JWT token with role

================================================
*/

exports.login = async (req, res) => {

 try {

  const {

   email,

   password

  } = req.body;


  const user = await User.findOne({

   email

  });


  if (!user) {

   return res.status(400).json({

    error: "User not found"

   });

  }


  const isMatch = await bcrypt.compare(

   password,

   user.password

  );


  if (!isMatch) {

   return res.status(400).json({

    error: "Invalid password"

   });

  }


  /*
  JWT includes role
  */

  const token = jwt.sign(

   {

    userId: user._id,

    tenantId: user.tenantId,

    role: user.role

   },

   process.env.JWT_SECRET,

   {

    expiresIn: "1d"

   }

  );


  res.json({

   message: "Login successful",

   token,

   role: user.role

  });

 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};