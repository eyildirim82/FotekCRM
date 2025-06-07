import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Modal,
  Popconfirm,
  message,
  Statistic,
  Row,
  Col,
  Tooltip,
  Avatar,
  Typography,
  Dropdown,
  MenuProps,
  Spin
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CarOutlined,
  DeliveredProcedureOutlined,
  CloseOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  MoreOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import orderService, {
  Order,
  OrderFilters,
  OrderStats,
  OrderStatus,
  getStatusText,
  getStatusColor,
  getStatusActions,
  formatCurrency
} from '../services/orderService'
import companyService from '../services/companyService'
import OrderForm from './OrderForm'
import OrderDetail from './OrderDetail'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Title, Text } = Typography

interface OrderListProps {
  customerId?: string
}

const OrderList: React.FC<OrderListProps> = ({ customerId }) => {
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    draftOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  })
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: number[]) => 
      `${range[0]}-${range[1]} / ${total} sipariş`,
  })

  // Filter state
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    customerId: customerId || '',
    startDate: '',
    endDate: ''
  })

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  // Load data
  useEffect(() => {
    loadOrders()
    loadStats()
    loadCompanies()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getOrders(filters)
      setOrders(response.data)
      setPagination(prev => ({
        ...prev,
        current: response.pagination.page,
        total: response.pagination.total,
        pageSize: response.pagination.limit
      }))
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const response = await orderService.getOrderStats({
        customerId: filters.customerId,
        startDate: filters.startDate,
        endDate: filters.endDate
      })
      setStats(response.data)
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies({ limit: 1000 })
      // Fix: companies are in response.data.companies, not response.data
      setCompanies(response.data?.companies || [])
    } catch (error: any) {
      console.error('Error loading companies:', error)
      setCompanies([]) // Ensure companies is always an array
    }
  }

  // Event handlers
  const handleTableChange = (paginationConfig: any) => {
    setFilters(prev => ({
      ...prev,
      page: paginationConfig.current,
      limit: paginationConfig.pageSize
    }))
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }))
  }

  const handleCustomerFilter = (customerId: string) => {
    setFilters(prev => ({ ...prev, customerId, page: 1 }))
  }

  const handleDateRangeFilter = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
        page: 1
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: '',
        endDate: '',
        page: 1
      }))
    }
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: '',
      customerId: customerId || '',
      startDate: '',
      endDate: ''
    })
  }

  // Order actions
  const handleCreateOrder = () => {
    setSelectedOrder(null)
    setFormMode('create')
    setIsFormModalOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setFormMode('edit')
    setIsFormModalOpen(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleDeleteOrder = async (id: number) => {
    try {
      await orderService.deleteOrder(id)
      message.success('Sipariş başarıyla silindi')
      loadOrders()
      loadStats()
    } catch (error: any) {
      message.error(error.message)
    }
  }

  const handleStatusAction = async (action: string, order: Order) => {
    try {
      let response
      switch (action) {
        case 'confirm':
          response = await orderService.confirmOrder(order.id)
          message.success('Sipariş onaylandı')
          break
        case 'ship':
          response = await orderService.shipOrder(order.id)
          message.success('Sipariş kargoya verildi')
          break
        case 'deliver':
          response = await orderService.deliverOrder(order.id)
          message.success('Sipariş teslim edildi')
          break
        case 'cancel':
          response = await orderService.cancelOrder(order.id)
          message.success('Sipariş iptal edildi')
          break
        default:
          return
      }
      loadOrders()
      loadStats()
    } catch (error: any) {
      message.error(error.message)
    }
  }

  const getOrderActionItems = (order: Order): MenuProps['items'] => {
    const actions = getStatusActions(order.status as OrderStatus)
    
    return actions.map(action => {
      const actionConfig = {
        view: { label: 'Görüntüle', icon: <EyeOutlined />, onClick: () => handleViewOrder(order) },
        edit: { label: 'Düzenle', icon: <EditOutlined />, onClick: () => handleEditOrder(order) },
        confirm: { label: 'Onayla', icon: <CheckOutlined />, onClick: () => handleStatusAction('confirm', order) },
        ship: { label: 'Kargoya Ver', icon: <CarOutlined />, onClick: () => handleStatusAction('ship', order) },
        deliver: { label: 'Teslim Et', icon: <DeliveredProcedureOutlined />, onClick: () => handleStatusAction('deliver', order) },
        cancel: { label: 'İptal Et', icon: <CloseOutlined />, onClick: () => handleStatusAction('cancel', order), danger: true },
        delete: { label: 'Sil', icon: <DeleteOutlined />, onClick: () => handleDeleteOrder(order.id), danger: true }
      }
      
      return actionConfig[action as keyof typeof actionConfig] ? {
        key: action,
        ...actionConfig[action as keyof typeof actionConfig]
      } : null
    }).filter(Boolean)
  }

  // Table columns
  const columns = [
    {
      title: 'Sipariş',
      key: 'order',
      width: 200,
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          <Space>
            <Avatar 
              icon={<ShoppingCartOutlined />} 
              style={{ 
                backgroundColor: getStatusColor(record.status as OrderStatus) === 'success' ? '#52c41a' :
                                getStatusColor(record.status as OrderStatus) === 'error' ? '#ff4d4f' :
                                getStatusColor(record.status as OrderStatus) === 'warning' ? '#faad14' :
                                getStatusColor(record.status as OrderStatus) === 'processing' ? '#1890ff' : '#d9d9d9'
              }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{record.orderNumber}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(record.orderDate).format('DD.MM.YYYY')}
              </Text>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Müşteri',
      key: 'customer',
      width: 200,
      render: (record: Order) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontWeight: 500 }}>{record.customer?.name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customer?.email || ''}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ürün Sayısı',
      key: 'itemCount',
      width: 100,
      align: 'center' as const,
      render: (record: Order) => (
        <Text>{record.orderLines?.length || 0} ürün</Text>
      ),
    },
    {
      title: 'Tutar',
      key: 'amount',
      width: 150,
      align: 'right' as const,
      render: (record: Order) => (
        <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: 600, fontSize: 16 }}>
            {formatCurrency(record.totalAmount, record.currency)}
          </Text>
          {record.discountAmount > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              İskonto: {formatCurrency(record.discountAmount, record.currency)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Teslimat',
      key: 'delivery',
      width: 120,
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          {record.deliveryDate && (
            <Text style={{ fontSize: 12 }}>
              <CalendarOutlined /> {dayjs(record.deliveryDate).format('DD.MM.YYYY')}
            </Text>
          )}
          {record.shippingMethod && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.shippingMethod}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Oluşturan',
      key: 'createdBy',
      width: 120,
      render: (record: Order) => (
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: 12 }}>
            {record.createdBy?.firstName} {record.createdBy?.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.createdAt).format('DD.MM.YYYY HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (record: Order) => (
        <Dropdown
          menu={{ items: getOrderActionItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Toplam Sipariş"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              loading={statsLoading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Taslak"
              value={stats.draftOrders}
              loading={statsLoading}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Onaylandı"
              value={stats.confirmedOrders}
              loading={statsLoading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Kargoda"
              value={stats.shippedOrders}
              loading={statsLoading}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Teslim Edildi"
              value={stats.deliveredOrders}
              loading={statsLoading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Toplam Ciro"
              value={stats.totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="₺"
              loading={statsLoading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16 
        }}>
          <Title level={4} style={{ margin: 0 }}>
            Siparişler
          </Title>
          {!customerId && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
            >
              Yeni Sipariş
            </Button>
          )}
        </div>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Sipariş ara..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Durum"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="draft">Taslak</Option>
              <Option value="confirmed">Onaylandı</Option>
              <Option value="shipped">Kargoda</Option>
              <Option value="delivered">Teslim Edildi</Option>
              <Option value="cancelled">İptal Edildi</Option>
            </Select>
          </Col>
          {!customerId && (
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Müşteri"
                style={{ width: '100%' }}
                value={filters.customerId}
                onChange={handleCustomerFilter}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {Array.isArray(companies) ? companies.map(company => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                )) : []}
              </Select>
            </Col>
          )}
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeFilter}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button
              icon={<FilterOutlined />}
              onClick={clearFilters}
              title="Filtreleri Temizle"
            >
              Temizle
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => handleViewOrder(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      {/* Order Form Modal */}
      <Modal
        title={formMode === 'create' ? 'Yeni Sipariş' : 'Sipariş Düzenle'}
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        footer={null}
        width={1200}
        destroyOnHidden
      >
        <OrderForm
          order={selectedOrder}
          onSuccess={() => {
            setIsFormModalOpen(false)
            loadOrders()
            loadStats()
          }}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title="Sipariş Detayı"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onEdit={() => {
              setIsDetailModalOpen(false)
              setFormMode('edit')
              setIsFormModalOpen(true)
            }}
            onStatusChange={() => {
              loadOrders()
              loadStats()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default OrderList 