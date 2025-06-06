import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  iat?: number
  exp?: number
}

class AuthService {
  private tokenKey = 'fotek_auth_token'
  
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Login request:', { email: credentials.email, apiUrl: API_URL })
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials)
      const { access_token, user } = response.data
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem(this.tokenKey, access_token)
      
      // Axios default header'ına ekle
      this.setAuthHeader(access_token)
      
      return { access_token, user }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.status === 401) {
        throw new Error('Geçersiz email veya şifre')
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.')
      }
      throw new Error('Giriş yapılamadı')
    }
  }

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Register request:', { email: userData.email, apiUrl: API_URL })
      const response = await axios.post(`${API_URL}/api/auth/register`, userData)
      const { access_token, user } = response.data
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem(this.tokenKey, access_token)
      
      // Axios default header'ına ekle
      this.setAuthHeader(access_token)
      
      return { access_token, user }
    } catch (error: any) {
      console.error('Register error:', error)
      if (error.response?.status === 409) {
        throw new Error('Bu email adresi zaten kullanılıyor')
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.')
      }
      throw new Error('Kayıt oluşturulamadı')
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey)
    delete axios.defaults.headers.common['Authorization']
  }

  // Token kontrolü
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  // Kullanıcı bilgisi al (token'dan decode et)
  getCurrentUser(): User | null {
    const token = this.getToken()
    if (!token) return null

    try {
      const decodedToken = jwtDecode<User>(token)
      
      // Token süresi kontrolü
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        this.logout()
        return null
      }

      return decodedToken
    } catch (error) {
      console.error('Token decode hatası:', error)
      this.logout()
      return null
    }
  }

  // Authentication durumu
  isAuthenticated(): boolean {
    const user = this.getCurrentUser()
    return user !== null
  }

  // Auth header'ı ayarla
  setAuthHeader(token: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Initialize (sayfa yenilendiğinde token'ı restore et)
  initializeAuth(): void {
    const token = this.getToken()
    if (token && this.isAuthenticated()) {
      this.setAuthHeader(token)
    } else {
      this.logout()
    }
  }
}

export const authService = new AuthService()
export default authService 