const Email = require("../models/Email");

/*
================================================

SECURITY DASHBOARD CONTROLLER

Provides statistics for tenant dashboard

Each company sees only their own data

================================================
*/

exports.getDashboardStats = async (req, res) => {

 try {

  // tenant isolation
  const tenantId = req.user.tenantId;

  /*
  count email statistics
  */

  const totalEmails = await Email.countDocuments({
   tenantId
  });

  const maliciousEmails = await Email.countDocuments({
   tenantId,
   verdict: "malicious"
  });

  const suspiciousEmails = await Email.countDocuments({
   tenantId,
   verdict: "suspicious"
  });

  const safeEmails = await Email.countDocuments({
   tenantId,
   verdict: "clean"
  });

  const quarantinedEmails = await Email.countDocuments({
   tenantId,
   status: "quarantined"
  });


  /*
  return dashboard data
  */

  res.json({

   totalEmails,

   maliciousEmails,

   suspiciousEmails,

   safeEmails,

   quarantinedEmails

  });

 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};