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

export interface Company {
  id: string
  name: string
  taxNumber?: string
  industry?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  notes?: string
  isActive: boolean
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  createdById: string
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface CreateCompanyRequest {
  name: string
  taxNumber?: string
  industry?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  notes?: string
  isActive?: boolean
  status?: 'lead' | 'prospect' | 'customer' | 'inactive'
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export interface CompanyListResponse {
  success: boolean
  message: string
  data: {
    companies: Company[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface CompanyResponse {
  success: boolean
  message: string
  data: Company
}

export interface CompanyStatsResponse {
  success: boolean
  message: string
  data: {
    total: number
    leads: number
    prospects: number
    customers: number
    inactive: number
  }
}

class CompanyService {
  // Get all companies with pagination and filters
  async getCompanies(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    userId?: string
  }): Promise<CompanyListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.userId) queryParams.append('userId', params.userId)

      const response = await apiClient.get(`/api/companies?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      console.error('Get companies error:', error)
      throw new Error(this.getErrorMessage(error, 'Firmalar listelenirken hata oluştu'))
    }
  }

  // Get single company by ID
  async getCompany(id: string): Promise<CompanyResponse> {
    try {
      const response = await apiClient.get(`/api/companies/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Get company error:', error)
      throw new Error(this.getErrorMessage(error, 'Firma bilgileri alınırken hata oluştu'))
    }
  }

  // Create new company
  async createCompany(data: CreateCompanyRequest): Promise<CompanyResponse> {
    try {
      const response = await apiClient.post(`/api/companies`, data)
      return response.data
    } catch (error: any) {
      console.error('Create company error:', error)
      throw new Error(this.getErrorMessage(error, 'Firma oluşturulurken hata oluştu'))
    }
  }

  // Update company
  async updateCompany(id: string, data: UpdateCompanyRequest): Promise<CompanyResponse> {
    try {
      const response = await apiClient.patch(`/api/companies/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Update company error:', error)
      throw new Error(this.getErrorMessage(error, 'Firma güncellenirken hata oluştu'))
    }
  }

  // Delete company (soft delete)
  async deleteCompany(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/companies/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Delete company error:', error)
      throw new Error(this.getErrorMessage(error, 'Firma silinirken hata oluştu'))
    }
  }

  // Get company statistics
  async getCompanyStats(userId?: string): Promise<CompanyStatsResponse> {
    try {
      const queryParams = userId ? `?userId=${userId}` : ''
      const response = await apiClient.get(`/api/companies/stats${queryParams}`)
      return response.data
    } catch (error: any) {
      console.error('Get company stats error:', error)
      throw new Error(this.getErrorMessage(error, 'İstatistikler alınırken hata oluştu'))
    }
  }

  // Helper method for error messages
  private getErrorMessage(error: any, defaultMessage: string): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.status === 401) {
      return 'Yetkiniz bulunmuyor. Lütfen tekrar giriş yapın.'
    }
    if (error.response?.status === 403) {
      return 'Bu işlem için yetkiniz bulunmuyor.'
    }
    if (error.response?.status === 404) {
      return 'Aradığınız firma bulunamadı.'
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.'
    }
    return defaultMessage
  }
}

export const companyService = new CompanyService()
export default companyService 