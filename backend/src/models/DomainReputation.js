const mongoose = require("mongoose");


const domainReputationSchema = new mongoose.Schema({

 domain: {

  type: String,

  required: true,

  unique: true,

  index: true

 },


 reputation: {

  type: String,

  enum: [

   "trusted",
   "neutral",
   "suspicious",
   "malicious"

  ],

  default: "neutral"

 },


 category: {

  type: String,

  enum: [

   "phishing",
   "malware",
   "spam",
   "typosquat",
   "legitimate"

  ]

 },


 riskScore: {

  type: Number,

  default: 0

 },


 source: {

  type: String,

  default: "internal"

 }

},
{

 timestamps: true

});


module.exports = mongoose.model(

 "DomainReputation",

 domainReputationSchema

);