import axios, { AxiosInstance } from 'axios'

// Analytics interfaces
export interface DashboardMetrics {
  totalRevenue: number
  monthlyRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalInvoices: number
  averageOrderValue: number
  monthlyGrowth: number
}

export interface SalesChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }>
}

export interface TopCustomer {
  id: string
  name: string
  totalSpent: number
  orderCount: number
}

export interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}

export interface RecentActivity {
  recentOrders: Array<{
    id: number
    type: string
    title: string
    description: string
    date: string
    status: string
  }>
  recentInvoices: Array<{
    id: string
    type: string
    title: string
    description: string
    date: string
    status: string
  }>
}

// Create axios instance with auth interceptor
const createApiInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('fotek_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('fotek_token')
        localStorage.removeItem('fotek_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return api
}

const api = createApiInstance()

export const analyticsApi = {
  // Get dashboard metrics
  getDashboardMetrics: async () => {
    try {
      const response = await api.get('/api/analytics/dashboard-metrics')
      return {
        success: true,
        data: response.data.data as DashboardMetrics
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Dashboard metrics alınamadı',
        error: error.message
      }
    }
  },

  // Get sales chart data
  getSalesChart: async () => {
    try {
      const response = await api.get('/api/analytics/sales-chart')
      return {
        success: true,
        data: response.data.data as SalesChartData
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Satış grafiği verisi alınamadı',
        error: error.message
      }
    }
  },

  // Get top customers
  getTopCustomers: async (limit = 5) => {
    try {
      const response = await api.get(`/api/analytics/top-customers?limit=${limit}`)
      return {
        success: true,
        data: response.data.data as TopCustomer[]
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'En iyi müşteri listesi alınamadı',
        error: error.message
      }
    }
  },

  // Get top products
  getTopProducts: async (limit = 5) => {
    try {
      const response = await api.get(`/api/analytics/top-products?limit=${limit}`)
      return {
        success: true,
        data: response.data.data as TopProduct[]
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'En çok satan ürün listesi alınamadı',
        error: error.message
      }
    }
  },

  // Get invoice status chart
  getInvoiceStatusChart: async () => {
    try {
      const response = await api.get('/api/analytics/invoice-status-chart')
      return {
        success: true,
        data: response.data.data as SalesChartData
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura durum grafiği alınamadı',
        error: error.message
      }
    }
  },

  // Get recent activity
  getRecentActivity: async () => {
    try {
      const response = await api.get('/api/analytics/recent-activity')
      return {
        success: true,
        data: response.data.data as RecentActivity
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Son aktiviteler alınamadı',
        error: error.message
      }
    }
  }
}

export default analyticsApi 