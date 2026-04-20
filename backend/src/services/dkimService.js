const crypto = require("crypto");


/*
================================================

DKIM SIGNING SIMULATION

================================================
*/

function generateDKIMSignature(email) {

 const domain = email.from.split("@")[1];


 const selector = "selector1";


 const contentHash = crypto

  .createHash("sha256")

  .update(

   (email.subject || "") +

   (email.content || "")

  )

  .digest("base64");


 const signature = crypto

  .createHash("sha256")

  .update(

   contentHash + domain

  )

  .digest("base64");


 return {

  domain,

  selector,

  contentHash,

  signature,

  result: "pass"

 };

}


module.exports = generateDKIMSignature;