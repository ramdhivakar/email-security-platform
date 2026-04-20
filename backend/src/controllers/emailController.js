const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

exports.ingestEmail = async (req, res) => {

 try {

  const {
   from,
   to,
   subject,
   content,
   attachments
  } = req.body;


  const tenantId = req.user.tenantId;


  /*
  run analysis with policy rules
  */

  const verdict = await analyzeEmail({

   from,
   subject,
   content,
   attachments

  }, tenantId);


  /*
  quarantine logic
  */

  let status = "completed";

  if (verdict === "malicious") {

   status = "quarantined";

  }


  const email = await Email.create({

   tenantId,

   from,
   to,

   subject,
   content,

   attachments,

   status,

   verdict

  });


  res.json({

   message: "Email received and analyzed",

   verdict,

   status,

   emailId: email._id

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};

exports.getEmails = async (req, res) => {

 try {

  // tenantId extracted from JWT
  const tenantId = req.user.tenantId;


  // fetch emails belonging to tenant
  const emails = await Email.find({

   tenantId

  })

  .sort({

   createdAt: -1

  });


  res.json({

   count: emails.length,

   emails

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};



/*
================================================

GET SINGLE EMAIL DETAILS

Used for investigation view

Ensures tenant isolation

================================================
*/

exports.getEmailById = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  const email = await Email.findOne({

   _id: emailId,

   tenantId

  });


  if (!email) {

   return res.status(404).json({

    error: "Email not found"

   });

  }


  res.json(email);


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};

/*
================================================

DELETE EMAIL

Used for compliance, cleanup or admin removal

================================================
*/

exports.deleteEmail = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  /*
  ensure tenant owns this email
  */

  const email = await Email.findOneAndDelete({

   _id: emailId,
   tenantId

  });


  if (!email) {

   return res.status(404).json({

    error: "Email not found or not authorized"

   });

  }


  res.json({

   message: "Email deleted successfully",
   emailId

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};