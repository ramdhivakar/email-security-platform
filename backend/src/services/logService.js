const Log = require("../models/Log");

/*
================================================

CENTRAL LOGGING FUNCTION

================================================
*/

const createLog = async (

 tenantId,

 type,

 message,

 severity = "info",

 metadata = {}

) => {

 try {

  await Log.create({

   tenantId,

   type,

   message,

   severity,

   metadata

  });

 } catch (error) {

  console.error(

   "Log write failed:",

   error.message

  );

 }

};


module.exports = createLog;