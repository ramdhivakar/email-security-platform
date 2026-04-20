const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const checkThreatIntel = require("../services/threatIntelService");

const analyzeUrls = require("../services/urlAnalysisService");

const checkDomainReputation = require("../services/domainReputationService");

const checkAttachmentHashes = require("../services/hashReputationService");

const generateDKIMSignature = require("../services/dkimService");

const createLog = require("../services/logService");

const validateAuth = require("../services/authValidationService");

const sandboxScan = require("../services/sandboxService");


/*
================================================

EMAIL INGESTION ENGINE

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


  const senderDomain = from.split("@")[1];


  /*
  SPF DKIM DMARC
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
  malware hash scan
  */

  const hashResults = await checkAttachmentHashes(

   attachments || []

  );


  /*
  threat intel
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
  domain reputation
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
  combine verdict
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


  if (hashResults.some(f => f.malicious))

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

   domainReputation: domainCheck,

   hashResults

  });


  /*
  LOGS
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

    domain: senderDomain,

    riskScore: domainCheck.riskScore,

    emailId: email._id

   }

  });


  await createLog({

   tenantId,

   type: "threat_intel",

   severity:

    hashResults.some(f => f.malicious)

     ? "critical"

     : "info",

   message: "Attachment hash scan completed",

   metadata: {

    emailId: email._id,

    hashResults

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

    urls: urlAnalysis.urls,

    emailId: email._id

   }

  });


  if (dkim) {

   await createLog({

    tenantId,

    type: "smtp_processing",

    severity: "info",

    message: "DKIM signature generated",

    metadata: {

     domain: dkim.domain,

     emailId: email._id

    }

   });

  }


  res.json({

   verdict: finalVerdict,

   status,

   authentication,

   dkim,

   sandboxResult,

   domainCheck,

   hashResults,

   urlAnalysis,

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



exports.getEmailById = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  const email = await Email.findOne({

   _id: emailId,

   tenantId

  });


  if (!email)

   return res.status(404).json({

    error: "Email not found"

   });


  res.json(email);


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};



exports.deleteEmail = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  const email = await Email.findOneAndDelete({

   _id: emailId,

   tenantId

  });


  if (!email)

   return res.status(404).json({

    error: "Email not found"

   });


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