const axios = require('axios');

const API_URL = 'https://api.coingecko.com/api/v3';

const createMarketParams = (query = {}) => ({
  vs_currency: 'usd',
  order: query.order || 'market_cap_desc',
  per_page: Number(query.per_page) || 50,
  page: Number(query.page) || 1,
  sparkline: query.sparkline === 'true' || false,
  price_change_percentage: query.price_change_percentage || '24h',
  ids: query.ids,
});

exports.fetchCoins = async (query = {}) => {
  const response = await axios.get(`${API_URL}/coins/markets`, {
    params: createMarketParams(query),
  });
  return response.data;
};

exports.fetchTrendingCoins = async () => {
  const response = await axios.get(`${API_URL}/search/trending`);
  return response.data.coins.map((item) => ({
    id: item.item.id,
    name: item.item.name,
    symbol: item.item.symbol,
    market_cap_rank: item.item.market_cap_rank,
    thumb: item.item.thumb,
    small: item.item.small,
    price_btc: item.item.price_btc,
  }));
};

exports.fetchSearchCoins = async (query) => {
  const response = await axios.get(`${API_URL}/search`, {
    params: {
      query,
    },
  });
  return response.data.coins;
};

exports.fetchCoinById = async (id) => {
  const response = await axios.get(`${API_URL}/coins/${id}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  });
  return response.data;
};

exports.fetchHistoricalPrices = async (id, days = 7) => {
  const response = await axios.get(`${API_URL}/coins/${id}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days,
      interval: 'daily',
    },
  });
  return {
    id,
    days,
    prices: response.data.prices,
    market_caps: response.data.market_caps,
    total_volumes: response.data.total_volumes,
  };
};

const fetchTopMovers = async (direction, limit = 10) => {
  const coins = await exports.fetchCoins({ per_page: 100, page: 1, price_change_percentage: '24h' });
  const sorted = coins
    .filter((coin) => typeof coin.price_change_percentage_24h === 'number')
    .sort((a, b) => {
      return direction === 'gainers'
        ? b.price_change_percentage_24h - a.price_change_percentage_24h
        : a.price_change_percentage_24h - b.price_change_percentage_24h;
    });
  return sorted.slice(0, limit);
};

exports.fetchTopGainers = async (limit = 10) => fetchTopMovers('gainers', limit);
exports.fetchTopLosers = async (limit = 10) => fetchTopMovers('losers', limit);
