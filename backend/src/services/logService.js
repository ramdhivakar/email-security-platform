const Log = require("../models/Log");

/*
================================================

CENTRAL LOG SERVICE

Standard logging format for entire platform

================================================
*/

async function createLog({

 tenantId,

 type,

 severity,

 message,

 metadata = {}

}) {

 try {

  await Log.create({

   tenantId,

   type,

   severity,

   message,

   metadata

  });

 } catch (error) {

  console.error("Log write failed:", error.message);

 }

}

module.exports = createLog;