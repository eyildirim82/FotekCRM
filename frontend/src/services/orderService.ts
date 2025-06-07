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

// TypeScript Enums and Interfaces
export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

export interface OrderLine {
  id?: number
  orderId?: number
  productId?: number
  variantId?: number
  itemCode: string
  itemName: string
  itemDescription?: string
  quantity: number
  unit: string
  unitPrice: number
  discountPercent: number
  discountAmount: number
  subtotalPrice: number
  vatRate: number
  vatAmount: number
  totalPrice: number
  currency: string
  notes?: string
  product?: any
  variant?: any
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  id: number
  orderNumber: string
  customerId: string
  subtotalAmount: number
  discountAmount: number
  vatAmount: number
  totalAmount: number
  currency: string
  status: OrderStatus
  orderDate: string
  deliveryDate?: string
  shippedDate?: string
  shippingAddress?: string
  shippingMethod?: string
  paymentMethod?: string
  paymentStatus?: string
  notes?: string
  internalNotes?: string
  isActive: boolean
  orderLines: OrderLine[]
  customer?: any
  stockTransactions?: any[]
  createdBy?: any
  updatedBy?: any
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface OrderFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  customerId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface OrderStats {
  totalOrders: number
  draftOrders: number
  confirmedOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface CreateOrderData {
  customerId: string
  orderLines: Omit<OrderLine, 'id' | 'orderId' | 'subtotalPrice' | 'vatAmount' | 'totalPrice'>[]
  discountAmount?: number
  currency?: string
  status?: OrderStatus
  orderDate?: string
  deliveryDate?: string
  shippingAddress?: string
  shippingMethod?: string
  paymentMethod?: string
  paymentStatus?: string
  notes?: string
  internalNotes?: string
}

export interface UpdateOrderData {
  customerId?: string
  orderLines?: Omit<OrderLine, 'id' | 'orderId' | 'subtotalPrice' | 'vatAmount' | 'totalPrice'>[]
  discountAmount?: number
  currency?: string
  status?: OrderStatus
  orderDate?: string
  deliveryDate?: string
  shippedDate?: string
  shippingAddress?: string
  shippingMethod?: string
  paymentMethod?: string
  paymentStatus?: string
  notes?: string
  internalNotes?: string
}

export interface OrderListResponse {
  success: boolean
  message: string
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface OrderResponse {
  success: boolean
  message: string
  data: Order
}

export interface OrderStatsResponse {
  success: boolean
  message: string
  data: OrderStats
}

// Helper Functions
export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  const locale = currency === 'TRY' ? 'tr-TR' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatOrderNumber = (orderNumber: string): string => {
  return orderNumber || 'N/A'
}

export const getStatusText = (status: OrderStatus): string => {
  const statusTexts = {
    [OrderStatus.DRAFT]: 'Taslak',
    [OrderStatus.CONFIRMED]: 'Onaylandı',
    [OrderStatus.SHIPPED]: 'Kargoya Verildi',
    [OrderStatus.DELIVERED]: 'Teslim Edildi',
    [OrderStatus.CANCELLED]: 'İptal Edildi'
  }
  return statusTexts[status] || status
}

export const getStatusColor = (status: OrderStatus): string => {
  const statusColors = {
    [OrderStatus.DRAFT]: 'default',
    [OrderStatus.CONFIRMED]: 'processing',
    [OrderStatus.SHIPPED]: 'warning',
    [OrderStatus.DELIVERED]: 'success',
    [OrderStatus.CANCELLED]: 'error'
  }
  return statusColors[status] || 'default'
}

export const getStatusActions = (status: OrderStatus): string[] => {
  const statusActions = {
    [OrderStatus.DRAFT]: ['edit', 'confirm', 'delete'],
    [OrderStatus.CONFIRMED]: ['edit', 'ship', 'cancel'],
    [OrderStatus.SHIPPED]: ['deliver'],
    [OrderStatus.DELIVERED]: ['view'],
    [OrderStatus.CANCELLED]: ['view']
  }
  return statusActions[status] || ['view']
}

export const calculateOrderTotals = (orderLines: OrderLine[]): {
  subtotal: number
  vat: number
  total: number
} => {
  const subtotal = orderLines.reduce((sum, line) => sum + line.subtotalPrice, 0)
  const vat = orderLines.reduce((sum, line) => sum + line.vatAmount, 0)
  const total = orderLines.reduce((sum, line) => sum + line.totalPrice, 0)
  
  return { subtotal, vat, total }
}

export const calculateLineTotal = (
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  vatRate: number = 18
): {
  subtotalPrice: number
  discountAmount: number
  vatAmount: number
  totalPrice: number
} => {
  const subtotalPrice = quantity * unitPrice
  const discountAmount = (subtotalPrice * discountPercent) / 100
  const vatableAmount = subtotalPrice - discountAmount
  const vatAmount = (vatableAmount * vatRate) / 100
  const totalPrice = subtotalPrice - discountAmount + vatAmount

  return {
    subtotalPrice,
    discountAmount,
    vatAmount,
    totalPrice
  }
}

// OrderService Class
class OrderService {
  // Get orders with filtering and pagination
  async getOrders(filters: OrderFilters = {}): Promise<OrderListResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.customerId) params.append('customerId', filters.customerId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await apiClient.get(`/api/orders?${params.toString()}`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      throw new Error(error.response?.data?.message || 'Siparişler yüklenirken hata oluştu')
    }
  }

  // Get single order by ID
  async getOrder(id: number): Promise<OrderResponse> {
    try {
      const response = await apiClient.get(`/api/orders/${id}`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error fetching order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş yüklenirken hata oluştu')
    }
  }

  // Create new order
  async createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
    try {
      const response = await apiClient.post('/api/orders', orderData)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş oluşturulurken hata oluştu')
    }
  }

  // Update existing order
  async updateOrder(id: number, orderData: UpdateOrderData): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/api/orders/${id}`, orderData)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error updating order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş güncellenirken hata oluştu')
    }
  }

  // Delete order (soft delete)
  async deleteOrder(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/orders/${id}`)
      
      return {
        success: response.data.success,
        message: response.data.message
      }
    } catch (error: any) {
      console.error('Error deleting order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş silinirken hata oluştu')
    }
  }

  // Get order statistics
  async getOrderStats(filters: {
    customerId?: string
    startDate?: string
    endDate?: string
  } = {}): Promise<OrderStatsResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.customerId) params.append('customerId', filters.customerId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await apiClient.get(`/api/orders/stats?${params.toString()}`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error fetching order stats:', error)
      throw new Error(error.response?.data?.message || 'İstatistikler yüklenirken hata oluştu')
    }
  }

  // Status change operations
  async confirmOrder(id: number): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/api/orders/${id}/confirm`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error confirming order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş onaylanırken hata oluştu')
    }
  }

  async shipOrder(id: number, shipData: {
    shippedDate?: string
    shippingMethod?: string
  } = {}): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/api/orders/${id}/ship`, shipData)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error shipping order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş kargoya verilirken hata oluştu')
    }
  }

  async deliverOrder(id: number): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/api/orders/${id}/deliver`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error delivering order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş teslim edilirken hata oluştu')
    }
  }

  async cancelOrder(id: number): Promise<OrderResponse> {
    try {
      const response = await apiClient.patch(`/api/orders/${id}/cancel`)
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error)
      throw new Error(error.response?.data?.message || 'Sipariş iptal edilirken hata oluştu')
    }
  }

  // Get orders by customer
  async getOrdersByCustomer(customerId: string, filters: OrderFilters = {}): Promise<OrderListResponse> {
    return this.getOrders({ ...filters, customerId })
  }

  // Utility methods
  formatCurrency = formatCurrency
  formatOrderNumber = formatOrderNumber
  getStatusText = getStatusText
  getStatusColor = getStatusColor
  getStatusActions = getStatusActions
  calculateOrderTotals = calculateOrderTotals
  calculateLineTotal = calculateLineTotal
}

// Create and export singleton instance
const orderService = new OrderService()
export default orderService 