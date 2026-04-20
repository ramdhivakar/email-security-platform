const Policy = require("../models/Policy");

/*
================================================

CREATE OR UPDATE POLICY

Each tenant has only one policy

================================================
*/

exports.savePolicy = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;

  const {

   blockExecutable,
   maxAttachmentSize,
   blockedDomains,
   allowedFileTypes

  } = req.body;


  let policy = await Policy.findOne({

   tenantId

  });


  /*
  update existing policy
  */

  if (policy) {

   policy.blockExecutable = blockExecutable ?? policy.blockExecutable;

   policy.maxAttachmentSize = maxAttachmentSize ?? policy.maxAttachmentSize;

   policy.blockedDomains = blockedDomains ?? policy.blockedDomains;

   policy.allowedFileTypes = allowedFileTypes ?? policy.allowedFileTypes;


   await policy.save();


   return res.json({

    message: "Policy updated",

    policy

   });

  }


  /*
  create new policy
  */

  policy = await Policy.create({

   tenantId,

   blockExecutable,
   maxAttachmentSize,
   blockedDomains,
   allowedFileTypes

  });


  res.json({

   message: "Policy created",

   policy

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};



/*
================================================

GET POLICY

================================================
*/

exports.getPolicy = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  const policy = await Policy.findOne({

   tenantId

  });


  res.json({

   policy

  });


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};