const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({

 companyName: {
  type: String,
  required: true
 },

 domain: {
  type: String,
  required: true,
  unique: true
 },

 plan: {
  type: String,
  default: "basic"
 },

 createdAt: {
  type: Date,
  default: Date.now
 }

});

module.exports = mongoose.model("Tenant", tenantSchema);