const jwt = require("jsonwebtoken");


const authMiddleware = (

 req,

 res,

 next

) => {

 try {

  const header =

   req.headers.authorization;


  if (!header) {

   return res.status(401).json({

    error: "No token provided"

   });

  }


  /*
  supports Bearer token
  */

  const token = header.startsWith("Bearer ")

   ? header.split(" ")[1]

   : header;


  const decoded = jwt.verify(

   token,

   process.env.JWT_SECRET

  );


  req.user = decoded;


  next();

 } catch (error) {

  res.status(401).json({

   error: "Invalid token"

  });

 }

};


module.exports = authMiddleware;