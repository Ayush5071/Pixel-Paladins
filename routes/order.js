const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const orderSchema = new mongoose.Schema({
  product : {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  productname:String,
  address:String,
  username:String,
  price:Number,
  mode:String,
  contact:Number,
  productImage:String,
  status:String
});

orderSchema.plugin(plm);

module.exports = mongoose.model('order', orderSchema);

