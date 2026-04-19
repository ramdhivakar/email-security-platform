const analyzeEmail = (email) => {

 let verdict = "clean";

 const suspiciousKeywords = [

  "urgent",
  "password",
  "bank",
  "verify",
  "click",
  "invoice"

 ];

 const dangerousFileTypes = [

  "exe",
  "bat",
  "js",
  "scr"

 ];

 // check content keywords
 suspiciousKeywords.forEach(keyword => {

  if (

   email.subject?.toLowerCase().includes(keyword) ||

   email.content?.toLowerCase().includes(keyword)

  ) {

   verdict = "suspicious";

  }

 });

 // check attachment types
 email.attachments?.forEach(file => {

  if (

   dangerousFileTypes.includes(

    file.fileType.toLowerCase()

   )

  ) {

   verdict = "malicious";

  }

 });

 return verdict;

};

module.exports = analyzeEmail;