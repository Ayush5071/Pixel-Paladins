const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
    product:String,
    productid:String,
    // purchases: { type: Number, default: 0 },
    reviews:String,
    reviewImage:{ 
        type:String
    },
    userImage:String
});

const review = mongoose.model('review', reviewSchema);

module.exports = review;
