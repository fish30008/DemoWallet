const getData = async (symbol, interval) => {
  try {
    const resp = await fetch(`http://127.0.0.1:3000/${symbol}/${interval}`);
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('Error fetching data:', err);
    return [];
  }
};

const renderChart = async (symbol = 'BTCUSDT', interval = '1m') => {
  const chartProperties = {
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
    },
    pane: 0,
  };
  
  const domElement = document.getElementById('tvchart');
  domElement.innerHTML = "";  // Clear the existing chart
  const chart = LightweightCharts.createChart(domElement, chartProperties);
  
  // Candle series for the main chart
  const candleseries = chart.addCandlestickSeries();
  
  // Fetch the new data for the selected symbol and interval
  const klinedata = await getData(symbol, interval);
  
  if (!Array.isArray(klinedata) || klinedata.length === 0) {
    console.error("Invalid data returned from server.");
    return;
  }

  // Set candlestick data
  candleseries.setData(klinedata);

  // Add SMA series
  const sma_series = chart.addLineSeries({ color: 'red', lineWidth: 1 });
  const sma_data = klinedata
    .filter((d) => d.sma)
    .map((d) => ({ time: d.time, value: d.sma }));
  sma_series.setData(sma_data);

  // Add EMA series
  const ema_series = chart.addLineSeries({ color: 'green', lineWidth: 1 });
  const ema_data = klinedata
    .filter((d) => d.ema)
    .map((d) => ({ time: d.time, value: d.ema }));
  ema_series.setData(ema_data);

  // Set markers for LONG/SHORT positions
  candleseries.setMarkers(
    klinedata
      .filter((d) => d.long || d.short)
      .map((d) =>
        d.long
          ? {
              time: d.time,
              position: 'belowBar',
              color: 'green',
              shape: 'arrowUp',
              text: 'LONG',
            }
          : {
              time: d.time,
              position: 'aboveBar',
              color: 'red',
              shape: 'arrowDown',
              text: 'SHORT',
            }
      )
  );

  // Add RSI series
  const rsi_series = chart.addLineSeries({
    color: 'purple',
    lineWidth: 1,
    pane: 1,  // Create a second pane for RSI
  });
  const rsi_data = klinedata
    .filter((d) => d.rsi)
    .map((d) => ({ time: d.time, value: d.rsi }));
  rsi_series.setData(rsi_data);

  // Add MACD fast line
  const macd_fast_series = chart.addLineSeries({
    color: 'blue',
    lineWidth: 1,
    pane: 2,  // Create a third pane for MACD
  });
  const macd_fast_data = klinedata
    .filter((d) => d.macd_fast)
    .map((d) => ({ time: d.time, value: d.macd_fast }));
  macd_fast_series.setData(macd_fast_data);

  // Add MACD slow line
  const macd_slow_series = chart.addLineSeries({
    color: 'red',
    lineWidth: 1,
    pane: 2,
  });
  const macd_slow_data = klinedata
    .filter((d) => d.macd_slow)
    .map((d) => ({ time: d.time, value: d.macd_slow }));
  macd_slow_series.setData(macd_slow_data);

  // Add MACD histogram
  const macd_histogram_series = chart.addHistogramSeries({
    pane: 2,
  });
  const macd_histogram_data = klinedata
    .filter((d) => d.macd_histogram)
    .map((d) => ({
      time: d.time,
      value: d.macd_histogram,
      color: d.macd_histogram > 0 ? 'green' : 'red',
    }));
  macd_histogram_series.setData(macd_histogram_data);
};

// Call this function with new parameters to update the chart
