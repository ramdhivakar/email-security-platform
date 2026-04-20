const Policy = require("../models/Policy");


const suspiciousKeywords = [

 "urgent",
 "password",
 "bank",
 "login",
 "verify",
 "click",
 "invoice",
 "payment"

];


const dangerousFileTypes = [

 "exe",
 "bat",
 "js",
 "scr",
 "cmd",
 "ps1",
 "zip"

];


async function analyzeEmail(email, tenantId) {

 let score = 0;


 const policy = await Policy.findOne({

  tenantId

 });


 /*
 ================================
 CONTENT ANALYSIS
 ================================
 */

 const contentText =

  (email.subject || "") +

  " " +

  (email.content || "");


 suspiciousKeywords.forEach(keyword => {

  if (

   contentText.toLowerCase().includes(

    keyword

   )

  ) {

   score += 1;

  }

 });


 /*
 ================================
 ATTACHMENT ANALYSIS
 ================================
 */

 if (email.attachments?.length) {

  email.attachments.forEach(file => {

   const ext =

    file.fileType?.toLowerCase();


   if (

    dangerousFileTypes.includes(ext)

   ) {

    score += 5;
   }


   /*
   POLICY RULES
   */

   if (

    policy?.blockExecutable &&

    ext === "exe"

   ) {

    score += 10;
   }


   if (

    policy?.allowedFileTypes?.length &&

    !policy.allowedFileTypes.includes(ext)

   ) {

    score += 3;
   }


   if (

    policy?.maxAttachmentSize &&

    file.fileSize >

    policy.maxAttachmentSize

   ) {

    score += 3;
   }

  });

 }


 /*
 ================================
 DOMAIN CHECK
 ================================
 */

 if (policy?.blockedDomains?.length) {

  const domain =

   email.from.split("@")[1];


  if (

   policy.blockedDomains.includes(domain)

  ) {

   score += 6;
  }

 }


 /*
 ================================
 FINAL VERDICT
 ================================
 */

 if (score >= 10) {

  return "malicious";

 }


 if (score >= 4) {

  return "suspicious";

 }


 return "clean";

}


module.exports = analyzeEmail;