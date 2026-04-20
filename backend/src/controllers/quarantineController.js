const Email = require("../models/Email");


/*
================================================

GET QUARANTINED EMAILS

Returns only emails that were quarantined

Tenant isolation applied

================================================
*/

exports.getQuarantinedEmails = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  /*
  fetch quarantined emails
  */

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

Used when admin marks email as safe

================================================
*/

exports.releaseEmail = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const emailId = req.params.id;


  /*
  find quarantined email
  */

  const email = await Email.findOne({

   _id: emailId,
   tenantId,
   status: "quarantined"

  });


  if (!email) {

   return res.status(404).json({

    error: "Quarantined email not found"

   });

  }


  /*
  update email status
  */

  email.status = "released";

  email.verdict = "clean";


  await email.save();


  res.json({

   message: "Email released from quarantine",

   email

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};