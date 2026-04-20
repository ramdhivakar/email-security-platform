const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({

 filename: String,

 fileType: String,

 fileSize: Number

});

const authSchema = new mongoose.Schema({

 spf: {

  type: String,

  enum: ["pass", "fail"],

  default: "pass"

 },

 dkim: {

  type: String,

  enum: ["pass", "fail"],

  default: "pass"

 },

 dmarc: {

  type: String,

  enum: ["pass", "fail"],

  default: "pass"

 }

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

 from: String,

 to: String,

 subject: String,

 content: String,

 attachments: [attachmentSchema],

 authentication: authSchema,

 status: {

  type: String,

  enum: [

   "pending",

   "completed",

   "quarantined",

   "blocked",

   "released"

  ],

  default: "pending"

 },

 verdict: {

  type: String,

  enum: [

   "clean",

   "suspicious",

   "malicious"

  ],

  default: "clean"

 }

}, {

 timestamps: true

});


module.exports = mongoose.model("Email", emailSchema);