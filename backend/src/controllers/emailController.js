const Email = require("../models/Email");


/*
EMAIL INGESTION
simulates receiving email into security cloud
*/

exports.ingestEmail = async (req, res) => {

 try {

  const {

   from,
   to,
   subject,
   content,
   attachments

  } = req.body;


  // tenantId comes from JWT middleware
  const tenantId = req.user.tenantId;


  const email = await Email.create({

   tenantId,
   from,
   to,
   subject,
   content,
   attachments,
   status: "pending",
   verdict: "unknown"

  });


  res.json({

   message: "Email received for scanning",

   emailId: email._id

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};