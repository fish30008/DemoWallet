const axios = require('axios');

// CoinPaprika API for fetching all tickers data
const coinpaprikaAPI = "https://api.coinpaprika.com/v1/tickers";

// Fetching tickers data from CoinPaprika API
axios.get(coinpaprikaAPI)
    .then(response => {
        const data = response.data;
        
        // Display the first 10 cryptocurrencies as an example
        data.slice(0, 10).forEach((ticker, index) => {
            console.log(`Ticker ${index + 1}`);
            console.log(`ID: ${ticker.id}`);
            console.log(`Name: ${ticker.name}`);
            console.log(`Symbol: ${ticker.symbol}`);
            console.log(`Rank: ${ticker.rank}`);
            console.log(`Price (USD): ${ticker.quotes.USD.price}`);
            console.log(`24h Volume (USD): ${ticker.quotes.USD.volume_24h}`);
            console.log(`Market Cap (USD): ${ticker.quotes.USD.market_cap}`);
            console.log(`Percentage Change (24h): ${ticker.quotes.USD.percent_change_24h}`);
            console.log('------------------------------------');
        });
    })
    .catch(error => {
        console.error(`Error fetching CoinPaprika API data: ${error}`);
    });
