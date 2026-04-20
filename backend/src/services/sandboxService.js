/*
================================================

ATTACHMENT SANDBOX SIMULATION

Simulates deep malware inspection

================================================
*/

const dangerousPatterns = [

 ".exe",
 ".bat",
 ".cmd",
 ".ps1",
 ".js",
 ".vbs"

];


const suspiciousPatterns = [

 ".docm",
 ".xlsm",
 ".zip",
 ".rar"

];


function sandboxScan(attachments = []) {

 let riskScore = 0;


 attachments.forEach(file => {

  const name = file.filename?.toLowerCase() || "";


  /*
  high risk patterns
  */

  dangerousPatterns.forEach(pattern => {

   if (name.includes(pattern)) {

    riskScore += 10;

   }

  });


  /*
  medium risk patterns
  */

  suspiciousPatterns.forEach(pattern => {

   if (name.includes(pattern)) {

    riskScore += 4;

   }

  });


  /*
  large file heuristic
  */

  if (file.fileSize > 5000000) {

   riskScore += 2;

  }

 });


 if (riskScore >= 10) {

  return "malicious";

 }


 if (riskScore >= 4) {

  return "suspicious";

 }


 return "clean";

}


module.exports = sandboxScan;