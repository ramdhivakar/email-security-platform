/*
================================================

SPF DKIM DMARC SIMULATION

================================================
*/

const trustedDomains = [

 "company.com",
 "abc.com",
 "gmail.com"

];


function checkSPF(email) {

 const domain =

  email.from.split("@")[1];


 if (trustedDomains.includes(domain)) {

  return "pass";

 }

 return "fail";

}


function checkDKIM(email) {

 if (

  email.subject?.toLowerCase().includes("invoice") ||

  email.subject?.toLowerCase().includes("urgent")

 ) {

  return "fail";

 }

 return "pass";

}


function checkDMARC(spf, dkim) {

 if (spf === "pass" || dkim === "pass") {

  return "pass";

 }

 return "fail";

}


function validateAuth(email) {

 const spf = checkSPF(email);

 const dkim = checkDKIM(email);

 const dmarc = checkDMARC(spf, dkim);


 return {

  spf,
  dkim,
  dmarc

 };

}


module.exports = validateAuth;