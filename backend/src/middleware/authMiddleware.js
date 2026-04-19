const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

 try {

  // get token from request header
  const token = req.headers.authorization;


  if (!token) {

   return res.status(401).json({

    error: "Access denied. No token provided"

   });

  }


  // verify token
  const decoded = jwt.verify(

   token,
   process.env.JWT_SECRET

  );


  // attach user info to request
  req.user = decoded;


  next();

 } catch (error) {

  res.status(401).json({

   error: "Invalid token"

  });

 }

};


module.exports = authMiddleware;