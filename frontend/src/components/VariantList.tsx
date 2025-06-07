import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Card,
  Tag,
  Popconfirm,
  Modal,
  Row,
  Col,
  Typography,
  Statistic,
  Avatar,
  InputNumber,
  Tooltip,
  message
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  StopOutlined,
  WarningOutlined,
  BarcodeOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import variantService, { ProductVariant, VariantStatus } from '../services/variantService'
import productService, { Product } from '../services/productService'
import VariantForm from './VariantForm'
import VariantDetail from './VariantDetail'

const { Search } = Input
const { Option } = Select
const { Title } = Typography

interface VariantStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  outOfStock: number
  totalValue: number
  averagePrice: number
}

const VariantList: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: number[]) => 
      `${range[0]}-${range[1]} / ${total} varyant`
  })
  const [filters, setFilters] = useState({
    search: '',
    color: '',
    size: '',
    material: '',
    isActive: '',
    minPrice: '',
    maxPrice: '',
    productId: ''
  })
  const [stats, setStats] = useState<VariantStats>({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    averagePrice: 0
  })
  const [products, setProducts] = useState<Product[]>([])
  
  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [viewingVariant, setViewingVariant] = useState<ProductVariant | null>(null)

  // Load variants
  const loadVariants = async (
    page = 1, 
    pageSize = 10, 
    search = '', 
    color = '',
    size = '',
    material = '',
    isActive = '', 
    minPrice = '',
    maxPrice = '',
    productId = ''
  ) => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: pageSize
      }
      
      if (search) params.search = search
      if (color) params.color = color
      if (size) params.size = size
      if (material) params.material = material
      if (isActive !== '') params.isActive = isActive === 'true'
      if (minPrice) params.minPrice = parseFloat(minPrice)
      if (maxPrice) params.maxPrice = parseFloat(maxPrice)
      if (productId) params.productId = parseInt(productId)
      
      const response = await variantService.getVariants(params)
      
      setVariants(response.data.variants)
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: response.data.pagination.total
      }))
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await variantService.getVariantStats()
      setStats(response.data)
    } catch (error: any) {
      console.error('Stats load error:', error)
    }
  }

  // Load products for filter
  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 100 })
      setProducts(response.data.products)
    } catch (error: any) {
      console.error('Products load error:', error)
    }
  }

  // Initial load
  useEffect(() => {
    loadVariants()
    loadStats()
    loadProducts()
  }, [])

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (paginationInfo: any) => {
    loadVariants(
      paginationInfo.current,
      paginationInfo.pageSize,
      filters.search,
      filters.color,
      filters.size,
      filters.material,
      filters.isActive,
      filters.minPrice,
      filters.maxPrice,
      filters.productId
    )
  }

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    loadVariants(1, pagination.pageSize, value, filters.color, filters.size, filters.material, filters.isActive, filters.minPrice, filters.maxPrice, filters.productId)
  }

  // Handle color filter
  const handleColorFilter = (value: string) => {
    setFilters(prev => ({ ...prev, color: value }))
    loadVariants(1, pagination.pageSize, filters.search, value, filters.size, filters.material, filters.isActive, filters.minPrice, filters.maxPrice, filters.productId)
  }

  // Handle size filter
  const handleSizeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, size: value }))
    loadVariants(1, pagination.pageSize, filters.search, filters.color, value, filters.material, filters.isActive, filters.minPrice, filters.maxPrice, filters.productId)
  }

  // Handle material filter
  const handleMaterialFilter = (value: string) => {
    setFilters(prev => ({ ...prev, material: value }))
    loadVariants(1, pagination.pageSize, filters.search, filters.color, filters.size, value, filters.isActive, filters.minPrice, filters.maxPrice, filters.productId)
  }

  // Handle active filter
  const handleActiveFilter = (value: string) => {
    setFilters(prev => ({ ...prev, isActive: value }))
    loadVariants(1, pagination.pageSize, filters.search, filters.color, filters.size, filters.material, value, filters.minPrice, filters.maxPrice, filters.productId)
  }

  // Handle product filter
  const handleProductFilter = (value: string) => {
    setFilters(prev => ({ ...prev, productId: value }))
    loadVariants(1, pagination.pageSize, filters.search, filters.color, filters.size, filters.material, filters.isActive, filters.minPrice, filters.maxPrice, value)
  }

  // Handle price range filter
  const handlePriceRangeFilter = (minPrice: string, maxPrice: string) => {
    setFilters(prev => ({ ...prev, minPrice, maxPrice }))
    loadVariants(1, pagination.pageSize, filters.search, filters.color, filters.size, filters.material, filters.isActive, minPrice, maxPrice, filters.productId)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadVariants(pagination.current, pagination.pageSize, filters.search, filters.color, filters.size, filters.material, filters.isActive, filters.minPrice, filters.maxPrice, filters.productId)
    loadStats()
  }

  // Handle create/edit success
  const handleFormSuccess = () => {
    setFormModalVisible(false)
    setEditingVariant(null)
    handleRefresh()
    message.success(editingVariant ? 'Varyant başarıyla güncellendi' : 'Varyant başarıyla oluşturuldu')
  }

  // Handle delete
  const handleDelete = async (variant: ProductVariant) => {
    try {
      await variantService.deleteVariant(variant.id)
      message.success('Varyant başarıyla silindi')
      handleRefresh()
    } catch (error: any) {
      message.error(error.message)
    }
  }

  // Get variant avatar (color or first letter of SKU)
  const getVariantAvatar = (variant: ProductVariant) => {
    if (variant.imageUrl) {
      return <Avatar src={variant.imageUrl} />
    }
    if (variant.color) {
      return (
        <Avatar style={{ backgroundColor: variant.color.toLowerCase() }}>
          {variant.sku.charAt(0).toUpperCase()}
        </Avatar>
      )
    }
    return (
      <Avatar style={{ backgroundColor: '#1890ff' }}>
        {variant.sku.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  // Get stock status icon
  const getStockStatusIcon = (variant: ProductVariant) => {
    switch (variant.status) {
      case VariantStatus.OUT_OF_STOCK:
        return <StopOutlined style={{ color: '#f5222d' }} />
      case VariantStatus.LOW_STOCK:
        return <WarningOutlined style={{ color: '#fa8c16' }} />
      case VariantStatus.INACTIVE:
        return <StopOutlined style={{ color: '#8c8c8c' }} />
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
  }

  // Table columns
  const columns: ColumnsType<ProductVariant> = [
    {
      title: 'Varyant',
      key: 'variant',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {getVariantAvatar(record)}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              <BarcodeOutlined style={{ marginRight: '4px' }} />
              {record.sku}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.product?.name || `Ürün ID: ${record.productId}`}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Özellikler',
      key: 'attributes',
      width: 200,
      render: (_, record) => (
        <div>
          {record.color && (
            <Tag color={record.color.toLowerCase()} style={{ marginBottom: '2px' }}>
              {record.color}
            </Tag>
          )}
          {record.size && (
            <Tag style={{ marginBottom: '2px' }}>
              Beden: {record.size}
            </Tag>
          )}
          {record.material && (
            <Tag style={{ marginBottom: '2px' }}>
              {record.material}
            </Tag>
          )}
          {record.capacity && (
            <Tag style={{ marginBottom: '2px' }}>
              {record.capacity}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {variantService.formatCurrency(record.unitPrice, record.currency)}
          </div>
        </div>
      )
    },
    {
      title: 'Stok',
      key: 'stock',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getStockStatusIcon(record)}
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {variantService.formatStock(record.stockQuantity)}
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              Min: {record.minStockLevel}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={variantService.getStatusColor(record.status!)}>
          {variantService.getStatusText(record.status!)}
        </Tag>
      )
    },
    {
      title: 'Değer',
      key: 'value',
      width: 120,
      render: (_, record) => (
        <div style={{ fontWeight: 'bold' }}>
          {variantService.formatCurrency(record.totalValue || 0, record.currency)}
        </div>
      )
    },
    {
      title: 'Oluşturulma',
      key: 'created',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            {new Date(record.createdAt).toLocaleDateString('tr-TR')}
          </div>
          <div style={{ color: '#666', fontSize: '11px' }}>
            {record.createdBy?.firstName} {record.createdBy?.lastName}
          </div>
        </div>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detayları Görüntüle">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setViewingVariant(record)
                setDetailModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingVariant(record)
                setFormModalVisible(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Varyantı silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz."
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Toplam Varyant"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Aktif Varyant"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Düşük Stok"
              value={stats.lowStock}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Stok Yok"
              value={stats.outOfStock}
              valueStyle={{ color: '#f5222d' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={variantService.formatCurrency(stats.totalValue)}
              valueStyle={{ color: '#722ed1' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Ortalama Fiyat"
              value={variantService.formatCurrency(stats.averagePrice)}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Varyant Listesi
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingVariant(null)
                  setFormModalVisible(true)
                }}
              >
                Yeni Varyant
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                title="Yenile"
              />
            </Space>
          </div>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={5}>
              <Search
                placeholder="SKU, renk, beden ile ara..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={3}>
              <Select
                placeholder="Ürün"
                allowClear
                style={{ width: '100%' }}
                onChange={handleProductFilter}
                value={filters.productId || undefined}
                showSearch
                optionFilterProp="children"
              >
                {products.map(product => (
                  <Option key={product.id} value={product.id.toString()}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={2}>
              <Input
                placeholder="Renk"
                allowClear
                onChange={(e) => handleColorFilter(e.target.value)}
                value={filters.color}
              />
            </Col>
            <Col span={2}>
              <Input
                placeholder="Beden"
                allowClear
                onChange={(e) => handleSizeFilter(e.target.value)}
                value={filters.size}
              />
            </Col>
            <Col span={2}>
              <Input
                placeholder="Malzeme"
                allowClear
                onChange={(e) => handleMaterialFilter(e.target.value)}
                value={filters.material}
              />
            </Col>
            <Col span={2}>
              <Select
                placeholder="Durum"
                allowClear
                style={{ width: '100%' }}
                onChange={handleActiveFilter}
                value={filters.isActive || undefined}
              >
                <Option value="true">Aktif</Option>
                <Option value="false">Pasif</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  placeholder="Min Fiyat"
                  style={{ width: '50%' }}
                  min={0}
                  precision={2}
                  onChange={(value) => handlePriceRangeFilter(value?.toString() || '', filters.maxPrice)}
                />
                <InputNumber
                  placeholder="Max Fiyat"
                  style={{ width: '50%' }}
                  min={0}
                  precision={2}
                  onChange={(value) => handlePriceRangeFilter(filters.minPrice, value?.toString() || '')}
                />
              </Space.Compact>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={variants}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Variant Form Modal */}
      <Modal
        title={editingVariant ? 'Varyant Düzenle' : 'Yeni Varyant'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false)
          setEditingVariant(null)
        }}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <VariantForm
          variant={editingVariant}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormModalVisible(false)}
        />
      </Modal>

      {/* Variant Detail Modal */}
      <Modal
        title="Varyant Detayları"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setViewingVariant(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false)
              setEditingVariant(viewingVariant)
              setFormModalVisible(true)
            }}
          >
            Düzenle
          </Button>
        ]}
        width={800}
      >
        {viewingVariant && (
          <VariantDetail
            variant={viewingVariant}
            onEdit={() => {
              setDetailModalVisible(false)
              setEditingVariant(viewingVariant)
              setFormModalVisible(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default VariantList 