const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");


/*
================================================

EMAIL INGESTION CONTROLLER

Simulates incoming email into cloud email security system

Flow:
1. Receive email data
2. Identify tenant from JWT
3. Analyze email content
4. Store result in DB
5. Return response

================================================
*/

exports.ingestEmail = async (req, res) => {

 try {

  // extract email data from request body
  const {
   from,
   to,
   subject,
   content,
   attachments
  } = req.body;


  // tenantId extracted from JWT middleware
  const tenantId = req.user.tenantId;


  /*
  analyze email using detection engine
  */

  const verdict = analyzeEmail({

   subject,
   content,
   attachments

  });


  /*
  store email with verdict
  */

  const email = await Email.create({

   tenantId,

   from,
   to,

   subject,
   content,

   attachments,

   status: "completed",

   verdict

  });


  /*
  response back to client
  */

  res.json({

   message: "Email received and analyzed",

   verdict,

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

GET EMAIL LIST FOR TENANT

Used for dashboard view

Returns emails belonging to logged-in company only

================================================
*/

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