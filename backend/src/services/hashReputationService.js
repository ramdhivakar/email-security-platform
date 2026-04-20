const crypto = require("crypto");

const MalwareHash = require("../models/MalwareHash");


/*
=================================

GENERATE FILE HASH

=================================
*/

function generateHash(filename) {

 return crypto

  .createHash("sha256")

  .update(filename)

  .digest("hex");

}


/*
=================================

CHECK HASH REPUTATION

=================================
*/

async function checkAttachmentHashes(

 attachments = []

) {

 let results = [];


 for (const file of attachments) {

  const hash = generateHash(

   file.filename

  );


  const record = await MalwareHash.findOne({

   hash

  });


  if (record) {

   results.push({

    filename: file.filename,

    hash,

    threatName: record.threatName,

    severity: record.severity,

    malicious: true

   });

  } else {

   results.push({

    filename: file.filename,

    hash,

    malicious: false

   });

  }

 }


 return results;

}


module.exports = checkAttachmentHashes;