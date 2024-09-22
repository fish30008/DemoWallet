// models/Asset.js 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  money: { type: Number, required: true },
  interval: { type: String, required: true },
  closePriceOnStart: { type: Number, required: true },
  startTime: { type: Date, required: true }
}, { timestamps: true });

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
