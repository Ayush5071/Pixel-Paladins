const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const orderSchema = new mongoose.Schema({
  product : [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product"
  }],
  productname:string,
  address:String,
  username:String,
  price:Number,
  mode:String,
});

orderSchema.plugin(plm);

module.exports = mongoose.model('order', orderSchema);

