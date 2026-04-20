const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const createLog = require("../services/logService");


/*
================================================

EMAIL INGESTION

Supports inbound & outbound emails

================================================
*/

exports.ingestEmail = async (req, res) => {

 try {

  const {

   from,
   to,
   subject,
   content,
   attachments,
   direction = "inbound"

  } = req.body;


  const tenantId = req.user.tenantId;


  /*
  run analysis engine
  */

  const verdict = await analyzeEmail({

   from,
   to,
   subject,
   content,
   attachments,
   direction

  }, tenantId);


  /*
  status logic
  */

  let status = "completed";


  if (verdict === "malicious") {

   status = "quarantined";

  }


  if (verdict === "malicious" && direction === "outbound") {

   status = "blocked";

  }


  /*
  save email
  */

  const email = await Email.create({

   tenantId,

   direction,

   from,
   to,

   subject,
   content,

   attachments,

   verdict,

   status

  });


  /*
  log event
  */

  await createLog({

   tenantId,

   type: "email_scan",

   severity:

    verdict === "malicious"

     ? "critical"

     : verdict === "suspicious"

     ? "warning"

     : "info",


   message:

    `Email ${direction} analyzed: ${verdict}`,

   metadata: {

    emailId: email._id,

    direction,

    subject

   }

  });


  res.json({

   message: "Email analyzed",

   direction,

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



/*
================================================

GET EMAIL LIST

================================================
*/

exports.getEmails = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


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

GET EMAIL BY ID

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

================================================
*/

exports.deleteEmail = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  const email = await Email.findOneAndDelete({

   _id: emailId,

   tenantId

  });


  if (!email) {

   return res.status(404).json({

    error: "Email not found"

   });

  }


  await createLog({

   tenantId,

   type: "system",

   severity: "warning",

   message: "Email deleted",

   metadata: {

    emailId

   }

  });


  res.json({

   message: "Email deleted",

   emailId

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};