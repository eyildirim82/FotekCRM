import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  App,
  Switch,
  Divider
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import companyService, { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../services/companyService'

const { Option } = Select
const { TextArea } = Input

interface CompanyFormProps {
  company?: Company | null
  onSuccess: () => void
  onCancel: () => void
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  const isEditing = Boolean(company)

  // Initialize form values
  useEffect(() => {
    if (company) {
      form.setFieldsValue({
        name: company.name,
        taxNumber: company.taxNumber,
        industry: company.industry,
        phone: company.phone,
        email: company.email,
        website: company.website,
        address: company.address,
        city: company.city,
        country: company.country,
        postalCode: company.postalCode,
        notes: company.notes,
        isActive: company.isActive,
        status: company.status
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        status: 'lead'
      })
    }
  }, [company, form])

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      if (isEditing && company) {
        const updateData: UpdateCompanyRequest = {
          ...values,
          // Remove undefined values
          ...Object.fromEntries(
            Object.entries(values).filter(([_, value]) => value !== undefined && value !== '')
          )
        }
        await companyService.updateCompany(company.id, updateData)
      } else {
        const createData: CreateCompanyRequest = values
        await companyService.createCompany(createData)
      }
      
      onSuccess()
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Industry options
  const industryOptions = [
    'Teknoloji',
    'İmalat',
    'Ticaret',
    'Finans',
    'Sağlık',
    'Eğitim',
    'İnşaat',
    'Turizm',
    'Tekstil',
    'Gıda',
    'Otomotiv',
    'Lojistik',
    'Medya',
    'Enerji',
    'Diğer'
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        status: 'lead'
      }}
    >
      <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Firma Adı"
              rules={[
                { required: true, message: 'Firma adı zorunludur' },
                { min: 2, message: 'Firma adı en az 2 karakter olmalıdır' },
                { max: 255, message: 'Firma adı en fazla 255 karakter olabilir' }
              ]}
            >
              <Input placeholder="Firma adını giriniz" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxNumber"
              label="Vergi Numarası"
              rules={[
                { pattern: /^\d{10}$/, message: 'Vergi numarası 10 haneli olmalıdır' }
              ]}
            >
              <Input placeholder="1234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="industry"
              label="Sektör"
            >
              <Select placeholder="Sektör seçiniz" allowClear>
                {industryOptions.map(industry => (
                  <Option key={industry} value={industry}>
                    {industry}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Durum"
              rules={[{ required: true, message: 'Durum seçimi zorunludur' }]}
            >
              <Select placeholder="Durum seçiniz">
                <Option value="lead">Potansiyel</Option>
                <Option value="prospect">Aday</Option>
                <Option value="customer">Müşteri</Option>
                <Option value="inactive">Pasif</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="İletişim Bilgileri" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Geçerli bir email adresi giriniz' }
              ]}
            >
              <Input placeholder="info@firma.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
              rules={[
                { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Geçerli bir telefon numarası giriniz' }
              ]}
            >
              <Input placeholder="+90 212 123 45 67" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="website"
              label="Website"
              rules={[
                { type: 'url', message: 'Geçerli bir website adresi giriniz (http:// veya https:// ile başlamalı)' }
              ]}
            >
              <Input placeholder="https://www.firma.com" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Adres Bilgileri" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Adres"
            >
              <TextArea 
                rows={3} 
                placeholder="Detaylı adres bilgisini giriniz"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="city"
              label="Şehir"
            >
              <Input placeholder="İstanbul" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="country"
              label="Ülke"
            >
              <Input placeholder="Türkiye" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="postalCode"
              label="Posta Kodu"
              rules={[
                { pattern: /^\d{5}$/, message: 'Posta kodu 5 haneli olmalıdır' }
              ]}
            >
              <Input placeholder="34000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Aktif Durum"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Aktif" 
                unCheckedChildren="Pasif"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Ek Bilgiler" size="small" style={{ marginBottom: '16px' }}>
        <Form.Item
          name="notes"
          label="Notlar"
        >
          <TextArea 
            rows={4} 
            placeholder="Firma hakkında ek notlar..."
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Card>

      <Divider />

      {/* Form Actions */}
      <Row justify="end" gutter={8}>
        <Col>
          <Button onClick={onCancel}>
            İptal
          </Button>
        </Col>
        <Col>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={loading}
          >
            {isEditing ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default CompanyForm 