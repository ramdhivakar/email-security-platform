exports.secureTest = (req, res) => {

 res.json({

  message: "Secure route working",

  user: req.user

 });

};