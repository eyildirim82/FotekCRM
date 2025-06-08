import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Button, message, Space, Avatar, Dropdown, Row, Col, Statistic } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined, DashboardOutlined, BankOutlined, ShoppingOutlined, ToolOutlined, BarcodeOutlined, ShoppingCartOutlined, DollarOutlined, FileTextOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import axios from 'axios'
import authService, { User } from '../services/authService'
import DashboardAnalytics from './DashboardAnalytics'
import CompanyList from './CompanyList'
import ContactList from './ContactList'
import ProductList from './ProductList'
import VariantList from './VariantList'
import OrderList from './OrderList'
import AdminPanel from './AdminPanel'
import ExchangeRatesList from './ExchangeRates/ExchangeRatesList'
import InvoicesList from './Invoices/InvoicesList'
import InvoiceForm from './Invoices/InvoiceForm'

const { Header, Content } = Layout
const { Title, Paragraph, Text } = Typography

interface DashboardProps {
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'dashboard' | 'companies' | 'contacts' | 'products' | 'variants' | 'orders' | 'admin' | 'exchange-rates' | 'invoices' | 'invoices-new'>('dashboard')

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
      // Use App.useApp() for context-aware messages instead
    } catch (error) {
      console.error('API bağlantı hatası:', error)
      // message.error('API bağlantısı başarısız!') // Commented to avoid antd context warning
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
              <Button 
                type={currentView === 'orders' ? 'primary' : 'text'}
                icon={<ShoppingCartOutlined />}
                onClick={() => setCurrentView('orders')}
                style={{ color: currentView === 'orders' ? undefined : 'white' }}
              >
                Siparişler
              </Button>
              <Button 
                type={currentView === 'exchange-rates' ? 'primary' : 'text'}
                icon={<DollarOutlined />}
                onClick={() => setCurrentView('exchange-rates')}
                style={{ color: currentView === 'exchange-rates' ? undefined : 'white' }}
              >
                Döviz Kurları
              </Button>
              <Button 
                type={currentView === 'invoices' ? 'primary' : 'text'}
                icon={<FileTextOutlined />}
                onClick={() => setCurrentView('invoices')}
                style={{ color: currentView === 'invoices' ? undefined : 'white' }}
              >
                Faturalar
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
      
      <Content style={{ padding: currentView === 'companies' || currentView === 'contacts' || currentView === 'products' || currentView === 'variants' || currentView === 'orders' || currentView === 'admin' || currentView === 'exchange-rates' || currentView === 'invoices' || currentView === 'invoices-new' ? '0' : '50px', background: '#f0f2f5' }}>
        {currentView === 'dashboard' ? (
          <DashboardAnalytics />
        ) : currentView === 'companies' ? (
          <CompanyList />
        ) : currentView === 'contacts' ? (
          <ContactList />
        ) : currentView === 'products' ? (
          <ProductList />
        ) : currentView === 'variants' ? (
          <VariantList />
        ) : currentView === 'orders' ? (
          <OrderList />
        ) : currentView === 'admin' ? (
          <AdminPanel />
        ) : currentView === 'exchange-rates' ? (
          <ExchangeRatesList />
        ) : currentView === 'invoices' ? (
          <InvoicesList onCreateNew={() => setCurrentView('invoices-new')} />
        ) : currentView === 'invoices-new' ? (
          <InvoiceForm onCancel={() => setCurrentView('invoices')} />
        ) : null}
      </Content>
    </Layout>
  )
}

export default Dashboard 