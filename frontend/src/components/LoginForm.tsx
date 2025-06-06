import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Divider, Space, App } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import authService, { LoginRequest, RegisterRequest } from '../services/authService'

const { Title, Text } = Typography

interface LoginFormProps {
  onSuccess: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true) // true: Login, false: Register
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      if (isLogin) {
        // Login
        const loginData: LoginRequest = {
          email: values.email,
          password: values.password
        }
        
        const response = await authService.login(loginData)
        message.success(`Hoş geldiniz, ${response.user.firstName}!`)
        onSuccess()
      } else {
        // Register
        const registerData: RegisterRequest = {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName
        }
        
        const response = await authService.register(registerData)
        message.success(`Hesabınız oluşturuldu, hoş geldiniz ${response.user.firstName}!`)
        onSuccess()
      }
    } catch (error: any) {
      message.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    form.resetFields()
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          borderRadius: '12px'
        }}
        styles={{ body: { padding: '40px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            🚀 Fotek CRM
          </Title>
          <Text type="secondary">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </Text>
        </div>

        <Form
          form={form}
          name="auth_form"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          {!isLogin && (
            <>
              <Form.Item
                name="firstName"
                rules={[
                  { required: true, message: 'Lütfen adınızı giriniz!' },
                  { min: 2, message: 'Ad en az 2 karakter olmalıdır!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Adınız"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                rules={[
                  { required: true, message: 'Lütfen soyadınızı giriniz!' },
                  { min: 2, message: 'Soyad en az 2 karakter olmalıdır!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Soyadınız"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Lütfen email adresinizi giriniz!' },
              { type: 'email', message: 'Geçerli bir email adresi giriniz!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Lütfen şifrenizi giriniz!' },
              { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifre"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{ 
                height: '45px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </Text>
            <Button 
              type="link" 
              onClick={switchMode}
              style={{ padding: 0, fontSize: '14px' }}
            >
              {isLogin ? 'Hesap Oluştur' : 'Giriş Yap'}
            </Button>
          </Space>
        </div>

        {/* Demo Kullanıcı Bilgisi */}
        {isLogin && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#f6f8fa', 
            borderRadius: '8px',
            border: '1px solid #e1e4e8'
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              <strong>Demo için:</strong><br />
              Önce hesap oluşturun, sonra giriş yapın<br />
              veya test@fotek.com / Test123! deneyin
            </Text>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LoginForm 