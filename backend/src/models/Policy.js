const mongoose = require("mongoose");

/*
================================================

POLICY MODEL

Stores company level email security rules

Each tenant can define their own rules

================================================
*/

const policySchema = new mongoose.Schema({

 tenantId: {

  type: mongoose.Schema.Types.ObjectId,

  ref: "Tenant",

  required: true,

  unique: true

 },


 blockExecutable: {

  type: Boolean,

  default: true

 },


 maxAttachmentSize: {

  type: Number,

  default: 5000000
 },


 blockedDomains: [

  {

   type: String

  }

 ],


 allowedFileTypes: [

  {

   type: String

  }

 ],


 createdAt: {

  type: Date,

  default: Date.now

 }

});


module.exports = mongoose.model("Policy", policySchema);