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
  Divider,
  DatePicker
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import contactService, { Contact, CreateContactRequest, UpdateContactRequest, ContactType, ContactStatus } from '../services/contactService'
import companyService, { Company } from '../services/companyService'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface ContactFormProps {
  contact?: Contact | null
  onSuccess: () => void
  onCancel: () => void
  preSelectedCompanyId?: string
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSuccess, onCancel, preSelectedCompanyId }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const { message } = App.useApp()

  const isEditing = Boolean(contact)

  // Load companies for selection
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await companyService.getCompanies({ limit: 100 })
      setCompanies(response.data.companies)
    } catch (error: any) {
      console.error('Load companies error:', error)
    } finally {
      setLoadingCompanies(false)
    }
  }

  // Initialize form values
  useEffect(() => {
    loadCompanies()

    if (contact) {
      form.setFieldsValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        jobTitle: contact.jobTitle,
        department: contact.department,
        contactType: contact.contactType,
        status: contact.status,
        isPrimary: contact.isPrimary,
        isActive: contact.isActive,
        linkedInUrl: contact.linkedInUrl,
        skype: contact.skype,
        address: contact.address,
        birthDate: contact.birthDate ? dayjs(contact.birthDate) : null,
        notes: contact.notes,
        companyId: contact.companyId
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        status: ContactStatus.ACTIVE,
        contactType: ContactType.EMPLOYEE,
        isPrimary: false,
        companyId: preSelectedCompanyId
      })
    }
  }, [contact, form, preSelectedCompanyId])

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      // Format birth date
      if (values.birthDate) {
        values.birthDate = values.birthDate.format('YYYY-MM-DD')
      }

      if (isEditing && contact) {
        const updateData: UpdateContactRequest = {
          ...values,
          // Remove undefined values
          ...Object.fromEntries(
            Object.entries(values).filter(([_, value]) => value !== undefined && value !== '')
          )
        }
        await contactService.updateContact(contact.id, updateData)
      } else {
        const createData: CreateContactRequest = values
        await contactService.createContact(createData)
      }
      
      onSuccess()
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        status: ContactStatus.ACTIVE,
        contactType: ContactType.EMPLOYEE,
        isPrimary: false
      }}
    >
      <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Ad"
              rules={[
                { required: true, message: 'Ad alanı zorunludur' },
                { min: 1, message: 'Ad en az 1 karakter olmalıdır' },
                { max: 100, message: 'Ad en fazla 100 karakter olabilir' }
              ]}
            >
              <Input placeholder="Adını giriniz" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Soyad"
              rules={[
                { required: true, message: 'Soyad alanı zorunludur' },
                { min: 1, message: 'Soyad en az 1 karakter olmalıdır' },
                { max: 100, message: 'Soyad en fazla 100 karakter olabilir' }
              ]}
            >
              <Input placeholder="Soyadını giriniz" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="jobTitle"
              label="Pozisyon"
              rules={[
                { max: 100, message: 'Pozisyon en fazla 100 karakter olabilir' }
              ]}
            >
              <Input placeholder="İş pozisyonu" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Departman"
              rules={[
                { max: 100, message: 'Departman en fazla 100 karakter olabilir' }
              ]}
            >
              <Input placeholder="Departman" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactType"
              label="Kişi Tipi"
              rules={[{ required: true, message: 'Kişi tipi seçimi zorunludur' }]}
            >
              <Select placeholder="Kişi tipi seçiniz">
                <Option value={ContactType.EMPLOYEE}>Çalışan</Option>
                <Option value={ContactType.MANAGER}>Yönetici</Option>
                <Option value={ContactType.DECISION_MAKER}>Karar Verici</Option>
                <Option value={ContactType.TECHNICAL}>Teknik</Option>
                <Option value={ContactType.FINANCIAL}>Mali İşler</Option>
                <Option value={ContactType.OTHER}>Diğer</Option>
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
                <Option value={ContactStatus.ACTIVE}>Aktif</Option>
                <Option value={ContactStatus.INACTIVE}>Pasif</Option>
                <Option value={ContactStatus.LEFT_COMPANY}>Ayrıldı</Option>
                <Option value={ContactStatus.NO_CONTACT}>İletişim Yok</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="companyId"
              label="Firma"
              rules={[{ required: true, message: 'Firma seçimi zorunludur' }]}
            >
              <Select 
                placeholder="Firma seçiniz" 
                loading={loadingCompanies}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {companies.map(company => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="birthDate"
              label="Doğum Tarihi"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Doğum tarihi seçiniz"
              />
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
                { type: 'email', message: 'Geçerli bir email adresi giriniz' },
                { max: 255, message: 'Email en fazla 255 karakter olabilir' }
              ]}
            >
              <Input placeholder="email@domain.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Telefon"
              rules={[
                { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Geçerli bir telefon numarası giriniz' },
                { max: 50, message: 'Telefon en fazla 50 karakter olabilir' }
              ]}
            >
              <Input placeholder="+90 212 123 45 67" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mobile"
              label="Mobil Telefon"
              rules={[
                { pattern: /^[\d\s\-\+\(\)]+$/, message: 'Geçerli bir mobil telefon numarası giriniz' },
                { max: 50, message: 'Mobil telefon en fazla 50 karakter olabilir' }
              ]}
            >
              <Input placeholder="+90 532 123 45 67" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="skype"
              label="Skype"
              rules={[
                { max: 255, message: 'Skype en fazla 255 karakter olabilir' }
              ]}
            >
              <Input placeholder="skype.username" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="linkedInUrl"
              label="LinkedIn URL"
              rules={[
                { type: 'url', message: 'Geçerli bir LinkedIn URL giriniz (http:// veya https:// ile başlamalı)' },
                { max: 255, message: 'LinkedIn URL en fazla 255 karakter olabilir' }
              ]}
            >
              <Input placeholder="https://www.linkedin.com/in/username" />
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
              rules={[
                { max: 255, message: 'Adres en fazla 255 karakter olabilir' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="Detaylı adres bilgisini giriniz"
                maxLength={255}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="Ek Bilgiler ve Ayarlar" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isPrimary"
              label="Birincil Kişi"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Birincil" 
                unCheckedChildren="Normal"
              />
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

        <Form.Item
          name="notes"
          label="Notlar"
          rules={[
            { max: 1000, message: 'Notlar en fazla 1000 karakter olabilir' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Kişi hakkında ek notlar..."
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

export default ContactForm 