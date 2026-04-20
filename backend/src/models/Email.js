const mongoose = require("mongoose");


const attachmentSchema = new mongoose.Schema({

 filename: String,

 fileType: String,

 fileSize: Number

});


const emailSchema = new mongoose.Schema({

 tenantId: {

  type: String,

  required: true,

  index: true

 },


 direction: {

  type: String,

  enum: ["inbound", "outbound"],

  default: "inbound"

 },


 from: {

  type: String,

  required: true

 },


 to: {

  type: String,

  required: true

 },


 subject: String,

 content: String,


 attachments: [attachmentSchema],


 status: {

  type: String,

  enum: [

   "pending",

   "completed",

   "quarantined",

   "released",

   "blocked"

  ],

  default: "pending"

 },


 verdict: {

  type: String,

  enum: [

   "unknown",

   "clean",

   "suspicious",

   "malicious"

  ],

  default: "unknown"

 }


}, {

 timestamps: true

});


module.exports = mongoose.model("Email", emailSchema);