import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Card,
  message,
  Typography,
  Divider,
  Tooltip
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  BarcodeOutlined
} from '@ant-design/icons'
import variantService, { ProductVariant, CreateVariantRequest, UpdateVariantRequest, Currency } from '../services/variantService'
import productService, { Product } from '../services/productService'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface VariantFormProps {
  variant?: ProductVariant | null
  onSuccess: () => void
  onCancel: () => void
}

const VariantForm: React.FC<VariantFormProps> = ({ variant, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [autoGenerateSKU, setAutoGenerateSKU] = useState(true)

  // Load products
  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 100 })
      setProducts(response.data.products)
      
      // If editing variant, find and set the product
      if (variant?.productId) {
        const product = response.data.products.find(p => p.id === variant.productId)
        setSelectedProduct(product || null)
      }
    } catch (error: any) {
      console.error('Products load error:', error)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Initialize form with variant data
  useEffect(() => {
    if (variant) {
      form.setFieldsValue({
        sku: variant.sku,
        productId: variant.productId,
        color: variant.color,
        size: variant.size,
        capacity: variant.capacity,
        material: variant.material,
        style: variant.style,
        unitPrice: variant.unitPrice,
        currency: variant.currency,
        stockQuantity: variant.stockQuantity,
        minStockLevel: variant.minStockLevel,
        isActive: variant.isActive,
        imageUrl: variant.imageUrl,
        notes: variant.notes
      })
      setAutoGenerateSKU(false)
    } else {
      // Set defaults for new variant
      form.setFieldsValue({
        currency: 'TRY',
        stockQuantity: 0,
        minStockLevel: 5,
        isActive: true,
        unitPrice: 0
      })
    }
  }, [variant, form])

  // Handle product selection
  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    
    if (autoGenerateSKU && product) {
      generateSKU(product)
    }
  }

  // Generate SKU based on product and attributes
  const generateSKU = (product: Product, attributes?: any) => {
    const currentValues = attributes || form.getFieldsValue()
    const generatedSKU = variantService.generateSKU(product.code, {
      color: currentValues.color,
      size: currentValues.size,
      material: currentValues.material
    })
    form.setFieldValue('sku', generatedSKU)
  }

  // Handle attribute changes for auto SKU generation
  const handleAttributeChange = () => {
    if (autoGenerateSKU && selectedProduct) {
      generateSKU(selectedProduct)
    }
  }

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      const requestData: CreateVariantRequest | UpdateVariantRequest = {
        sku: values.sku,
        productId: values.productId,
        color: values.color,
        size: values.size,
        capacity: values.capacity,
        material: values.material,
        style: values.style,
        unitPrice: values.unitPrice,
        currency: values.currency,
        stockQuantity: values.stockQuantity,
        minStockLevel: values.minStockLevel,
        isActive: values.isActive,
        imageUrl: values.imageUrl,
        notes: values.notes
      }

      if (variant) {
        await variantService.updateVariant(variant.id, requestData)
      } else {
        await variantService.createVariant(requestData as CreateVariantRequest)
      }

      onSuccess()
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle form reset
  const handleReset = () => {
    form.resetFields()
    if (!variant) {
      form.setFieldsValue({
        currency: 'TRY',
        stockQuantity: 0,
        minStockLevel: 5,
        isActive: true,
        unitPrice: 0
      })
    }
  }

  // Common colors for quick selection
  const commonColors = [
    'Kırmızı', 'Mavi', 'Yeşil', 'Sarı', 'Siyah', 'Beyaz', 
    'Gri', 'Kahverengi', 'Turuncu', 'Mor', 'Pembe', 'Lacivert'
  ]

  // Common sizes for quick selection
  const commonSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'
  ]

  // Common materials for quick selection
  const commonMaterials = [
    'Pamuk', 'Polyester', 'Denim', 'Deri', 'Süet', 'Yün', 
    'İpek', 'Keten', 'Viskon', 'Akrilik', 'Naylon'
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: '100%' }}
    >
      <Row gutter={24}>
        {/* Left Column */}
        <Col span={12}>
          {/* Basic Information */}
          <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Ürün"
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçiniz' }]}
                >
                  <Select
                    placeholder="Ürün seçiniz"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleProductChange}
                    disabled={!!variant} // Product cannot be changed when editing
                  >
                    {products.map(product => (
                      <Option key={product.id} value={product.id}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            Kod: {product.code} | Marka: {product.brand || 'Belirtilmemiş'}
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item
                  label={
                    <span>
                      SKU (Stok Kodu)
                      <Tooltip title="Benzersiz varyant kodu. Otomatik oluşturulabilir.">
                        <InfoCircleOutlined style={{ marginLeft: '4px' }} />
                      </Tooltip>
                    </span>
                  }
                  name="sku"
                  rules={[{ required: true, message: 'SKU giriniz' }]}
                >
                  <Input 
                    prefix={<BarcodeOutlined />}
                    placeholder="Örn: SHIRT-RED-M"
                    disabled={autoGenerateSKU && !variant}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label=" " style={{ marginTop: '30px' }}>
                  <Tooltip title="SKU'yu otomatik oluştur">
                    <Switch
                      checked={autoGenerateSKU}
                      onChange={setAutoGenerateSKU}
                      checkedChildren="Otomatik"
                      unCheckedChildren="Manuel"
                      disabled={!!variant}
                    />
                  </Tooltip>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Variant Attributes */}
          <Card title="Varyant Özellikleri" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Renk" name="color">
                  <Select
                    placeholder="Renk seçiniz"
                    allowClear
                    showSearch
                    onChange={handleAttributeChange}
                  >
                    {commonColors.map(color => (
                      <Option key={color} value={color}>{color}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Beden" name="size">
                  <Select
                    placeholder="Beden seçiniz"
                    allowClear
                    showSearch
                    onChange={handleAttributeChange}
                  >
                    {commonSizes.map(size => (
                      <Option key={size} value={size}>{size}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Malzeme" name="material">
                  <Select
                    placeholder="Malzeme seçiniz"
                    allowClear
                    showSearch
                    onChange={handleAttributeChange}
                  >
                    {commonMaterials.map(material => (
                      <Option key={material} value={material}>{material}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Kapasite" name="capacity">
                  <Input placeholder="Örn: 500ml, 1TB, 64GB" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Stil" name="style">
                  <Input placeholder="Örn: Klasik, Spor, Casual" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column */}
        <Col span={12}>
          {/* Pricing */}
          <Card title="Fiyatlandırma" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  label="Birim Fiyat"
                  name="unitPrice"
                  rules={[{ required: true, message: 'Birim fiyat giriniz' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Para Birimi"
                  name="currency"
                  rules={[{ required: true, message: 'Para birimi seçiniz' }]}
                >
                  <Select>
                    <Option value={Currency.TRY}>TRY (₺)</Option>
                    <Option value={Currency.USD}>USD ($)</Option>
                    <Option value={Currency.EUR}>EUR (€)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Stock Management */}
          <Card title="Stok Yönetimi" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Stok Miktarı"
                  name="stockQuantity"
                  rules={[{ required: true, message: 'Stok miktarı giriniz' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Minimum Stok"
                  name="minStockLevel"
                  rules={[{ required: true, message: 'Minimum stok giriniz' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="5"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          <Card title="Ek Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Görsel URL" name="imageUrl">
                  <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Notlar" name="notes">
                  <TextArea
                    rows={3}
                    placeholder="Varyant hakkında ek notlar..."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="isActive" valuePropName="checked">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Switch />
                    <Text>Varyant aktif</Text>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Form Actions */}
      <Row justify="end" gutter={16}>
        <Col>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Sıfırla
          </Button>
        </Col>
        <Col>
          <Button onClick={onCancel}>
            İptal
          </Button>
        </Col>
        <Col>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
          >
            {variant ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Col>
      </Row>
    </Form>
  )
}

export default VariantForm 