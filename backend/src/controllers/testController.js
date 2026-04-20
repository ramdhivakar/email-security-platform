const { v4: uuidv4 } = require("uuid");

const createLog = require("../services/logService");

const emailController = require("./emailController");


/*
================================================

SIMULATED SMTP INBOUND FLOW

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


  const tenantId = req.user.tenantId;


  /*
  generate message id
  */

  const messageId = uuidv4();


  /*
  SMTP connection log
  */

  await createLog({

   tenantId,

   type: "smtp_connection",

   severity: "info",

   message: "SMTP connection established",

   metadata: {

    messageId,

    from,
    to

   }

  });


  /*
  simulate queue delay
  */

  await new Promise(resolve =>

   setTimeout(resolve, 300)

  );


  /*
  SMTP processing log
  */

  await createLog({

   tenantId,

   type: "smtp_processing",

   severity: "info",

   message: "SMTP message queued for scanning",

   metadata: {

    messageId

   }

  });


  /*
  pass email to main engine
  */

  req.body.direction = "inbound";


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