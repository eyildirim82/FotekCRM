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

export enum ContactType {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  DECISION_MAKER = 'decision_maker',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  OTHER = 'other'
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LEFT_COMPANY = 'left_company',
  NO_CONTACT = 'no_contact'
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  jobTitle?: string
  department?: string
  contactType: ContactType
  status: ContactStatus
  isPrimary: boolean
  isActive: boolean
  linkedInUrl?: string
  skype?: string
  address?: string
  birthDate?: string
  notes?: string
  companyId: string
  createdById: string
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
    status: string
  }
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  fullName: string
  displayName: string
}

export interface CreateContactRequest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  jobTitle?: string
  department?: string
  contactType?: ContactType
  status?: ContactStatus
  isPrimary?: boolean
  isActive?: boolean
  linkedInUrl?: string
  skype?: string
  address?: string
  birthDate?: string
  notes?: string
  companyId: string
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface ContactListResponse {
  success: boolean
  message: string
  data: {
    contacts: Contact[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface ContactResponse {
  success: boolean
  message: string
  data: Contact
}

export interface ContactStatsResponse {
  success: boolean
  message: string
  data: {
    total: number
    employees: number
    managers: number
    decisionMakers: number
    active: number
    inactive: number
  }
}

class ContactService {
  // Get all contacts with pagination and filters
  async getContacts(params?: {
    page?: number
    limit?: number
    search?: string
    companyId?: string
    contactType?: ContactType
    status?: ContactStatus
  }): Promise<ContactListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.companyId) queryParams.append('companyId', params.companyId)
      if (params?.contactType) queryParams.append('contactType', params.contactType)
      if (params?.status) queryParams.append('status', params.status)

      const response = await apiClient.get(`/api/contacts?${queryParams.toString()}`)
      return response.data
    } catch (error: any) {
      console.error('Get contacts error:', error)
      throw new Error(this.getErrorMessage(error, 'Kişiler listelenirken hata oluştu'))
    }
  }

  // Get single contact by ID
  async getContact(id: string): Promise<ContactResponse> {
    try {
      const response = await apiClient.get(`/api/contacts/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Get contact error:', error)
      throw new Error(this.getErrorMessage(error, 'Kişi bilgileri alınırken hata oluştu'))
    }
  }

  // Create new contact
  async createContact(data: CreateContactRequest): Promise<ContactResponse> {
    try {
      const response = await apiClient.post(`/api/contacts`, data)
      return response.data
    } catch (error: any) {
      console.error('Create contact error:', error)
      throw new Error(this.getErrorMessage(error, 'Kişi oluşturulurken hata oluştu'))
    }
  }

  // Update contact
  async updateContact(id: string, data: UpdateContactRequest): Promise<ContactResponse> {
    try {
      const response = await apiClient.patch(`/api/contacts/${id}`, data)
      return response.data
    } catch (error: any) {
      console.error('Update contact error:', error)
      throw new Error(this.getErrorMessage(error, 'Kişi güncellenirken hata oluştu'))
    }
  }

  // Delete contact (soft delete)
  async deleteContact(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/contacts/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Delete contact error:', error)
      throw new Error(this.getErrorMessage(error, 'Kişi silinirken hata oluştu'))
    }
  }

  // Get contact statistics
  async getContactStats(companyId?: string): Promise<ContactStatsResponse> {
    try {
      const queryParams = companyId ? `?companyId=${companyId}` : ''
      const response = await apiClient.get(`/api/contacts/stats${queryParams}`)
      return response.data
    } catch (error: any) {
      console.error('Get contact stats error:', error)
      throw new Error(this.getErrorMessage(error, 'İstatistikler alınırken hata oluştu'))
    }
  }

  // Get contacts by company
  async getContactsByCompany(companyId: string): Promise<ContactResponse[]> {
    try {
      const response = await apiClient.get(`/api/contacts/company/${companyId}`)
      return response.data.data || []
    } catch (error: any) {
      console.error('Get company contacts error:', error)
      throw new Error(this.getErrorMessage(error, 'Firma kişileri alınırken hata oluştu'))
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
      return 'Aradığınız kişi bulunamadı.'
    }
    if (error.code === 'ECONNREFUSED') {
      return 'Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.'
    }
    return defaultMessage
  }

  // Helper: Get contact type text
  getContactTypeText(type: ContactType): string {
    const texts = {
      [ContactType.EMPLOYEE]: 'Çalışan',
      [ContactType.MANAGER]: 'Yönetici',
      [ContactType.DECISION_MAKER]: 'Karar Verici',
      [ContactType.TECHNICAL]: 'Teknik',
      [ContactType.FINANCIAL]: 'Mali İşler',
      [ContactType.OTHER]: 'Diğer'
    }
    return texts[type] || type
  }

  // Helper: Get contact status text
  getContactStatusText(status: ContactStatus): string {
    const texts = {
      [ContactStatus.ACTIVE]: 'Aktif',
      [ContactStatus.INACTIVE]: 'Pasif',
      [ContactStatus.LEFT_COMPANY]: 'Ayrıldı',
      [ContactStatus.NO_CONTACT]: 'İletişim Yok'
    }
    return texts[status] || status
  }

  // Helper: Get contact type color
  getContactTypeColor(type: ContactType): string {
    const colors = {
      [ContactType.EMPLOYEE]: 'blue',
      [ContactType.MANAGER]: 'purple',
      [ContactType.DECISION_MAKER]: 'red',
      [ContactType.TECHNICAL]: 'cyan',
      [ContactType.FINANCIAL]: 'orange',
      [ContactType.OTHER]: 'default'
    }
    return colors[type] || 'default'
  }

  // Helper: Get contact status color
  getContactStatusColor(status: ContactStatus): string {
    const colors = {
      [ContactStatus.ACTIVE]: 'green',
      [ContactStatus.INACTIVE]: 'default',
      [ContactStatus.LEFT_COMPANY]: 'red',
      [ContactStatus.NO_CONTACT]: 'orange'
    }
    return colors[status] || 'default'
  }
}

export const contactService = new ContactService()
export default contactService 