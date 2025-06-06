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
  InputNumber
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import productService, { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductCategory, 
  Currency,
  UnitType 
} from '../services/productService'
import companyService, { Company } from '../services/companyService'

const { Option } = Select
const { TextArea } = Input

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
  preSelectedCompanyId?: number
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel, preSelectedCompanyId }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [profitMargin, setProfitMargin] = useState<number>(0)
  const { message } = App.useApp()

  const isEditing = Boolean(product)

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

  // Calculate profit margin
  const calculateProfitMargin = (listPrice: number, costPrice: number) => {
    if (!listPrice || !costPrice || costPrice === 0) {
      setProfitMargin(0)
      return
    }
    const margin = ((listPrice - costPrice) / costPrice) * 100
    setProfitMargin(Math.round(margin * 10) / 10) // Round to 1 decimal
  }

  // Watch price changes to calculate profit margin
  const handlePriceChange = () => {
    const listPrice = form.getFieldValue('listPrice')
    const costPrice = form.getFieldValue('costPrice')
    calculateProfitMargin(listPrice, costPrice)
  }

  // Initialize form values
  useEffect(() => {
    loadCompanies()

    if (product) {
      form.setFieldsValue({
        name: product.name,
        code: product.code,
        description: product.description,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        listPrice: product.listPrice,
        costPrice: product.costPrice,
        vatRate: product.vatRate,
        currency: product.currency,
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        isActive: product.isActive,
        isService: product.isService,
        imageUrl: product.imageUrl,
        notes: product.notes,
        companyId: product.companyId
      })
      calculateProfitMargin(product.listPrice, product.costPrice)
    } else {
      form.resetFields()
      form.setFieldsValue({
        isActive: true,
        isService: false,
        vatRate: 20,
        currency: Currency.TRY,
        stockQuantity: 0,
        minStockLevel: 0,
        listPrice: 0,
        costPrice: 0,
        companyId: preSelectedCompanyId
      })
      setProfitMargin(0)
    }
  }, [product, form, preSelectedCompanyId])

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      // Convert string numbers to actual numbers
      const processedValues = {
        ...values,
        listPrice: parseFloat(values.listPrice) || 0,
        costPrice: parseFloat(values.costPrice) || 0,
        stockQuantity: parseInt(values.stockQuantity) || 0,
        minStockLevel: parseInt(values.minStockLevel) || 0,
        vatRate: parseInt(values.vatRate) || 20
      }

      if (isEditing && product) {
        const updateData: UpdateProductRequest = {
          ...processedValues,
          // Remove undefined values
          ...Object.fromEntries(
            Object.entries(processedValues).filter(([_, value]) => value !== undefined && value !== '')
          )
        }
        await productService.updateProduct(product.id, updateData)
      } else {
        const createData: CreateProductRequest = processedValues
        await productService.createProduct(createData)
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
        isService: false,
        vatRate: 20,
        currency: Currency.TRY,
        stockQuantity: 0,
        minStockLevel: 0,
        listPrice: 0,
        costPrice: 0
      }}
    >
      {/* Temel Bilgiler */}
      <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Ürün Adı"
              rules={[
                { required: true, message: 'Ürün adı zorunludur' },
                { min: 1, message: 'Ürün adı en az 1 karakter olmalıdır' },
                { max: 100, message: 'Ürün adı en fazla 100 karakter olabilir' }
              ]}
            >
              <Input placeholder="Ürün adını giriniz" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Ürün Kodu (SKU)"
              rules={[
                { required: true, message: 'Ürün kodu zorunludur' },
                { min: 1, message: 'Ürün kodu en az 1 karakter olmalıdır' },
                { max: 50, message: 'Ürün kodu en fazla 50 karakter olabilir' }
              ]}
            >
              <Input placeholder="SKU001" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Kategori"
            >
              <Select placeholder="Kategori seçiniz">
                <Option value={ProductCategory.ELECTRONICS}>Elektronik</Option>
                <Option value={ProductCategory.OFFICE_SUPPLIES}>Ofis Malzemeleri</Option>
                <Option value={ProductCategory.MACHINERY}>Makine & Ekipman</Option>
                <Option value={ProductCategory.SOFTWARE}>Yazılım</Option>
                <Option value={ProductCategory.SERVICES}>Hizmetler</Option>
                <Option value={ProductCategory.OTHER}>Diğer</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="brand"
              label="Marka"
              rules={[
                { max: 50, message: 'Marka en fazla 50 karakter olabilir' }
              ]}
            >
              <Input placeholder="Marka adı" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="unit"
              label="Birim"
              rules={[
                { max: 20, message: 'Birim en fazla 20 karakter olabilir' }
              ]}
            >
              <Select placeholder="Birim seçiniz">
                <Option value={UnitType.PIECE}>Adet</Option>
                <Option value={UnitType.KG}>Kilogram (kg)</Option>
                <Option value={UnitType.METER}>Metre (m)</Option>
                <Option value={UnitType.LITER}>Litre (lt)</Option>
                <Option value={UnitType.BOX}>Kutu</Option>
                <Option value={UnitType.PACK}>Paket</Option>
                <Option value={UnitType.HOUR}>Saat</Option>
                <Option value={UnitType.DAY}>Gün</Option>
                <Option value={UnitType.MONTH}>Ay</Option>
                <Option value={UnitType.YEAR}>Yıl</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="companyId"
              label="Tedarikçi Firma (İsteğe Bağlı)"
            >
              <Select 
                placeholder="Tedarikçi firma seçiniz" 
                loading={loadingCompanies}
                allowClear
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
        </Row>

        <Form.Item
          name="description"
          label="Açıklama"
          rules={[
            { max: 1000, message: 'Açıklama en fazla 1000 karakter olabilir' }
          ]}
        >
          <TextArea 
            rows={3} 
            placeholder="Ürün açıklamasını giriniz"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Card>

      {/* Fiyat Bilgileri */}
      <Card title="Fiyat Bilgileri" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
            >
              <Select>
                <Option value={Currency.TRY}>Türk Lirası (₺)</Option>
                <Option value={Currency.USD}>Amerikan Doları ($)</Option>
                <Option value={Currency.EUR}>Euro (€)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="costPrice"
              label="Maliyet Fiyatı"
              rules={[
                { required: true, message: 'Maliyet fiyatı zorunludur' },
                { type: 'number', min: 0, message: 'Maliyet fiyatı 0 veya pozitif olmalıdır' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                onChange={handlePriceChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="listPrice"
              label="Satış Fiyatı"
              rules={[
                { required: true, message: 'Satış fiyatı zorunludur' },
                { type: 'number', min: 0, message: 'Satış fiyatı 0 veya pozitif olmalıdır' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                onChange={handlePriceChange}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vatRate"
              label="KDV Oranı (%)"
              rules={[{ required: true, message: 'KDV oranı zorunludur' }]}
            >
              <Select>
                <Option value={0}>%0</Option>
                <Option value={1}>%1</Option>
                <Option value={8}>%8</Option>
                <Option value={18}>%18</Option>
                <Option value={20}>%20</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Kar Marjı (Otomatik)">
              <Input
                value={profitMargin > 0 ? `%${profitMargin}` : '%0'}
                disabled
                style={{
                  backgroundColor: profitMargin > 0 ? '#f6ffed' : '#fff2f0',
                  color: profitMargin > 0 ? '#52c41a' : '#a8071a',
                  fontWeight: 'bold'
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Stok Bilgileri */}
      <Card title="Stok Bilgileri" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="stockQuantity"
              label="Stok Miktarı"
              rules={[
                { required: true, message: 'Stok miktarı zorunludur' },
                { type: 'number', min: 0, message: 'Stok miktarı 0 veya pozitif olmalıdır' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minStockLevel"
              label="Minimum Stok Seviyesi"
              rules={[
                { type: 'number', min: 0, message: 'Minimum stok seviyesi 0 veya pozitif olmalıdır' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isService"
              label="Hizmet Ürünü"
              valuePropName="checked"
              tooltip="Hizmet ürünleri için stok takibi yapılmaz"
            >
              <Switch 
                checkedChildren="Hizmet" 
                unCheckedChildren="Ürün"
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
      </Card>

      {/* Ek Bilgiler */}
      <Card title="Ek Bilgiler" size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="imageUrl"
              label="Ürün Resmi URL"
              rules={[
                { type: 'url', message: 'Geçerli bir URL giriniz (http:// veya https:// ile başlamalı)' },
                { max: 255, message: 'URL en fazla 255 karakter olabilir' }
              ]}
            >
              <Input placeholder="https://example.com/product-image.jpg" />
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
            placeholder="Ürün hakkında ek notlar..."
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

export default ProductForm 