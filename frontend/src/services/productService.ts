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

// Product Category Enum
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  OFFICE_SUPPLIES = 'office_supplies',
  MACHINERY = 'machinery',
  SOFTWARE = 'software',
  SERVICES = 'services',
  OTHER = 'other'
}

// Currency Enum
export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

// Unit Type Enum
export enum UnitType {
  PIECE = 'adet',
  KG = 'kg',
  METER = 'm',
  LITER = 'lt',
  BOX = 'kutu',
  PACK = 'paket',
  HOUR = 'saat',
  DAY = 'gün',
  MONTH = 'ay',
  YEAR = 'yıl'
}

// Product Status Enum (derived from isActive and stock levels)
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface Product {
  id: number
  name: string
  code: string
  description?: string
  category?: string
  brand?: string
  unit?: string
  listPrice: number
  costPrice: number
  vatRate: number
  currency: string
  stockQuantity: number
  minStockLevel: number
  isActive: boolean
  isService: boolean
  imageUrl?: string
  notes?: string
  companyId?: number
  createdById: number
  updatedById?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // Relations
  company?: {
    id: number
    name: string
    status: string
  }
  createdBy?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  updatedBy?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  // Computed properties
  profitMargin?: number
  totalValue?: number
  status?: ProductStatus
}

export interface CreateProductRequest {
  name: string
  code: string
  description?: string
  category?: string
  brand?: string
  unit?: string
  listPrice?: number
  costPrice?: number
  vatRate?: number
  currency?: string
  stockQuantity?: number
  minStockLevel?: number
  isActive?: boolean
  isService?: boolean
  imageUrl?: string
  notes?: string
  companyId?: number
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductListResponse {
  success: boolean
  message: string
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface ProductResponse {
  success: boolean
  message: string
  data: Product
}

export interface ProductStatsResponse {
  success: boolean
  message: string
  data: {
    total: number
    active: number
    inactive: number
    lowStock: number
    outOfStock: number
    totalValue: number
    averageProfitMargin: number
  }
}

class ProductService {
  // Get all products with pagination and filters
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isActive?: boolean
    minPrice?: number
    maxPrice?: number
    stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
    companyId?: number
  }): Promise<ProductListResponse> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.category) queryParams.append('category', params.category)
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
      if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString())
      if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
      if (params?.stockStatus) queryParams.append('stockStatus', params.stockStatus)
      if (params?.companyId) queryParams.append('companyId', params.companyId.toString())

      const response = await apiClient.get(`/api/products?${queryParams.toString()}`)
      
      // Enhance products with computed properties
      const enhancedData = {
        ...response.data,
        data: {
          ...response.data.data,
          products: response.data.data.products.map((product: Product) => this.enhanceProduct(product))
        }
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Get products error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürünler listelenirken hata oluştu'))
    }
  }

  // Get single product by ID
  async getProduct(id: number): Promise<ProductResponse> {
    try {
      const response = await apiClient.get(`/api/products/${id}`)
      
      // Enhance product with computed properties
      const enhancedData = {
        ...response.data,
        data: this.enhanceProduct(response.data.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Get product error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün bilgileri alınırken hata oluştu'))
    }
  }

  // Create new product
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    try {
      const response = await apiClient.post(`/api/products`, data)
      
      // Enhance product with computed properties
      const enhancedData = {
        ...response.data,
        data: this.enhanceProduct(response.data.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Create product error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün oluşturulurken hata oluştu'))
    }
  }

  // Update product
  async updateProduct(id: number, data: UpdateProductRequest): Promise<ProductResponse> {
    try {
      const response = await apiClient.patch(`/api/products/${id}`, data)
      
      // Enhance product with computed properties
      const enhancedData = {
        ...response.data,
        data: this.enhanceProduct(response.data.data)
      }
      
      return enhancedData
    } catch (error: any) {
      console.error('Update product error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün güncellenirken hata oluştu'))
    }
  }

  // Delete product (soft delete)
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/products/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Delete product error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün silinirken hata oluştu'))
    }
  }

  // Get product statistics
  async getProductStats(companyId?: number): Promise<ProductStatsResponse> {
    try {
      const url = companyId 
        ? `/api/products/stats?companyId=${companyId}`
        : '/api/products/stats'
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error: any) {
      console.error('Get product stats error:', error)
      throw new Error(this.getErrorMessage(error, 'Ürün istatistikleri alınırken hata oluştu'))
    }
  }

  // Private helper methods
  private enhanceProduct(product: Product): Product {
    const enhanced = { ...product }
    
    // Calculate profit margin
    if (enhanced.listPrice && enhanced.costPrice && enhanced.costPrice > 0) {
      enhanced.profitMargin = ((enhanced.listPrice - enhanced.costPrice) / enhanced.costPrice) * 100
    }
    
    // Calculate total value
    enhanced.totalValue = enhanced.stockQuantity * enhanced.costPrice
    
    // Determine status
    enhanced.status = this.getProductStatus(enhanced)
    
    return enhanced
  }

  private getProductStatus(product: Product): ProductStatus {
    if (!product.isActive) return ProductStatus.INACTIVE
    if (product.isService) return ProductStatus.ACTIVE
    if (product.stockQuantity === 0) return ProductStatus.OUT_OF_STOCK
    if (product.stockQuantity <= product.minStockLevel) return ProductStatus.LOW_STOCK
    return ProductStatus.ACTIVE
  }

  private getErrorMessage(error: any, defaultMessage: string): string {
    if (error.response?.data?.message) {
      // Backend error message
      return error.response.data.message
    } else if (error.response?.data?.error) {
      // Validation errors
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
  getCategoryText(category: string): string {
    const categoryMap: Record<string, string> = {
      [ProductCategory.ELECTRONICS]: 'Elektronik',
      [ProductCategory.OFFICE_SUPPLIES]: 'Ofis Malzemeleri',
      [ProductCategory.MACHINERY]: 'Makine & Ekipman',
      [ProductCategory.SOFTWARE]: 'Yazılım',
      [ProductCategory.SERVICES]: 'Hizmetler',
      [ProductCategory.OTHER]: 'Diğer'
    }
    return categoryMap[category] || category || 'Belirtilmemiş'
  }

  getStatusText(status: ProductStatus): string {
    const statusMap: Record<ProductStatus, string> = {
      [ProductStatus.ACTIVE]: 'Aktif',
      [ProductStatus.INACTIVE]: 'Pasif',
      [ProductStatus.LOW_STOCK]: 'Düşük Stok',
      [ProductStatus.OUT_OF_STOCK]: 'Stok Yok'
    }
    return statusMap[status] || 'Bilinmiyor'
  }

  getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      [ProductCategory.ELECTRONICS]: 'blue',
      [ProductCategory.OFFICE_SUPPLIES]: 'green',
      [ProductCategory.MACHINERY]: 'orange',
      [ProductCategory.SOFTWARE]: 'purple',
      [ProductCategory.SERVICES]: 'cyan',
      [ProductCategory.OTHER]: 'default'
    }
    return colorMap[category] || 'default'
  }

  getStatusColor(status: ProductStatus): string {
    const colorMap: Record<ProductStatus, string> = {
      [ProductStatus.ACTIVE]: 'green',
      [ProductStatus.INACTIVE]: 'default',
      [ProductStatus.LOW_STOCK]: 'orange',
      [ProductStatus.OUT_OF_STOCK]: 'red'
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

  // Profit margin formatting
  formatProfitMargin(margin: number): string {
    return `%${margin.toFixed(1)}`
  }

  // Stock level formatting
  formatStock(quantity: number, unit?: string): string {
    const unitText = unit || 'adet'
    return `${quantity.toLocaleString('tr-TR')} ${unitText}`
  }
}

// Export singleton instance
export const productService = new ProductService()
export default productService 