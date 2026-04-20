const DomainReputation = require("../models/DomainReputation");


/*
=================================

DOMAIN REPUTATION CHECK

=================================
*/

async function checkDomainReputation(domain) {

 const record = await DomainReputation.findOne({

  domain

 });


 if (!record) {

  return {

   reputation: "neutral",

   riskScore: 0

  };

 }


 return {

  reputation: record.reputation,

  riskScore: record.riskScore,

  category: record.category

 };

}


module.exports = checkDomainReputation;