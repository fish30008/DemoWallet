export const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(null); // Not enough data to calculate SMA
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  };
  
  export const calculateEMA = (data, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    const sma = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
    ema[period - 1] = sma;
  
    for (let i = period; i < data.length; i++) {
      const todayPrice = data[i];
      const yesterdayEMA = ema[i - 1];
      ema.push((todayPrice - yesterdayEMA) * multiplier + yesterdayEMA);
    }
  
    for (let i = 0; i < period - 1; i++) {
      ema.unshift(null);
    }
  
    return ema;
  };
  
  export const addBuySellSignals = (data, sma, ema) => {
    return data.map((price, i) => {
      const buySignal = ema[i] > sma[i] && ema[i - 1] <= sma[i - 1];
      const sellSignal = ema[i] < sma[i] && ema[i - 1] >= sma[i - 1];
  
      return {
        price,
        sma: sma[i],
        ema: ema[i],
        buy: buySignal ? 'Buy' : '',
        sell: sellSignal ? 'Sell' : '',
      };
    });
  };
  