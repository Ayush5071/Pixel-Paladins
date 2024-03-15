const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    seller: {
        //reference liya hai seller.js ki uski id yha save ho jayegi ...samjhe
        type: mongoose.Schema.Types.ObjectId,
        ref: "seller"
      },
    type: { type: String, },
    price: { type: Number, required: true },
    description: { type: String },
    likes: { type: Number },
    title: { type: String, required: true },
    productImage: { type: String },
    purchases: { type: Number, default: 0 },
    reviews: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    reviewImage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    brand:String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
