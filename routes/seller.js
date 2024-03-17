// models/seller.js
const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const sellerSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profileImage:String,
  products : [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  }],
  sales:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"order"
  }],
  brandname:String
});
sellerSchema.plugin(plm);
module.exports = mongoose.model('Seller', sellerSchema);