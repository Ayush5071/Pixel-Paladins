const mongoose = require('mongoose')
const plm = require("passport-local-mongoose")
mongoose.connect("mongodb://localhost:27017/shadowmartsec")
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: {
    type:String,
    default:"defaultpic.jpg"
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product'
  }],
  number: Number,
  // purchases: {
  //   type:Array,
  //   default:[]
  // },
  orders:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"order"
  }]
});
userSchema.plugin(plm) //this is also required 
module.exports = mongoose.model("user",userSchema)