const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const createLog = require("../services/logService");


/*
================================================

EMAIL INGESTION CONTROLLER

Simulates incoming email into cloud email security system

Flow:
1. Receive email data
2. Identify tenant from JWT
3. Analyze email content + policy rules
4. Apply quarantine logic
5. Store result in DB
6. Write log
7. Return response

================================================
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


  const tenantId = req.user.tenantId;


  /*
  run detection engine
  */

  const verdict = await analyzeEmail(

   {

    from,
    subject,
    content,
    attachments

   },

   tenantId

  );


  /*
  quarantine logic
  */

  let status = "completed";

  if (verdict === "malicious") {

   status = "quarantined";

  }


  /*
  store email
  */

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


  /*
  create log entry
  */

  await createLog(

   tenantId,

   "email_scan",

   `Email analyzed with verdict ${verdict}`,

   verdict === "malicious" ? "critical" : "info",

   {

    emailId: email._id,

    from,

    subject,

    status

   }

  );


  res.json({

   message: "Email received and analyzed",

   verdict,

   status,

   emailId: email._id

  });


 } catch (error) {

  console.error(error);


  res.status(500).json({

   error: error.message

  });

 }

};



/*
================================================

GET EMAIL LIST

Used for dashboard list view

Tenant isolation applied

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

GET SINGLE EMAIL DETAILS

Used for investigation screen

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

Used for admin cleanup or compliance

Logs deletion activity

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

    error: "Email not found or not authorized"

   });

  }


  /*
  log deletion event
  */

  await createLog(

   tenantId,

   "system",

   "Email deleted by admin",

   "warning",

   {

    emailId,

    subject: email.subject,

    from: email.from

   }

  );


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