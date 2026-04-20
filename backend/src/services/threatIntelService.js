/*
================================================

THREAT INTELLIGENCE SIMULATION

Simulates known malicious domains database

================================================
*/

const knownMaliciousDomains = [

 "phishing-domain.com",

 "malware-mail.net",

 "spoofed-login.org",

 "fake-bank-security.com",

 "crypto-scam.io",

 "darkwebmail.ru",

 "steal-data.net"

];


function checkThreatIntel(email) {

 if (!email.from) {

  return {

   isMalicious: false

  };

 }


 const domain = email.from.split("@")[1];


 if (

  knownMaliciousDomains.includes(domain)

 ) {

  return {

   isMalicious: true,

   reason: "domain_blacklisted"

  };

 }


 return {

  isMalicious: false

 };

}


module.exports = checkThreatIntel;