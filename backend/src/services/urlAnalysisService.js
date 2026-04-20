/*
================================================

URL PHISHING DETECTION ENGINE

================================================
*/

const suspiciousDomains = [

 "secure-login",

 "account-verify",

 "update-password",

 "login-check",

 "verify-account",

 "security-alert",

 "wallet-confirm"

];


const urlShorteners = [

 "bit.ly",

 "tinyurl.com",

 "t.co",

 "goo.gl",

 "rebrand.ly"

];


const trustedDomains = [

 "google.com",

 "microsoft.com",

 "amazon.com",

 "github.com",

 "linkedin.com"

];


function extractUrls(text) {

 const regex = /(https?:\/\/[^\s]+)/g;

 return text.match(regex) || [];

}


function analyzeUrls(content) {

 let score = 0;

 const urls = extractUrls(content);


 const results = [];


 urls.forEach(url => {

  const domain = url.split("/")[2];


  let risk = "clean";


  /*
  shortener check
  */

  if (

   urlShorteners.includes(domain)

  ) {

   score += 3;

   risk = "suspicious";

  }


  /*
  suspicious keyword domain
  */

  suspiciousDomains.forEach(pattern => {

   if (

    domain.includes(pattern)

   ) {

    score += 5;

    risk = "malicious";

   }

  });


  /*
  fake trusted domain check
  */

  trustedDomains.forEach(trusted => {

   if (

    domain.includes(trusted) &&

    domain !== trusted

   ) {

    score += 4;

    risk = "suspicious";

   }

  });


  results.push({

   url,

   domain,

   risk

  });

 });


 /*
 final verdict
 */

 let verdict = "clean";


 if (score >= 6) {

  verdict = "malicious";

 }

 else if (score >= 3) {

  verdict = "suspicious";

 }


 return {

  verdict,

  urls: results

 };

}


module.exports = analyzeUrls;