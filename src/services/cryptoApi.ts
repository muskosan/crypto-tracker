// CoinGecko API service for fetching live cryptocurrency data
export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  total_volume: number;
  image: string;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface GlobalMarketData {
  data: {
    total_market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    market_cap_percentage: {
      btc: number;
    };
    active_cryptocurrencies: number;
    market_cap_change_percentage_24h_usd: number;
  };
}

export interface CoinDetailData {
  id: string;
  name: string;
  symbol: string;
  description: {
    en: string;
  };
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    price_change_percentage_1y: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: {
      usd: number;
    };
    atl: {
      usd: number;
    };
  };
}

import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9a7f9b62/api`;

const getHeaders = () => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

export class CryptoAPI {
  static async getGlobalMarketData(): Promise<GlobalMarketData> {
    const response = await fetch(`${BASE_URL}/global`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch global market data');
    }
    return response.json();
  }

  static async getCoins(
    page: number = 1,
    perPage: number = 100,
    sortBy: string = 'market_cap_desc'
  ): Promise<CoinData[]> {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      order: sortBy,
      per_page: perPage.toString(),
      page: page.toString(),
      sparkline: 'true',
      price_change_percentage: '7d'
    });

    const response = await fetch(`${BASE_URL}/coins/markets?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch coins data');
    }
    return response.json();
  }

  static async getCoinById(id: string): Promise<CoinDetailData> {
    const params = new URLSearchParams({
      localization: 'false',
      tickers: 'false',
      market_data: 'true',
      community_data: 'false',
      developer_data: 'false'
    });

    const response = await fetch(`${BASE_URL}/coins/${id}?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data for coin: ${id}`);
    }
    return response.json();
  }

  static async getCoinHistory(id: string, days: number = 7): Promise<number[][]> {
    const params = new URLSearchParams({
      vs_currency: 'usd',
      days: days.toString()
    });

    const response = await fetch(`${BASE_URL}/coins/${id}/market_chart?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch history for coin: ${id}`);
    }
    const data = await response.json();
    return data.prices;
  }

  static async searchCoins(query: string): Promise<any> {
    const params = new URLSearchParams({
      query: query
    });

    const response = await fetch(`${BASE_URL}/search?${params}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to search coins');
    }
    return response.json();
  }
}