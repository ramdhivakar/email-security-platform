const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const checkThreatIntel = require("../services/threatIntelService");

const analyzeUrls = require("../services/urlAnalysisService");

const checkDomainReputation = require("../services/domainReputationService");

const generateDKIMSignature = require("../services/dkimService");

const createLog = require("../services/logService");

const validateAuth = require("../services/authValidationService");

const sandboxScan = require("../services/sandboxService");


/*
================================================

EMAIL INGESTION ENGINE

Supports:

inbound email security
outbound email security
SPF DKIM DMARC validation
DKIM signing (outbound)
sandbox scan
threat intelligence
domain reputation
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
  extract domain
  */

  const senderDomain = from.split("@")[1];


  /*
  SPF DKIM DMARC simulation
  */

  const authentication = validateAuth({

   from,
   subject,
   content

  });


  /*
  DKIM signing for outbound
  */

  let dkim = null;

  if (direction === "outbound") {

   dkim = generateDKIMSignature({

    from,
    subject,
    content

   });

  }


  /*
  sandbox scan
  */

  const sandboxResult = sandboxScan(

   attachments || []

  );


  /*
  threat intel lookup
  */

  const threatResult = checkThreatIntel({

   from

  });


  /*
  url scan
  */

  const urlAnalysis = analyzeUrls(

   content || ""

  );


  /*
  domain reputation check
  */

  const domainCheck = await checkDomainReputation(

   senderDomain

  );


  /*
  policy engine
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
  combine results
  */

  let finalVerdict = policyVerdict;


  if (sandboxResult === "malicious")

   finalVerdict = "malicious";


  if (threatResult.isMalicious)

   finalVerdict = "malicious";


  if (urlAnalysis.verdict === "malicious")

   finalVerdict = "malicious";


  if (domainCheck.reputation === "malicious")

   finalVerdict = "malicious";


  if (

   (urlAnalysis.verdict === "suspicious" ||

    domainCheck.reputation === "suspicious") &&

   finalVerdict === "clean"

  ) {

   finalVerdict = "suspicious";

  }


  /*
  status logic
  */

  let status = "completed";


  if (finalVerdict === "malicious") {

   status = direction === "outbound"

    ? "blocked"

    : "quarantined";

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

   authentication,

   dkim,

   verdict: finalVerdict,

   status,

   urlAnalysis,

   sandboxResult,

   domainReputation: domainCheck

  });


  /*
  logs
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


  await createLog({

   tenantId,

   type: "threat_intel",

   severity:

    domainCheck.reputation === "malicious"

     ? "critical"

     : "info",

   message:

    `Domain reputation: ${domainCheck.reputation}`,

   metadata: {

    emailId: email._id,

    domain: senderDomain,

    riskScore: domainCheck.riskScore

   }

  });


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


  if (dkim) {

   await createLog({

    tenantId,

    type: "smtp_processing",

    severity: "info",

    message: "DKIM signature generated",

    metadata: {

     emailId: email._id,

     domain: dkim.domain

    }

   });

  }


  res.json({

   message: "Email analyzed",

   verdict: finalVerdict,

   status,

   authentication,

   dkim,

   sandboxResult,

   domainCheck,

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