import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Space,
  Table,
  InputNumber,
  DatePicker,
  message,
  Divider,
  Typography,
  Alert,
  Popconfirm,
  AutoComplete,
  Tag,
  Spin
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import orderService, {
  Order,
  OrderLine,
  CreateOrderData,
  UpdateOrderData,
  OrderStatus,
  Currency,
  calculateLineTotal,
  formatCurrency
} from '../services/orderService'
import companyService from '../services/companyService'
import productService from '../services/productService'
import variantService from '../services/variantService'

const { Option } = Select
const { TextArea } = Input
const { Title, Text } = Typography

interface OrderFormProps {
  order?: Order | null
  onSuccess: () => void
  onCancel: () => void
}

interface OrderLineData extends Omit<OrderLine, 'id' | 'orderId' | 'subtotalPrice' | 'vatAmount' | 'totalPrice'> {
  key?: string
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSuccess, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [orderLines, setOrderLines] = useState<OrderLineData[]>([])
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    vat: 0,
    total: 0
  })

  const isEditMode = !!order
  const isEditable = !order || order.status === OrderStatus.DRAFT

  // Load initial data
  useEffect(() => {
    loadCompanies()
    loadProducts()
    loadVariants()
    
    if (order) {
      initializeForm()
    } else {
      addOrderLine()
    }
  }, [order])

  // Calculate totals when order lines change
  useEffect(() => {
    calculateTotals()
  }, [orderLines, form.getFieldValue('discountAmount')])

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ limit: 1000 })
      // Fix: companies are in response.data.companies, not response.data
      setCompanies(response.data?.companies || [])
    } catch (error: any) {
      message.error('Müşteriler yüklenirken hata oluştu')
      setCompanies([])
    }
  }

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 })
      // Fix: products are in response.data.products, not response.data
      setProducts(response.data?.products || [])
    } catch (error: any) {
      message.error('Ürünler yüklenirken hata oluştu')
      setProducts([])
    }
  }

  const loadVariants = async () => {
    try {
      const response = await variantService.getVariants({ limit: 1000 })
      // Fix: variants are in response.data.variants, not response.data
      setVariants(response.data?.variants || [])
    } catch (error: any) {
      message.error('Varyantlar yüklenirken hata oluştu')
      setVariants([])
    }
  }

  const initializeForm = () => {
    if (!order) return

    // Set customer
    const customer = (companies || []).find(c => c.id === order.customerId)
    setSelectedCustomer(customer)

    // Set form values
    form.setFieldsValue({
      customerId: order.customerId,
      discountAmount: order.discountAmount,
      currency: order.currency,
      status: order.status,
      orderDate: order.orderDate ? dayjs(order.orderDate) : dayjs(),
      deliveryDate: order.deliveryDate ? dayjs(order.deliveryDate) : null,
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      internalNotes: order.internalNotes
    })

    // Set order lines
    const lines = order.orderLines.map((line, index) => ({
      key: `line-${index}`,
      productId: line.productId,
      variantId: line.variantId,
      itemCode: line.itemCode,
      itemName: line.itemName,
      itemDescription: line.itemDescription,
      quantity: line.quantity,
      unit: line.unit,
      unitPrice: line.unitPrice,
      discountPercent: line.discountPercent,
      discountAmount: line.discountAmount,
      vatRate: line.vatRate,
      currency: line.currency,
      notes: line.notes
    }))
    setOrderLines(lines)
  }

  const addOrderLine = () => {
    const newLine: OrderLineData = {
      key: `line-${Date.now()}`,
      itemCode: '',
      itemName: '',
      itemDescription: '',
      quantity: 1,
      unit: 'adet',
      unitPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      vatRate: 18,
      currency: form.getFieldValue('currency') || 'TRY',
      notes: ''
    }
    setOrderLines([...orderLines, newLine])
  }

  const removeOrderLine = (key: string) => {
    setOrderLines(orderLines.filter(line => line.key !== key))
  }

  const updateOrderLine = (key: string, field: string, value: any) => {
    const updatedLines = orderLines.map(line => {
      if (line.key === key) {
        const updatedLine = { ...line, [field]: value }
        
        // Auto-calculate prices when quantity, unitPrice, discountPercent, or vatRate changes
        if (['quantity', 'unitPrice', 'discountPercent', 'vatRate'].includes(field)) {
          const calculated = calculateLineTotal(
            updatedLine.quantity,
            updatedLine.unitPrice,
            updatedLine.discountPercent,
            updatedLine.vatRate
          )
          updatedLine.discountAmount = calculated.discountAmount
        }
        
        return updatedLine
      }
      return line
    })
    setOrderLines(updatedLines)
  }

  const selectProduct = (key: string, productId: number) => {
    const product = (products || []).find(p => p.id === productId)
    if (product) {
      updateOrderLine(key, 'productId', productId)
      updateOrderLine(key, 'itemCode', product.code)
      updateOrderLine(key, 'itemName', product.name)
      updateOrderLine(key, 'itemDescription', product.description)
      updateOrderLine(key, 'unitPrice', product.listPrice)
      updateOrderLine(key, 'unit', product.unit)
      updateOrderLine(key, 'currency', product.currency)
      
      // Clear variant if product changes
      updateOrderLine(key, 'variantId', undefined)
    }
  }

  const selectVariant = (key: string, variantId: number) => {
    const variant = (variants || []).find(v => v.id === variantId)
    if (variant) {
      const product = (products || []).find(p => p.id === variant.productId)
      updateOrderLine(key, 'variantId', variantId)
      updateOrderLine(key, 'productId', variant.productId)
      updateOrderLine(key, 'itemCode', variant.sku)
      updateOrderLine(key, 'itemName', product?.name || '')
      updateOrderLine(key, 'itemDescription', `${variant.color} ${variant.size} ${variant.material}`.trim())
      updateOrderLine(key, 'unitPrice', variant.unitPrice)
      updateOrderLine(key, 'currency', variant.currency)
    }
  }

  const calculateTotals = () => {
    const subtotal = orderLines.reduce((sum, line) => {
      const lineTotal = calculateLineTotal(line.quantity, line.unitPrice, line.discountPercent, line.vatRate)
      return sum + lineTotal.subtotalPrice
    }, 0)

    const vat = orderLines.reduce((sum, line) => {
      const lineTotal = calculateLineTotal(line.quantity, line.unitPrice, line.discountPercent, line.vatRate)
      return sum + lineTotal.vatAmount
    }, 0)

    const discount = form.getFieldValue('discountAmount') || 0
    const total = subtotal + vat - discount

    setTotals({ subtotal, discount, vat, total })
  }

  const validateStock = async (): Promise<boolean> => {
    // Stock validation logic would go here
    // For now, we'll assume stock is available
    return true
  }

  const handleSubmit = async (values: any) => {
    try {
      if (orderLines.length === 0) {
        message.error('En az bir ürün eklemeniz gerekiyor')
        return
      }

      // Validate stock
      const stockValid = await validateStock()
      if (!stockValid) {
        return
      }

      setLoading(true)

      const orderData = {
        customerId: values.customerId,
        orderLines: orderLines.map(line => ({
          productId: line.productId,
          variantId: line.variantId,
          itemCode: line.itemCode,
          itemName: line.itemName,
          itemDescription: line.itemDescription,
          quantity: line.quantity,
          unit: line.unit,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent,
          vatRate: line.vatRate,
          currency: line.currency,
          notes: line.notes
        })),
        discountAmount: values.discountAmount || 0,
        currency: values.currency || 'TRY',
        status: values.status || OrderStatus.DRAFT,
        orderDate: values.orderDate?.format('YYYY-MM-DD'),
        deliveryDate: values.deliveryDate?.format('YYYY-MM-DD'),
        shippingAddress: values.shippingAddress,
        shippingMethod: values.shippingMethod,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        notes: values.notes,
        internalNotes: values.internalNotes
      }

      if (isEditMode && order) {
        await orderService.updateOrder(order.id, orderData as UpdateOrderData)
        message.success('Sipariş başarıyla güncellendi')
      } else {
        await orderService.createOrder(orderData as CreateOrderData)
        message.success('Sipariş başarıyla oluşturuldu')
      }

      onSuccess()
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Order lines table columns
  const orderLineColumns = [
    {
      title: 'Ürün/Varyant',
      key: 'item',
      width: 250,
      render: (record: OrderLineData) => (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder="Ürün seçin"
            style={{ width: '100%', marginBottom: 4 }}
            value={record.productId}
            onChange={(value) => selectProduct(record.key!, value)}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
            disabled={!isEditable}
          >
            {(products || []).map(product => (
              <Option key={product.id} value={product.id}>
                {product.name} ({product.code})
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Varyant seçin"
            style={{ width: '100%' }}
            value={record.variantId}
            onChange={(value) => selectVariant(record.key!, value)}
            showSearch
            allowClear
            disabled={!isEditable}
          >
            {(variants || [])
              .filter(variant => !record.productId || variant.productId === record.productId)
              .map(variant => (
                <Option key={variant.id} value={variant.id}>
                  {variant.sku} - {variant.color} {variant.size}
                </Option>
              ))}
          </Select>
        </Space>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (record: OrderLineData) => (
        <InputNumber
          min={0.01}
          step={0.01}
          value={record.quantity}
          onChange={(value) => updateOrderLine(record.key!, 'quantity', value || 0)}
          style={{ width: '100%' }}
          disabled={!isEditable}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (record: OrderLineData) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => updateOrderLine(record.key!, 'unitPrice', value || 0)}
          style={{ width: '100%' }}
          disabled={!isEditable}
          formatter={(value) => `₺ ${value}`}
          parser={(value) => value?.replace('₺ ', '') as any}
        />
      ),
    },
    {
      title: 'İskonto %',
      key: 'discountPercent',
      width: 100,
      render: (record: OrderLineData) => (
        <InputNumber
          min={0}
          max={100}
          step={0.1}
          value={record.discountPercent}
          onChange={(value) => updateOrderLine(record.key!, 'discountPercent', value || 0)}
          style={{ width: '100%' }}
          disabled={!isEditable}
          formatter={(value) => `${value}%`}
          parser={(value) => value?.replace('%', '') as any}
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 80,
      render: (record: OrderLineData) => (
        <InputNumber
          min={0}
          max={100}
          step={1}
          value={record.vatRate}
          onChange={(value) => updateOrderLine(record.key!, 'vatRate', value || 18)}
          style={{ width: '100%' }}
          disabled={!isEditable}
          formatter={(value) => `${value}%`}
          parser={(value) => value?.replace('%', '') as any}
        />
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 120,
      render: (record: OrderLineData) => {
        const calculated = calculateLineTotal(
          record.quantity,
          record.unitPrice,
          record.discountPercent,
          record.vatRate
        )
        return (
          <Text strong>
            {formatCurrency(calculated.totalPrice, record.currency)}
          </Text>
        )
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 60,
      render: (record: OrderLineData) => (
        <Popconfirm
          title="Bu satırı silmek istediğinizden emin misiniz?"
          onConfirm={() => removeOrderLine(record.key!)}
          disabled={!isEditable}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={!isEditable}
          />
        </Popconfirm>
      ),
    },
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        currency: 'TRY',
        status: OrderStatus.DRAFT,
        orderDate: dayjs()
      }}
    >
      <Row gutter={24}>
        {/* Left Column - Customer & Order Lines */}
        <Col xs={24} lg={16}>
          {/* Customer Selection */}
          <Card title="Müşteri Bilgileri" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="customerId"
                  label="Müşteri"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                >
                  <Select
                    placeholder="Müşteri seçin"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => {
                      const customer = (companies || []).find(c => c.id === value)
                      setSelectedCustomer(customer)
                    }}
                    disabled={!isEditable}
                  >
                                {(companies || []).map(company => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="shippingAddress" label="Teslimat Adresi">
                  <TextArea
                    rows={3}
                    placeholder="Teslimat adresi"
                    disabled={!isEditable}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Order Lines */}
          <Card 
            title="Sipariş Kalemleri" 
            style={{ marginBottom: 16 }}
            extra={
              isEditable && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addOrderLine}
                >
                  Ürün Ekle
                </Button>
              )
            }
          >
            <Table
              columns={orderLineColumns}
              dataSource={orderLines}
              pagination={false}
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>

        {/* Right Column - Order Details & Summary */}
        <Col xs={24} lg={8}>
          {/* Order Details */}
          <Card title="Sipariş Detayları" style={{ marginBottom: 16 }}>
            <Form.Item name="status" label="Durum">
              <Select disabled={!isEditable}>
                <Option value={OrderStatus.DRAFT}>Taslak</Option>
                <Option value={OrderStatus.CONFIRMED}>Onaylandı</Option>
              </Select>
            </Form.Item>

            <Form.Item name="orderDate" label="Sipariş Tarihi">
              <DatePicker style={{ width: '100%' }} disabled={!isEditable} />
            </Form.Item>

            <Form.Item name="deliveryDate" label="Teslimat Tarihi">
              <DatePicker style={{ width: '100%' }} disabled={!isEditable} />
            </Form.Item>

            <Form.Item name="shippingMethod" label="Kargo Yöntemi">
              <Input placeholder="Kargo yöntemi" disabled={!isEditable} />
            </Form.Item>

            <Form.Item name="paymentMethod" label="Ödeme Yöntemi">
              <Select placeholder="Ödeme yöntemi" disabled={!isEditable}>
                <Option value="cash">Nakit</Option>
                <Option value="credit_card">Kredi Kartı</Option>
                <Option value="bank_transfer">Havale/EFT</Option>
                <Option value="check">Çek</Option>
              </Select>
            </Form.Item>

            <Form.Item name="currency" label="Para Birimi">
              <Select disabled={!isEditable}>
                <Option value="TRY">₺ TRY</Option>
                <Option value="USD">$ USD</Option>
                <Option value="EUR">€ EUR</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Order Summary */}
          <Card title="Sipariş Özeti">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Ara Toplam:</Text>
                <Text>{formatCurrency(totals.subtotal)}</Text>
              </div>
              
              <Form.Item name="discountAmount" label="Sipariş İskontosu" style={{ marginBottom: 8 }}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  formatter={(value) => `₺ ${value}`}
                  parser={(value) => value?.replace('₺ ', '') as any}
                  disabled={!isEditable}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>KDV:</Text>
                <Text>{formatCurrency(totals.vat)}</Text>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: 16 }}>TOPLAM:</Text>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  {formatCurrency(totals.total)}
                </Text>
              </div>
            </Space>
          </Card>

          {/* Notes */}
          <Card title="Notlar" style={{ marginTop: 16 }}>
            <Form.Item name="notes" label="Müşteri Notu">
              <TextArea rows={2} placeholder="Müşteri için not" disabled={!isEditable} />
            </Form.Item>
            <Form.Item name="internalNotes" label="İç Not">
              <TextArea rows={2} placeholder="İç kullanım notu" disabled={!isEditable} />
            </Form.Item>
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div style={{ textAlign: 'right', marginTop: 24 }}>
        <Space>
          <Button onClick={onCancel}>
            İptal
          </Button>
          {isEditable && (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          )}
        </Space>
      </div>
    </Form>
  )
}

export default OrderForm 