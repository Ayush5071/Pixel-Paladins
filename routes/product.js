const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    likes: { type: Number, required: true },
    title: { type: String, required: true },
    productImage: { type: String },
    purchases: { type: Number, default: 0 },
    reviews: {
        type:Array,
        default:[]
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
