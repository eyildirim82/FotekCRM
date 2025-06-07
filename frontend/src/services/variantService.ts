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

// Enums
export enum VariantAttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  COLOR = 'color'
}

export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

export enum VariantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

// Interfaces
export interface ProductVariant {
  id: number
  sku: string
  color?: string
  size?: string
  capacity?: string
  material?: string
  style?: string
  unitPrice: number
  currency: string
  stockQuantity: number
  minStockLevel: number
  isActive: boolean
  imageUrl?: string
  notes?: string
  productId: number
  createdById: string
  updatedById?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  
  // Relations
  product?: {
    id: number
    name: string
    code: string
    brand?: string
  }
  createdBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  updatedBy?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  
  // Computed properties
  totalValue?: number
  status?: VariantStatus
}

export interface VariantAttribute {
  id: number
  name: string
  type: VariantAttributeType
  description?: string
  values: string // JSON string of array
  sortOrder: number
  isActive: boolean
  isRequired: boolean
  allowCustomValues: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateVariantRequest {
  sku: string
  color?: string
  size?: string
  capacity?: string
  material?: string
  style?: string
  unitPrice: number
  currency?: string
  stockQuantity?: number
  minStockLevel?: number
  isActive?: boolean
  imageUrl?: string
  notes?: string
  productId: number
}

export interface UpdateVariantRequest extends Partial<CreateVariantRequest> {}

export interface VariantListResponse {
  success: boolean
  message: string
  data: {
    variants: ProductVariant[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface VariantResponse {
  success: boolean
  message: string
  data: ProductVariant
}

export interface VariantStatsResponse {
  success: boolean
  message: string
  data: {
    total: number
    active: number
    inactive: number
    lowStock: number
    outOfStock: number
    totalValue: number
    averagePrice: number
  }
}

export interface VariantAttributeResponse {
  success: boolean
  message: string
  data: VariantAttribute[]
}

class VariantService {
  
  // Get variants with pagination and filters
  async getVariants(params?: {
    page?: number
    limit?: number
    search?: string
    color?: string
    size?: string
    material?: string
    isActive?: boolean
    minPrice?: number
    maxPrice?: number
    productId?: number
  }): Promise<VariantListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.color) queryParams.append('color', params.color)
      if (params?.size) queryParams.append('size', params.size)
      if (params?.material) queryParams.append('material', params.material)
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString())
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
      if (params?.productId) queryParams.append('productId', params.productId.toString())
      
      const url = `/api/variants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get(url)
      
      // Transform backend response to expected format
      const enhancedData = {
        success: true,
        message: 'Varyantlar başarıyla listelendi',
        data: {
          variants: response.data.data.map((variant: ProductVariant) => this.enhanceVariant(variant)),
          pagination: {
            page: response.data.page,
            limit: response.data.limit,
            total: response.data.total,
            pages: response.data.totalPages
          }
        }
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Get variants error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyantlar listelenirken hata oluştu'))
    }
  }

  // Get single variant by ID
  async getVariant(id: number): Promise<VariantResponse> {
    try {
      const response = await apiClient.get(`/api/variants/${id}`)
      
      const enhancedData = {
        success: true,
        message: 'Varyant başarıyla alındı',
        data: this.enhanceVariant(response.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Get variant error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant bilgileri alınırken hata oluştu'))
    }
  }

  // Get variants by product ID
  async getVariantsByProduct(productId: number): Promise<VariantListResponse> {
    try {
      const response = await apiClient.get(`/api/variants/product/${productId}`)
      
      const enhancedData = {
        success: true,
        message: 'Ürün varyantları başarıyla alındı',
        data: {
          variants: response.data.map((variant: ProductVariant) => this.enhanceVariant(variant)),
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            pages: 1
          }
        }
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Get product variants error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün varyantları alınırken hata oluştu'))
    }
  }

  // Create new variant
  async createVariant(data: CreateVariantRequest): Promise<VariantResponse> {
    try {
      const response = await apiClient.post('/api/variants', data)
      
      const enhancedData = {
        success: true,
        message: 'Varyant başarıyla oluşturuldu',
        data: this.enhanceVariant(response.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Create variant error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant oluşturulurken hata oluştu'))
    }
  }

  // Update variant
  async updateVariant(id: number, data: UpdateVariantRequest): Promise<VariantResponse> {
    try {
      const response = await apiClient.patch(`/api/variants/${id}`, data)
      
      const enhancedData = {
        success: true,
        message: 'Varyant başarıyla güncellendi',
        data: this.enhanceVariant(response.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Update variant error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant güncellenirken hata oluştu'))
    }
  }

  // Delete variant (soft delete)
  async deleteVariant(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/variants/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Delete variant error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant silinirken hata oluştu'))
    }
  }

  // Get variant statistics
  async getVariantStats(productId?: number): Promise<VariantStatsResponse> {
    try {
      const url = productId 
        ? `/api/variants/stats?productId=${productId}`
        : '/api/variants/stats'
      
      const response = await apiClient.get(url)
      
      // Transform backend response to expected format
      const transformedData = {
        success: true,
        message: 'Varyant istatistikleri başarıyla alındı',
        data: {
          total: response.data.totalVariants || 0,
          active: response.data.activeVariants || 0,
          inactive: (response.data.totalVariants || 0) - (response.data.activeVariants || 0),
          lowStock: response.data.lowStockVariants || 0,
          outOfStock: response.data.outOfStockVariants || 0,
          totalValue: response.data.totalValue || 0,
          averagePrice: response.data.averagePrice || 0
        }
      }
      
      return transformedData
    } catch (error: any) {
      console.error('Get variant stats error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant istatistikleri alınırken hata oluştu'))
    }
  }

  // Get variant attributes
  async getVariantAttributes(): Promise<VariantAttributeResponse> {
    try {
      const response = await apiClient.get('/api/variants/attributes')
      
      return {
        success: true,
        message: 'Varyant öznitelikleri başarıyla alındı',
        data: response.data
      }
    } catch (error: any) {
      console.error('Get variant attributes error:', error)
      throw new Error(this.getErrorMessage(error, 'Varyant öznitelikleri alınırken hata oluştu'))
    }
  }

  // Private helper methods
  private enhanceVariant(variant: ProductVariant): ProductVariant {
    const enhanced = { ...variant }
    
    // Calculate total value
    enhanced.totalValue = enhanced.stockQuantity * enhanced.unitPrice
    
    // Determine status
    enhanced.status = this.getVariantStatus(enhanced)
    
    return enhanced
  }

  private getVariantStatus(variant: ProductVariant): VariantStatus {
    if (!variant.isActive) return VariantStatus.INACTIVE
    if (variant.stockQuantity === 0) return VariantStatus.OUT_OF_STOCK
    if (variant.stockQuantity <= variant.minStockLevel) return VariantStatus.LOW_STOCK
    return VariantStatus.ACTIVE
  }

  private getErrorMessage(error: any, defaultMessage: string): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    } else if (error.response?.data?.error) {
      const validationError = error.response.data.error
      if (Array.isArray(validationError)) {
        return validationError.join(', ')
      }
      return validationError
    } else if (error.message) {
      return error.message
    }
    return defaultMessage
  }

  // Helper methods for UI
  getStatusText(status: VariantStatus): string {
    const statusMap: Record<VariantStatus, string> = {
      [VariantStatus.ACTIVE]: 'Aktif',
      [VariantStatus.INACTIVE]: 'Pasif',
      [VariantStatus.LOW_STOCK]: 'Düşük Stok',
      [VariantStatus.OUT_OF_STOCK]: 'Stok Yok',
      [VariantStatus.DISCONTINUED]: 'Üretim Durduruldu'
    }
    return statusMap[status] || 'Bilinmiyor'
  }

  getStatusColor(status: VariantStatus): string {
    const colorMap: Record<VariantStatus, string> = {
      [VariantStatus.ACTIVE]: 'green',
      [VariantStatus.INACTIVE]: 'default',
      [VariantStatus.LOW_STOCK]: 'orange',
      [VariantStatus.OUT_OF_STOCK]: 'red',
      [VariantStatus.DISCONTINUED]: 'purple'
    }
    return colorMap[status] || 'default'
  }

  // Currency formatting
  formatCurrency(amount: number, currency: string = 'TRY'): string {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€'
    }
    
    const symbol = currencySymbols[currency] || currency
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`
  }

  // Stock level formatting
  formatStock(quantity: number): string {
    return `${quantity.toLocaleString('tr-TR')} adet`
  }

  // SKU formatting
  generateSKU(productCode: string, attributes: { color?: string; size?: string; material?: string }): string {
    const parts = [productCode.toUpperCase()]
    
    if (attributes.color) parts.push(attributes.color.substring(0, 3).toUpperCase())
    if (attributes.size) parts.push(attributes.size.toUpperCase())
    if (attributes.material) parts.push(attributes.material.substring(0, 3).toUpperCase())
    
    return parts.join('-')
  }
}

// Export singleton instance
export const variantService = new VariantService()
export default variantService 