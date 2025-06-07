import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Button, message, Space, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined, BankOutlined, ShoppingOutlined, ToolOutlined, BarcodeOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import axios from 'axios'
import authService, { User } from '../services/authService'
import CompanyList from './CompanyList'
import ContactList from './ContactList'
import ProductList from './ProductList'
import VariantList from './VariantList'
import AdminPanel from './AdminPanel'

const { Header, Content } = Layout
const { Title, Paragraph, Text } = Typography

interface DashboardProps {
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'companies' | 'contacts' | 'products' | 'variants' | 'admin'>('dashboard')

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const user = authService.getCurrentUser()
    setCurrentUser(user)
    
    // API health check
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/health`)
      setHealthStatus(response.data)
      message.success('API bağlantısı başarılı!')
    } catch (error) {
      console.error('API bağlantı hatası:', error)
      message.error('API bağlantısı başarısız!')
      setHealthStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    message.success('Başarıyla çıkış yapıldı')
    onLogout()
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: handleLogout,
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'profile':
        message.info('Profil sayfası henüz hazır değil')
        break
      case 'settings':
        message.info('Ayarlar sayfası henüz hazır değil')
        break
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DashboardOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '12px' }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Fotek CRM
          </Title>
          <div style={{ marginLeft: '40px' }}>
            <Space size="large">
              <Button 
                type={currentView === 'dashboard' ? 'primary' : 'text'}
                icon={<DashboardOutlined />}
                onClick={() => setCurrentView('dashboard')}
                style={{ color: currentView === 'dashboard' ? undefined : 'white' }}
              >
                Dashboard
              </Button>
              <Button 
                type={currentView === 'companies' ? 'primary' : 'text'}
                icon={<BankOutlined />}
                onClick={() => setCurrentView('companies')}
                style={{ color: currentView === 'companies' ? undefined : 'white' }}
              >
                Firmalar
              </Button>
              <Button 
                type={currentView === 'contacts' ? 'primary' : 'text'}
                icon={<UserOutlined />}
                onClick={() => setCurrentView('contacts')}
                style={{ color: currentView === 'contacts' ? undefined : 'white' }}
              >
                Kişiler
              </Button>
              <Button 
                type={currentView === 'products' ? 'primary' : 'text'}
                icon={<ShoppingOutlined />}
                onClick={() => setCurrentView('products')}
                style={{ color: currentView === 'products' ? undefined : 'white' }}
              >
                Ürünler
              </Button>
              <Button 
                type={currentView === 'variants' ? 'primary' : 'text'}
                icon={<BarcodeOutlined />}
                onClick={() => setCurrentView('variants')}
                style={{ color: currentView === 'variants' ? undefined : 'white' }}
              >
                Varyantlar
              </Button>
              {currentUser?.role === 'admin' && (
                <Button 
                  type={currentView === 'admin' ? 'primary' : 'text'}
                  icon={<ToolOutlined />}
                  onClick={() => setCurrentView('admin')}
                  style={{ color: currentView === 'admin' ? undefined : 'white' }}
                >
                  Admin
                </Button>
              )}
            </Space>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Space size="middle">
            <Text style={{ color: 'white' }}>
              Hoş geldiniz, {currentUser?.firstName}!
            </Text>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Avatar 
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} 
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </div>
      </Header>
      
      <Content style={{ padding: currentView === 'companies' || currentView === 'contacts' || currentView === 'products' || currentView === 'variants' || currentView === 'admin' ? '0' : '50px', background: '#f0f2f5' }}>
        {currentView === 'dashboard' ? (
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Card style={{ marginBottom: '24px' }}>
              <Title level={2}>Dashboard 📊</Title>
              <Paragraph>
                Fotek CRM'e hoş geldiniz! Bu, S-6 sprint'inin başarılı bir şekilde tamamlandığını 
                gösteren dashboard sayfasıdır.
              </Paragraph>
            </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Kullanıcı Bilgileri */}
            <Card title="👤 Kullanıcı Bilgileri" size="small">
              {currentUser && (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text><strong>ID:</strong> {currentUser.id}</Text>
                  <Text><strong>Email:</strong> {currentUser.email}</Text>
                  <Text><strong>Ad:</strong> {currentUser.firstName}</Text>
                  <Text><strong>Soyad:</strong> {currentUser.lastName}</Text>
                  <Text><strong>Rol:</strong> 
                    <span style={{ 
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: currentUser.role === 'admin' ? '#ff4d4f' : '#52c41a',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {currentUser.role.toUpperCase()}
                    </span>
                  </Text>
                </Space>
              )}
            </Card>

            {/* API Durumu */}
            <Card title="🔌 API Durumu" size="small">
              {healthStatus ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text><strong>Durum:</strong> 
                    <span style={{ color: '#52c41a', marginLeft: '8px' }}>✅ {healthStatus.status}</span>
                  </Text>
                  <Text><strong>Servis:</strong> {healthStatus.service}</Text>
                  <Text><strong>Versiyon:</strong> {healthStatus.version}</Text>
                  <Text><strong>Ortam:</strong> {healthStatus.environment}</Text>
                  <Text><strong>Zaman:</strong> {new Date(healthStatus.timestamp).toLocaleString('tr-TR')}</Text>
                </Space>
              ) : (
                <Text type="danger">❌ API bağlantısı kurulamadı</Text>
              )}
              
              <Button 
                type="primary" 
                onClick={checkApiHealth} 
                loading={loading}
                style={{ marginTop: 16, width: '100%' }}
                size="small"
              >
                Durumu Yenile
              </Button>
            </Card>

            {/* Tamamlanan Özellikler */}
            <Card title="✅ Tamamlanan Özellikler" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>🐳 Docker Compose yapılandırması</Text>
                <Text>🔧 NestJS API + Health Check</Text>
                <Text>⚛️ React Vite Frontend</Text>
                <Text>🗄️ MSSQL Veritabanı</Text>
                <Text>🌐 Nginx Reverse Proxy</Text>
                <Text>🔐 JWT Authentication</Text>
                <Text>👤 User Entity & CRUD</Text>
                <Text>🖥️ Login/Register UI</Text>
                <Text>🛡️ Protected Routes</Text>
                <Text>🏢 Company Management System</Text>
                <Text>👥 Contact Management System</Text>
              </Space>
            </Card>

            {/* Sprint Durumu */}
            <Card title="🚀 Sprint Durumu" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text><strong>S-0:</strong> <span style={{ color: '#52c41a' }}>✅ Docker İskeleti</span></Text>
                <Text><strong>S-1:</strong> <span style={{ color: '#52c41a' }}>✅ CI Pipeline</span></Text>
                <Text><strong>S-2:</strong> <span style={{ color: '#52c41a' }}>✅ Auth API</span></Text>
                <Text><strong>S-3:</strong> <span style={{ color: '#52c41a' }}>✅ Frontend Login UI</span></Text>
                <Text><strong>S-4:</strong> <span style={{ color: '#52c41a' }}>✅ Company CRUD API</span></Text>
                <Text><strong>S-5:</strong> <span style={{ color: '#52c41a' }}>✅ Company UI</span></Text>
                <Text><strong>S-6:</strong> <span style={{ color: '#52c41a' }}>✅ Contact Management</span></Text>
              </Space>
            </Card>
          </div>
          </div>
        ) : currentView === 'companies' ? (
          <CompanyList />
        ) : currentView === 'contacts' ? (
          <ContactList />
        ) : currentView === 'products' ? (
          <ProductList />
        ) : currentView === 'variants' ? (
          <VariantList />
        ) : currentView === 'admin' ? (
          <AdminPanel />
        ) : null}
      </Content>
    </Layout>
  )
}

export default Dashboard 