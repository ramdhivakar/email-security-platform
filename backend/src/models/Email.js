const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({

 tenantId: {

  type: mongoose.Schema.Types.ObjectId,

  ref: "Tenant",

  required: true

 },


 from: {

  type: String,

  required: true

 },


 to: {

  type: String,

  required: true

 },


 subject: {

  type: String

 },


 content: {

  type: String

 },


 attachments: [

  {

   filename: String,

   fileType: String,

   fileSize: Number

  }

 ],


 status: {

  type: String,

  default: "pending"

 },


 verdict: {

  type: String,

  default: "unknown"

 },


 createdAt: {

  type: Date,

  default: Date.now

 }

});

module.exports = mongoose.model("Email", emailSchema);