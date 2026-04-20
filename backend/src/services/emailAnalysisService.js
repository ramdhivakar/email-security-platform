/*
================================================

EMAIL ANALYSIS SERVICE

Combines:

1. keyword detection
2. attachment detection
3. tenant policy rules

================================================
*/

const Policy = require("../models/Policy");

const analyzeEmail = async (emailData, tenantId) => {

 let verdict = "clean";


 const suspiciousKeywords = [
  "urgent",
  "password",
  "bank",
  "verify",
  "click",
  "invoice",
  "login",
  "reset"
 ];


 const dangerousFileTypes = [
  "exe",
  "bat",
  "js",
  "scr"
 ];


 /*
===========================
LOAD TENANT POLICY
===========================
*/

 const policy = await Policy.findOne({ tenantId });


 /*
===========================
KEYWORD ANALYSIS
===========================
*/

 suspiciousKeywords.forEach(keyword => {

  if (

   emailData.subject?.toLowerCase().includes(keyword) ||

   emailData.content?.toLowerCase().includes(keyword)

  ) {

   verdict = "suspicious";

  }

 });


 /*
===========================
DOMAIN CHECK
===========================
*/

 if (policy?.blockedDomains?.length) {

  const senderDomain = emailData.from.split("@")[1];

  if (policy.blockedDomains.includes(senderDomain)) {

   verdict = "malicious";

  }

 }


 /*
===========================
ATTACHMENT ANALYSIS
===========================
*/

 emailData.attachments?.forEach(file => {

  const fileType = file.fileType?.toLowerCase();


  /*
  block executable files
  */

  if (

   policy?.blockExecutable &&

   dangerousFileTypes.includes(fileType)

  ) {

   verdict = "malicious";

  }


  /*
  file size policy
  */

  if (

   policy?.maxAttachmentSize &&

   file.fileSize > policy.maxAttachmentSize

  ) {

   verdict = "suspicious";

  }


  /*
  allowed file types restriction
  */

  if (

   policy?.allowedFileTypes?.length &&

   !policy.allowedFileTypes.includes(fileType)

  ) {

   verdict = "suspicious";

  }

 });


 return verdict;

};


module.exports = analyzeEmail;