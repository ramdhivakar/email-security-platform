const Email = require("../models/Email");

const analyzeEmail = require("../services/emailAnalysisService");

const validateAuth = require("../services/authValidationService");

const createLog = require("../services/logService");


/*
================================================

SIMULATED SMTP RECEIVER

Acts like mail gateway entry point

================================================
*/

exports.receiveSMTP = async (req, res) => {

 try {

  const {

   from,
   to,
   subject,
   content,
   attachments

  } = req.body;


  /*
  in real SMTP, tenant resolved via domain
  */

  const tenantId = req.user.tenantId;


  /*
  simulate SMTP handshake log
  */

  await createLog({

   tenantId,

   type: "smtp_connection",

   severity: "info",

   message: "SMTP connection established",

   metadata: {

    from

   }

  });


  /*
  authentication checks
  */

  const authentication = validateAuth({

   from,
   subject,
   content

  });


  /*
  analyze email
  */

  const verdict = await analyzeEmail({

   from,
   to,
   subject,
   content,
   attachments,
   authentication,
   direction: "inbound"

  }, tenantId);


  let status = "completed";


  if (verdict === "malicious") {

   status = "quarantined";

  }


  /*
  store email
  */

  const email = await Email.create({

   tenantId,

   direction: "inbound",

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
  log mail flow
  */

  await createLog({

   tenantId,

   type: "smtp_processing",

   severity:

    verdict === "malicious"

     ? "critical"

     : "info",

   message:

    `SMTP processed email: ${verdict}`,

   metadata: {

    emailId: email._id

   }

  });


  res.json({

   message: "SMTP email processed",

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