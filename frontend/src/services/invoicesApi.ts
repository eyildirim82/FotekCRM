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

export interface InvoiceStatus {
  DRAFT: 'draft'
  SENT: 'sent'
  PAID: 'paid'
  CANCELLED: 'cancelled'
}

export interface InvoiceType {
  SALES: 'sales'
  PURCHASE: 'purchase'
}

export interface VatRate {
  ZERO: 0
  TEN: 10
  TWENTY: 20
}

export interface InvoiceLine {
  id?: string
  productId?: string
  productCode?: string
  description: string
  unit?: string
  quantity: number
  unitPrice: number
  discountPercent?: number
  discountAmount?: number
  vatRate: number
  vatAmount?: number
  lineTotal?: number
  lineTotalWithVat?: number
}

export interface Invoice {
  id?: string
  invoiceNumber: string
  type: string
  status?: string
  invoiceDate: string
  dueDate?: string
  companyId?: string
  contactId?: string
  customerName?: string
  customerAddress?: string
  customerTaxNumber?: string
  lines: InvoiceLine[]
  subtotal?: number
  totalDiscount?: number
  totalVat?: number
  total?: number
  notes?: string
  terms?: string
  currency?: string
  exchangeRate?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateInvoiceData {
  invoiceNumber: string
  type: string
  status?: string
  invoiceDate: string
  dueDate?: string
  companyId?: string
  contactId?: string
  customerName?: string
  customerAddress?: string
  customerTaxNumber?: string
  lines: {
    productId?: string
    productCode?: string
    description: string
    unit?: string
    quantity: number
    unitPrice: number
    discountPercent?: number
    vatRate: number
  }[]
  notes?: string
  terms?: string
  currency?: string
  exchangeRate?: number
}

export interface InvoiceStatistics {
  totalInvoices: number
  draftInvoices: number
  paidInvoices: number
  totalAmount: number
}

class InvoicesApi {
  // Invoice listesi
  async getInvoices(page: number = 1, limit: number = 50) {
    try {
      const response = await apiClient.get(`/api/invoices?page=${page}&limit=${limit}`)
      
      return {
        success: true,
        data: {
          invoices: response.data.data || [],
          pagination: response.data.pagination || {
            page: 1,
            limit: 50,
            total: 0,
            totalPages: 0
          }
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura listesi alınamadı',
        data: {
          invoices: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
        }
      }
    }
  }

  // Tek fatura getir
  async getInvoice(id: string) {
    try {
      const response = await apiClient.get(`/api/invoices/${id}`)
      return {
        success: true,
        data: response.data.data,
        message: 'Fatura başarıyla alındı'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura alınamadı',
        data: null
      }
    }
  }

  // Fatura oluştur
  async createInvoice(invoiceData: CreateInvoiceData) {
    try {
      const response = await apiClient.post('/api/invoices', invoiceData)
      return {
        success: true,
        data: response.data.data,
        message: 'Fatura başarıyla oluşturuldu'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura oluşturulamadı',
        data: null
      }
    }
  }

  // Fatura durumu güncelle
  async updateInvoiceStatus(id: string, status: string) {
    try {
      const response = await apiClient.patch(`/api/invoices/${id}/status`, { status })
      return {
        success: true,
        data: response.data.data,
        message: 'Fatura durumu başarıyla güncellendi'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura durumu güncellenemedi',
        data: null
      }
    }
  }

  // Fatura sil
  async deleteInvoice(id: string) {
    try {
      await apiClient.delete(`/api/invoices/${id}`)
      return {
        success: true,
        message: 'Fatura başarıyla silindi'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura silinemedi'
      }
    }
  }

  // Fatura istatistikleri
  async getInvoiceStatistics() {
    try {
      const response = await apiClient.get('/api/invoices/statistics')
      return {
        success: true,
        data: {
          total: response.data.data?.totalInvoices || 0,
          draft: response.data.data?.draftInvoices || 0,
          paid: response.data.data?.paidInvoices || 0,
          totalAmount: response.data.data?.totalAmount || 0
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'İstatistikler alınamadı',
        data: { total: 0, draft: 0, paid: 0, totalAmount: 0 }
      }
    }
  }

  // Fatura numarası oluştur
  async generateInvoiceNumber(type: string = 'sales') {
    try {
      const response = await apiClient.get(`/api/invoices/generate-number/${type}`)
      return {
        success: true,
        data: response.data.data?.invoiceNumber || '',
        message: 'Fatura numarası başarıyla oluşturuldu'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Fatura numarası oluşturulamadı',
        data: ''
      }
    }
  }

  // PDF oluştur
  async generatePDF(id: string) {
    try {
      const response = await apiClient.get(`/api/invoices/${id}/pdf`)
      return {
        success: true,
        data: response.data.data?.downloadUrl || '',
        message: 'PDF başarıyla oluşturuldu'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'PDF oluşturulamadı',
        data: ''
      }
    }
  }

  // PDF download URL
  getPDFUrl(id: string): string {
    return `${apiClient.defaults.baseURL}/api/invoices/${id}/pdf`
  }
}

export const invoicesApi = new InvoicesApi() 