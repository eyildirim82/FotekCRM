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
  App,
  Row,
  Col,
  Typography,
  Statistic,
  Avatar,
  InputNumber
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
  WarningOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import productService, { Product, ProductCategory, ProductStatus } from '../services/productService'
import ProductForm from './ProductForm'
import ProductDetail from './ProductDetail'

const { Search } = Input
const { Option } = Select
const { Title } = Typography

interface ProductStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  outOfStock: number
  totalValue: number
  averageProfitMargin: number
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: number[]) => 
      `${range[0]}-${range[1]} / ${total} ürün`
  })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    stockStatus: '',
    minPrice: '',
    maxPrice: ''
  })
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    averageProfitMargin: 0
  })
  
  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const { message } = App.useApp()

  // Load products
  const loadProducts = async (
    page = 1, 
    pageSize = 10, 
    search = '', 
    category = '', 
    isActive = '', 
    stockStatus = '',
    minPrice = '',
    maxPrice = ''
  ) => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: pageSize
      }
      
      if (search) params.search = search
      if (category) params.category = category
      if (isActive !== '') params.isActive = isActive === 'true'
      if (stockStatus) params.stockStatus = stockStatus
      if (minPrice) params.minPrice = parseFloat(minPrice)
      if (maxPrice) params.maxPrice = parseFloat(maxPrice)
      
      const response = await productService.getProducts(params)
      
      setProducts(response.data.products)
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
      const response = await productService.getProductStats()
      setStats(response.data)
    } catch (error: any) {
      console.error('Stats load error:', error)
    }
  }

  // Initial load
  useEffect(() => {
    loadProducts()
    loadStats()
  }, [])

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (paginationInfo: any) => {
    loadProducts(
      paginationInfo.current,
      paginationInfo.pageSize,
      filters.search,
      filters.category,
      filters.isActive,
      filters.stockStatus,
      filters.minPrice,
      filters.maxPrice
    )
  }

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    loadProducts(1, pagination.pageSize, value, filters.category, filters.isActive, filters.stockStatus, filters.minPrice, filters.maxPrice)
  }

  // Handle category filter
  const handleCategoryFilter = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }))
    loadProducts(1, pagination.pageSize, filters.search, value, filters.isActive, filters.stockStatus, filters.minPrice, filters.maxPrice)
  }

  // Handle active filter
  const handleActiveFilter = (value: string) => {
    setFilters(prev => ({ ...prev, isActive: value }))
    loadProducts(1, pagination.pageSize, filters.search, filters.category, value, filters.stockStatus, filters.minPrice, filters.maxPrice)
  }

  // Handle stock status filter
  const handleStockStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, stockStatus: value }))
    loadProducts(1, pagination.pageSize, filters.search, filters.category, filters.isActive, value, filters.minPrice, filters.maxPrice)
  }

  // Handle price range filter
  const handlePriceRangeFilter = (minPrice: string, maxPrice: string) => {
    setFilters(prev => ({ ...prev, minPrice, maxPrice }))
    loadProducts(1, pagination.pageSize, filters.search, filters.category, filters.isActive, filters.stockStatus, minPrice, maxPrice)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadProducts(pagination.current, pagination.pageSize, filters.search, filters.category, filters.isActive, filters.stockStatus, filters.minPrice, filters.maxPrice)
    loadStats()
  }

  // Handle create/edit success
  const handleFormSuccess = () => {
    setFormModalVisible(false)
    setEditingProduct(null)
    handleRefresh()
    message.success(editingProduct ? 'Ürün başarıyla güncellendi' : 'Ürün başarıyla oluşturuldu')
  }

  // Handle delete
  const handleDelete = async (product: Product) => {
    try {
      await productService.deleteProduct(product.id)
      message.success('Ürün başarıyla silindi')
      handleRefresh()
    } catch (error: any) {
      message.error(error.message)
    }
  }

  // Get product avatar (first letter of name or product icon)
  const getProductAvatar = (product: Product) => {
    if (product.imageUrl) {
      return <Avatar src={product.imageUrl} />
    }
    return (
      <Avatar style={{ backgroundColor: '#1890ff' }}>
        {product.name.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  // Get stock status icon
  const getStockStatusIcon = (product: Product) => {
    if (product.isService) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
    
    switch (product.status) {
      case ProductStatus.OUT_OF_STOCK:
        return <StopOutlined style={{ color: '#f5222d' }} />
      case ProductStatus.LOW_STOCK:
        return <WarningOutlined style={{ color: '#fa8c16' }} />
      case ProductStatus.INACTIVE:
        return <StopOutlined style={{ color: '#8c8c8c' }} />
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
  }

  // Table columns
  const columns: ColumnsType<Product> = [
    {
      title: 'Ürün',
      key: 'product',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getProductAvatar(record)}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {record.name}
              {getStockStatusIcon(record)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Kod: {record.code}
              {record.brand && ` • ${record.brand}`}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (category: string) => (
        category ? (
          <Tag color={productService.getCategoryColor(category)}>
            {productService.getCategoryText(category)}
          </Tag>
        ) : '-'
      )
    },
    {
      title: 'Fiyat Bilgileri',
      key: 'pricing',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
            Satış: {productService.formatCurrency(record.listPrice, record.currency)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Maliyet: {productService.formatCurrency(record.costPrice, record.currency)}
          </div>
          {record.profitMargin !== undefined && record.profitMargin > 0 && (
            <div style={{ fontSize: '12px', color: '#52c41a' }}>
              Kar: {productService.formatProfitMargin(record.profitMargin)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Stok',
      key: 'stock',
      width: 120,
      render: (_, record) => {
        if (record.isService) {
          return <Tag color="blue">Hizmet</Tag>
        }
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {productService.formatStock(record.stockQuantity, record.unit)}
            </div>
            {record.minStockLevel > 0 && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                Min: {productService.formatStock(record.minStockLevel, record.unit)}
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={productService.getStatusColor(record.status!)}>
          {productService.getStatusText(record.status!)}
        </Tag>
      )
    },
    {
      title: 'KDV',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 80,
      render: (vatRate: number) => `%${vatRate}`
    },
    {
      title: 'Değer',
      key: 'value',
      width: 120,
      render: (_, record) => {
        if (record.isService) return '-'
        const value = record.stockQuantity * record.costPrice
        return productService.formatCurrency(value, record.currency)
      }
    },
    {
      title: 'Oluşturan',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy: any) => 
        createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : '-'
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR')
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setViewingProduct(record)
              setDetailModalVisible(true)
            }}
            title="Detay"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record)
              setFormModalVisible(true)
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Ürünü silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz."
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="Sil"
            />
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
              title="Toplam Ürün"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Aktif Ürün"
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
              value={productService.formatCurrency(stats.totalValue)}
              valueStyle={{ color: '#722ed1' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Ortalama Kar"
              value={productService.formatProfitMargin(stats.averageProfitMargin)}
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
              Ürün Listesi
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null)
                  setFormModalVisible(true)
                }}
              >
                Yeni Ürün
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
            <Col span={6}>
              <Search
                placeholder="Ürün adı, kodu, marka ile ara..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={3}>
              <Select
                placeholder="Kategori"
                allowClear
                style={{ width: '100%' }}
                onChange={handleCategoryFilter}
                value={filters.category || undefined}
              >
                <Option value={ProductCategory.ELECTRONICS}>Elektronik</Option>
                <Option value={ProductCategory.OFFICE_SUPPLIES}>Ofis Malzemeleri</Option>
                <Option value={ProductCategory.MACHINERY}>Makine & Ekipman</Option>
                <Option value={ProductCategory.SOFTWARE}>Yazılım</Option>
                <Option value={ProductCategory.SERVICES}>Hizmetler</Option>
                <Option value={ProductCategory.OTHER}>Diğer</Option>
              </Select>
            </Col>
            <Col span={3}>
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
            <Col span={3}>
              <Select
                placeholder="Stok Durumu"
                allowClear
                style={{ width: '100%' }}
                onChange={handleStockStatusFilter}
                value={filters.stockStatus || undefined}
              >
                <Option value="in_stock">Stokta</Option>
                <Option value="low_stock">Düşük Stok</Option>
                <Option value="out_of_stock">Stok Yok</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Input.Group compact>
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
              </Input.Group>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false)
          setEditingProduct(null)
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormModalVisible(false)}
        />
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        title="Ürün Detayları"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setViewingProduct(null)
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
              setEditingProduct(viewingProduct)
              setFormModalVisible(true)
            }}
          >
            Düzenle
          </Button>
        ]}
        width={900}
      >
        {viewingProduct && (
          <ProductDetail product={viewingProduct} />
        )}
      </Modal>
    </div>
  )
}

export default ProductList 