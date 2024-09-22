const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    startTime: {
        type: Date,  // Using Date type to store timestamp
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    interval: {
        type: String,
        required: true,
    },
    profitOrLoss: {
        type: Number,  // Storing profit/loss as a number (float)
        required: true,
    },
    money: {
        type: Number,  // Storing money used in trade
        required: true,
    },
    quantity: {
        type: Number,  // Storing quantity of crypto bought
        required: true,
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt timestamps

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
