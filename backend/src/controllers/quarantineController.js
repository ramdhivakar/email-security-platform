const Email = require("../models/Email");

const createLog = require("../services/logService");


/*
================================================

GET QUARANTINED EMAILS

================================================
*/

exports.getQuarantinedEmails = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  const emails = await Email.find({

   tenantId,

   status: "quarantined"

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

RELEASE EMAIL FROM QUARANTINE

================================================
*/

exports.releaseEmail = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  const email = await Email.findOne({

   _id: emailId,

   tenantId,

   status: "quarantined"

  });


  if (!email) {

   return res.status(404).json({

    error: "Email not found"

   });

  }


  email.status = "released";

  email.verdict = "clean";


  await email.save();


  /*
  audit log
  */

  await createLog({

   tenantId,

   type: "quarantine_action",

   severity: "warning",

   message: "Email released from quarantine",

   metadata: {

    emailId

   }

  });


  res.json({

   message: "Email released",

   email

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};