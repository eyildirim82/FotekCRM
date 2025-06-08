import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fotek_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('fotek_auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ExchangeRateFilters {
  currency?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExchangeRateStats {
  totalRates: number;
  currencies: number;
  lastUpdateDate: string;
  rates: {
    [key: string]: {
      buyingRate: number;
      sellingRate: number;
      changeFromPreviousDay?: number;
      changePercent?: number;
    };
  };
}

export interface ExchangeRate {
  id: number;
  currency: string;
  buyingRate: number;
  sellingRate: number;
  effectiveBuyingRate?: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRatesResponse {
  data: ExchangeRate[];
  total: number;
  page: number;
  limit: number;
}

export const exchangeRatesApi = {
  // Tüm kur bilgilerini getir
  getExchangeRates: async (params: ExchangeRateFilters = {}): Promise<ExchangeRatesResponse> => {
    try {
      const response = await apiClient.get('/api/exchange-rates', { params });
      return response.data;
    } catch (error) {
      console.error('Exchange rates fetch error:', error);
      throw error;
    }
  },

  // Desteklenen para birimlerini getir
  getSupportedCurrencies: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/api/exchange-rates/currencies/supported');
      return response.data;
    } catch (error) {
      console.error('Supported currencies fetch error:', error);
      throw error;
    }
  },

  // Kur istatistiklerini getir
  getExchangeRateStats: async (): Promise<ExchangeRateStats> => {
    try {
      const response = await apiClient.get('/api/exchange-rates/stats/summary');
      return response.data;
    } catch (error) {
      console.error('Exchange rate stats fetch error:', error);
      throw error;
    }
  },

  // Belirli bir para biriminin kurunu getir
  getCurrencyRate: async (currency: string): Promise<ExchangeRate> => {
    try {
      const response = await apiClient.get(`/api/exchange-rates/latest/${currency}`);
      return response.data;
    } catch (error) {
      console.error(`Currency ${currency} rate fetch error:`, error);
      throw error;
    }
  },

  // TCMB senkronizasyonunu tetikle
  triggerSync: async (): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/api/exchange-rates/sync');
      return response.data;
    } catch (error) {
      console.error('TCMB sync error:', error);
      throw error;
    }
  },

  // Günlük kurları getir
  getLatestRates: async (): Promise<ExchangeRate[]> => {
    try {
      const response = await apiClient.get('/api/exchange-rates/latest/all');
      return response.data;
    } catch (error) {
      console.error('Latest rates fetch error:', error);
      throw error;
    }
  }
}; 