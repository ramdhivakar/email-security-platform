const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const checkThreatIntel = require("../services/threatIntelService");

const analyzeUrls = require("../services/urlAnalysisService");

const createLog = require("../services/logService");

const validateAuth = require("../services/authValidationService");

const sandboxScan = require("../services/sandboxService");


/*
================================================

EMAIL INGESTION ENGINE

Supports:

inbound emails
outbound emails
SPF DKIM DMARC
sandbox scan
threat intelligence
URL phishing detection
policy engine
logging

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
  AUTHENTICATION CHECK
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

   attachments || []

  );


  /*
  THREAT INTEL CHECK
  */

  const threatResult = checkThreatIntel({

   from

  });


  /*
  URL SCAN
  */

  const urlAnalysis = analyzeUrls(

   content || ""

  );


  /*
  CONTENT + POLICY ANALYSIS
  */

  const policyVerdict = await analyzeEmail({

   from,
   to,
   subject,
   content,
   attachments,
   authentication,
   direction

  }, tenantId);


  /*
  FINAL VERDICT MERGE
  */

  let finalVerdict = policyVerdict;


  if (

   urlAnalysis.verdict === "malicious"

  ) {

   finalVerdict = "malicious";

  }


  if (

   sandboxResult === "malicious"

  ) {

   finalVerdict = "malicious";

  }


  if (

   threatResult.isMalicious

  ) {

   finalVerdict = "malicious";

  }


  if (

   urlAnalysis.verdict === "suspicious" &&
   finalVerdict === "clean"

  ) {

   finalVerdict = "suspicious";

  }


  /*
  STATUS LOGIC
  */

  let status = "completed";


  if (finalVerdict === "malicious") {

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

   verdict: finalVerdict,

   status,

   urlAnalysis,

   sandboxResult

  });


  /*
  EMAIL SCAN LOG
  */

  await createLog({

   tenantId,

   type: "email_scan",

   severity:

    finalVerdict === "malicious"

     ? "critical"

     : finalVerdict === "suspicious"

     ? "warning"

     : "info",


   message:

    `Email ${direction} analyzed: ${finalVerdict}`,


   metadata: {

    emailId: email._id,

    subject,

    direction,

    status

   }

  });


  /*
  AUTH LOG
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
  SANDBOX LOG
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


  /*
  THREAT INTEL LOG
  */

  if (threatResult.isMalicious) {

   await createLog({

    tenantId,

    type: "threat_intel",

    severity: "critical",

    message: "Sender flagged by threat intelligence",

    metadata: {

     from,

     reason: threatResult.reason,

     emailId: email._id

    }

   });

  }


  /*
  URL SCAN LOG
  */

  await createLog({

   tenantId,

   type: "smtp_processing",

   severity:

    urlAnalysis.verdict === "malicious"

     ? "critical"

     : urlAnalysis.verdict === "suspicious"

     ? "warning"

     : "info",


   message:

    `URL scan verdict: ${urlAnalysis.verdict}`,


   metadata: {

    emailId: email._id,

    urls: urlAnalysis.urls

   }

  });


  res.json({

   message: "Email analyzed",

   direction,

   verdict: finalVerdict,

   status,

   authentication,

   sandboxResult,

   threatIntel:

    threatResult.isMalicious

     ? threatResult.reason

     : "clean",

   urlAnalysis,

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

  }).sort({

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