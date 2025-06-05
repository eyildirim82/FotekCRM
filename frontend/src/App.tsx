import { useState, useEffect } from 'react'
import { Layout, Typography, Card, Button, message, Space } from 'antd'
import axios from 'axios'
import './App.css'

const { Header, Content } = Layout
const { Title, Paragraph } = Typography

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    checkApiHealth()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🚀 Fotek CRM
        </Title>
      </Header>
      
      <Content style={{ padding: '50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card>
            <Title level={2}>Hoş Geldiniz! 👋</Title>
            <Paragraph>
              Fotek CRM MVP projesi başarıyla çalışıyor! Bu, atomic sprint planına göre 
              geliştirilen S-0 sprint'inin sonucudur.
            </Paragraph>
            
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="API Durumu" size="small">
                {healthStatus ? (
                  <div>
                    <p><strong>Durum:</strong> {healthStatus.status}</p>
                    <p><strong>Servis:</strong> {healthStatus.service}</p>
                    <p><strong>Versiyon:</strong> {healthStatus.version}</p>
                    <p><strong>Ortam:</strong> {healthStatus.environment}</p>
                    <p><strong>Zaman:</strong> {new Date(healthStatus.timestamp).toLocaleString('tr-TR')}</p>
                  </div>
                ) : (
                  <p>API bağlantısı kurulamadı</p>
                )}
                
                <Button 
                  type="primary" 
                  onClick={checkApiHealth} 
                  loading={loading}
                  style={{ marginTop: 16 }}
                >
                  API Durumunu Kontrol Et
                </Button>
              </Card>

              <Card title="Özellikler" size="small">
                <ul>
                  <li>✅ Docker Compose yapılandırması</li>
                  <li>✅ NestJS API (/health endpoint)</li>
                  <li>✅ React Vite Frontend</li>
                  <li>✅ MSSQL Veritabanı</li>
                  <li>✅ Nginx Reverse Proxy</li>
                </ul>
              </Card>
            </Space>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}

export default App 