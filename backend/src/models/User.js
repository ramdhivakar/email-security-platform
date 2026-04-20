const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

 email: {

  type: String,
  required: true,
  unique: true

 },

 password: {

  type: String,
  required: true

 },

 tenantId: {

  type: mongoose.Schema.Types.ObjectId,
  required: true,
  ref: "Tenant"

 },

 role: {

  type: String,

  enum: [

   "admin",
   "analyst",
   "viewer"

  ],

  default: "admin"

 }

},

{

 timestamps: true

});


module.exports = mongoose.model("User", userSchema);