const Email = require("../models/Email");

/*
================================================

GET QUARANTINED EMAILS

Returns only malicious emails that were quarantined

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