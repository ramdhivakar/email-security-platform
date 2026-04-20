const mongoose = require("mongoose");


const logSchema = new mongoose.Schema({

 tenantId: {

  type: mongoose.Schema.Types.ObjectId,

  required: true,

  index: true

 },


 type: {

  type: String,

  enum: [

   "email_scan",

   "email_auth",

   "sandbox_scan",

   "threat_intel",

   "smtp_connection",

   "smtp_processing",

   "policy_update",

   "quarantine_action",

   "system"

  ],

  required: true

 },


 severity: {

  type: String,

  enum: [

   "info",

   "warning",

   "critical"

  ],

  default: "info"

 },


 message: {

  type: String,

  required: true

 },


 metadata: {

  type: Object,

  default: {}

 }

},

{

 timestamps: true

});


module.exports = mongoose.model("Log", logSchema);