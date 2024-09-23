import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts';
import { calculateSMA, calculateEMA, addBuySellSignals } from './indicators';
import './ChartComponent.css'; 

const ChartComponent = ({ symbol = 'BTCUSDT' }) => {
  const [chartData, setChartData] = useState([]);
  const [timeFrame, setTimeFrame] = useState('1d');

  // Define intervals inside useEffect to avoid the dependency warning
  const intervals = React.useMemo(() => ({
    '1d': '1m',      // 1-minute interval for 1-day
    '1m': '1h',      // 1-hour interval for 1-month
    '1y': '1d',      // 1-day interval for 1-year
    'All': '1w'      // 1-week interval for All-time
  }), []);

  useEffect(() => {
    const fetchKlines = async () => {
      try {
        const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
          params: {
            symbol: symbol,
            interval: intervals[timeFrame]
          }
        });

        let formattedData = response.data.map(item => ({
          time: new Date(item[0]).toLocaleString(),
          close: parseFloat(item[4])
        }));

        // Calculate SMA, EMA, and add Buy/Sell signals
        const sma = calculateSMA(formattedData.map(d => d.close), 100);
        const ema = calculateEMA(formattedData.map(d => d.close), 21);
        const dataWithSignals = addBuySellSignals(formattedData.map(d => d.close), sma, ema);

        // Merge signals and indicator data into formattedData
        formattedData = formattedData.map((item, index) => ({
          ...item,
          sma: sma[index],
          ema: ema[index],
          buy: dataWithSignals[index].buy,
          sell: dataWithSignals[index].sell,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching klines data:', error);
      }
    };

    fetchKlines();
  }, [symbol, timeFrame, intervals]);

  const limitData = () => {
    const length = chartData.length;
    switch (timeFrame) {
      case '1d':
        return chartData.slice(length - 1440); // Approx 1440 points for 1 day
      case '1m':
        return chartData.slice(length - 720);  // Approx 720 points for 1 month
      case '1y':
        return chartData.slice(length - 365);  // Approx 365 points for 1 year
      default:
        return chartData; // All data for "All"
    }
  };

  return (
    <div className="chart-container">
      <h1>{symbol} Price Chart</h1>

      {/* Buttons to switch between time frames */}
      <div className="timeframe-buttons">
        <button onClick={() => setTimeFrame('1d')}>1 Day</button>
        <button onClick={() => setTimeFrame('1m')}>1 Month</button>
        <button onClick={() => setTimeFrame('1y')}>1 Year</button>
        <button onClick={() => setTimeFrame('All')}>All</button>
      </div>

      {/* Larger Responsive Chart */}
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={limitData()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />

          {/* Close Price Line */}
          <Line type="monotone" dataKey="close" stroke="#82ca9d" strokeWidth={2} dot={false} />
          
          {/* SMA and EMA lines */}
          <Line type="monotone" dataKey="sma" stroke="#ff7300" strokeWidth={1} dot={false} name="SMA (100)" />
          <Line type="monotone" dataKey="ema" stroke="#387908" strokeWidth={1} dot={false} name="EMA (21)" />

          {/* Buy and Sell signals */}
          <Scatter name="Buy" data={chartData.filter(d => d.buy)} fill="green" shape="triangle" />
          <Scatter name="Sell" data={chartData.filter(d => d.sell)} fill="red" shape="triangle-down" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
