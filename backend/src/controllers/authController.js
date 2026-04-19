const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Tenant = require("../models/Tenant");


/*
REGISTER CONTROLLER
creates company + admin user
*/

exports.register = async (req, res) => {

 try {

  // get data from frontend request
  const { companyName, domain, email, password } = req.body;


  // create tenant (company)
  const tenant = await Tenant.create({

   companyName,
   domain

  });


  // hash password for security
  const hashedPassword = await bcrypt.hash(password, 10);


  // create user linked to tenant
  const user = await User.create({

   email,
   password: hashedPassword,
   tenantId: tenant._id

  });


  res.json({

   message: "Registration successful",
   tenantId: tenant._id,
   userId: user._id

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};



/*
LOGIN CONTROLLER
verifies user credentials
creates JWT token
*/

exports.login = async (req, res) => {

 try {

  const { email, password } = req.body;


  // find user
  const user = await User.findOne({ email });


  if (!user) {

   return res.status(400).json({

    error: "User not found"

   });

  }


  // compare password
  const isMatch = await bcrypt.compare(password, user.password);


  if (!isMatch) {

   return res.status(400).json({

    error: "Invalid password"

   });

  }


  // create JWT token
  const token = jwt.sign(

   {

    userId: user._id,
    tenantId: user.tenantId

   },

   process.env.JWT_SECRET,

   { expiresIn: "1d" }

  );


  res.json({

   message: "Login successful",
   token

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};