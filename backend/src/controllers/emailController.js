const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const createLog = require("../services/logService");

const validateAuth = require("../services/authValidationService");

const sandboxScan = require("../services/sandboxService");


/*
================================================

EMAIL INGESTION

Supports inbound & outbound emails

Includes SPF DKIM DMARC simulation

Includes sandbox scan

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
  AUTH CHECK
  */

  const authentication = validateAuth({

   from,
   subject,
   content

  });


  /*
  SANDBOX CHECK
  */

  const sandboxResult = sandboxScan(

   attachments

  );


  /*
  ANALYZE EMAIL
  */

  const verdict = await analyzeEmail({

   from,
   to,
   subject,
   content,
   attachments,
   authentication,
   direction

  }, tenantId);


  /*
  STATUS LOGIC
  */

  let status = "completed";


  if (verdict === "malicious") {

   status = direction === "outbound"

    ? "blocked"

    : "quarantined";

  }


  /*
  SAVE EMAIL
  */

  const email = await Email.create({

   tenantId,

   direction,

   from,
   to,

   subject,
   content,

   attachments,

   authentication,

   verdict,

   status

  });


  /*
  LOG SCAN RESULT
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

    subject,

    direction

   }

  });


  /*
  LOG AUTH RESULT
  */

  await createLog({

   tenantId,

   type: "email_auth",

   severity:

    authentication.dmarc === "fail"

     ? "warning"

     : "info",


   message:

    `SPF:${authentication.spf} DKIM:${authentication.dkim} DMARC:${authentication.dmarc}`,

   metadata: {

    emailId: email._id

   }

  });


  /*
  LOG SANDBOX RESULT
  */

  await createLog({

   tenantId,

   type: "sandbox_scan",

   severity:

    sandboxResult === "malicious"

     ? "critical"

     : sandboxResult === "suspicious"

     ? "warning"

     : "info",


   message:

    `Sandbox verdict: ${sandboxResult}`,

   metadata: {

    emailId: email._id

   }

  });


  res.json({

   message: "Email analyzed",

   direction,

   verdict,

   status,

   authentication,

   sandboxResult,

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

GET SINGLE EMAIL

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