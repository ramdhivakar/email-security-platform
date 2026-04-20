const Log = require("../models/Log");


/*
================================================

GET LOGS

Returns logs belonging to tenant only

Supports filtering

================================================
*/

exports.getLogs = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  const {

   type,
   severity,
   limit = 50

  } = req.query;


  const filter = {

   tenantId

  };


  /*
  optional filters
  */

  if (type) {

   filter.type = type;

  }


  if (severity) {

   filter.severity = severity;

  }


  const logs = await Log.find(filter)

  .sort({

   createdAt: -1

  })

  .limit(Number(limit));


  res.json({

   count: logs.length,

   logs

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};