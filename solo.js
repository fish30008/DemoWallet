const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const Post = require('./models/post');
const Asset = require('./models/assets');


const path = require('path');

const app = express();

// Set view engine to ejs and configure views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const db = "mongodb+srv://fishman:ratata123@cluster0.pi4nu.mongodb.net/Wallet?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log(error));

// Simulate trade function (Parameters can now be set dynamically)
async function simulateTrade(startTime, symbol, interval, money) {
  try {
    // Fetch klines data for the provided date
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: symbol,
        interval: interval,
        startTime: new Date(startTime).getTime(),
      }
    });

    const klines = response.data;

    // Get the close price for the specified date
    const closePriceOnStart = parseFloat(klines[0][4]).toFixed(2);
    console.log(`Close price on ${startTime}: ${closePriceOnStart} USDT`);

    // Fetch the current BTC price
    const currentPriceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: symbol }
    });

    const currentPrice = parseFloat(currentPriceResponse.data.price);
    console.log(`Current ${symbol} price: ${currentPrice} USDT`);

    // Simulate buying and selling with the user-provided money
    const quantity = money / closePriceOnStart;
    const profitOrLoss = (currentPrice - closePriceOnStart) * quantity;

    console.log(`Profit/Loss if you bought ${quantity} ${symbol} on ${startTime} and sold today: ${profitOrLoss} USDT`);
    return { profitOrLoss, quantity };  // Return both profitOrLoss and quantity

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

// Routes
app.get("/", (req, res) => {
  res.render('form');
});

app.get('/wallet', async (req, res) => {
  try {
    const assets = await Asset.find(); // Fetch all assets
    const posts = await Post.find();
    res.render('wallet', { posts, assets });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});


app.post('/form', async (req, res) => {
  const { startTime, symbol, interval, money } = req.body;  // Get money from form
  try {
    const { profitOrLoss, quantity } = await simulateTrade(startTime, symbol, interval, money);  // Pass money and receive quantity
    const post = new Post({ startTime, symbol, interval, profitOrLoss, money, quantity });  // Store quantity and money
    await post.save();
    res.send(`Profit/Loss: ${profitOrLoss} USDT`);
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});


//buying
// Buying route
app.post('/buy', async (req, res) => {
  const { symbol, money } = req.body; // User specifies symbol and money to invest
  const interval = '1m'; // Using 1-minute interval for current price data
  const startTime = Date.now(); // Get current timestamp
  
  try {
    // Fetch current price (real-time price for the symbol)
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: symbol }
    });

    const closePriceOnStart = parseFloat(response.data.price); // Get the close price
    console.log(`Close price on start for ${symbol}: ${closePriceOnStart} USDT`);

    // Calculate the quantity of cryptocurrency bought
    const quantity = money / closePriceOnStart;

    // Save the transaction in the 'Asset' collection
    const asset = new Asset({
      symbol,
      quantity,
      money,
      interval, // Still keeping interval if needed
      closePriceOnStart,
      startTime: new Date(startTime) // Storing the start time
    });

    await asset.save();

    // Send a success response with the transaction details
    res.send(`Bought ${quantity} ${symbol} at ${closePriceOnStart} USDT`);

  } catch (error) {
    console.error('Error during buying:', error);
    res.render('error', { error });
  }
});





//seling
app.post('/sell/:id', async (req, res) => {
  const assetId = req.params.id;

  try {
    // Find the asset by its ID
    const asset = await Asset.findById(assetId);

    if (!asset) {
      return res.status(404).send('Asset not found');
    }

    // Fetch current price
    const currentPriceResponse = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbol: asset.symbol }
    });

    const currentPrice = parseFloat(currentPriceResponse.data.price);

    // Calculate profit or loss
    const profitOrLoss = (currentPrice - asset.closePriceOnStart) * asset.quantity;

    // Save the transaction to the Post collection
    const post = new Post({
      startTime: asset.startTime,
      symbol: asset.symbol,
      interval: asset.interval,
      profitOrLoss,
      money: asset.money,
      quantity: asset.quantity
    });
    await post.save();

    // Remove the asset from the assets collection
    await Asset.findByIdAndDelete(assetId);

    res.send(`Sold ${asset.symbol} with a profit/loss of ${profitOrLoss} USDT`);
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
