const Policy = require("../models/Policy");

const createLog = require("../services/logService");


/*
================================================

CREATE OR UPDATE POLICY

================================================
*/

exports.upsertPolicy = async (req, res) => {

 try {

  const tenantId = req.user.tenantId;


  const {

   blockedDomains,

   allowedFileTypes,

   maxAttachmentSize,

   blockExecutable

  } = req.body;


  let policy = await Policy.findOne({

   tenantId

  });


  /*
  create policy if not exists
  */

  if (!policy) {

   policy = await Policy.create({

    tenantId,

    blockedDomains,

    allowedFileTypes,

    maxAttachmentSize,

    blockExecutable

   });


   await createLog({

    tenantId,

    type: "policy_update",

    severity: "info",

    message: "Policy created",

    metadata: {

     blockedDomains,

     allowedFileTypes

    }

   });


  } else {

   /*
   update policy
   */

   policy.blockedDomains = blockedDomains;

   policy.allowedFileTypes = allowedFileTypes;

   policy.maxAttachmentSize = maxAttachmentSize;

   policy.blockExecutable = blockExecutable;


   await policy.save();


   await createLog({

    tenantId,

    type: "policy_update",

    severity: "warning",

    message: "Policy updated",

    metadata: {

     blockedDomains,

     allowedFileTypes

    }

   });

  }


  res.json(policy);


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


  res.json(policy);


 } catch (error) {

  res.status(500).json({

   error: error.message

  });

 }

};