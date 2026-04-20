const { v4: uuidv4 } = require("uuid");

const createLog = require("../services/logService");

const emailController = require("./emailController");


/*
================================================

SIMULATED SMTP OUTBOUND RELAY

================================================
*/

exports.sendSMTP = async (req, res) => {

 try {

  const {

   from,
   to,
   subject,
   content,
   attachments

  } = req.body;


  const tenantId = req.user.tenantId;


  /*
  generate message id
  */

  const messageId = uuidv4();


  /*
  log outbound connection
  */

  await createLog({

   tenantId,

   type: "smtp_connection",

   severity: "info",

   message: "Outbound SMTP relay connected",

   metadata: {

    messageId,

    from,
    to

   }

  });


  /*
  simulate processing delay
  */

  await new Promise(resolve =>

   setTimeout(resolve, 300)

  );


  /*
  log outbound queue
  */

  await createLog({

   tenantId,

   type: "smtp_processing",

   severity: "info",

   message: "Outbound email queued for scanning",

   metadata: {

    messageId

   }

  });


  /*
  pass email to scan engine
  */

  req.body.direction = "outbound";

  req.body.messageId = messageId;


  return emailController.ingestEmail(

   req,

   res

  );

 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};