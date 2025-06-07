import React, { useState } from 'react'
import {
  Card,
  Descriptions,
  Table,
  Space,
  Button,
  Tag,
  Typography,
  Row,
  Col,
  Divider,
  Modal,
  message,
  Tooltip,
  Avatar,
  Timeline,
  Statistic
} from 'antd'
import {
  EditOutlined,
  CheckOutlined,
  CarOutlined,
  DeliveredProcedureOutlined,
  CloseOutlined,
  PrinterOutlined,
  MailOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  DollarOutlined,
  HistoryOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import orderService, {
  Order,
  OrderLine,
  OrderStatus,
  getStatusText,
  getStatusColor,
  getStatusActions,
  formatCurrency,
  calculateLineTotal
} from '../services/orderService'

const { Title, Text, Paragraph } = Typography

interface OrderDetailProps {
  order: Order
  onEdit: () => void
  onStatusChange: () => void
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onEdit, onStatusChange }) => {
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const canEdit = order.status === OrderStatus.DRAFT
  const availableActions = getStatusActions(order.status as OrderStatus)

  const handleStatusAction = async (action: string) => {
    try {
      setLoading(true)
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
          Modal.confirm({
            title: 'Siparişi İptal Et',
            content: 'Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            okText: 'Evet, İptal Et',
            cancelText: 'Hayır',
            okType: 'danger',
            onOk: async () => {
              try {
                await orderService.cancelOrder(order.id)
                message.success('Sipariş iptal edildi')
                onStatusChange()
              } catch (error: any) {
                message.error(error.message)
              }
            }
          })
          return
        default:
          return
      }

      onStatusChange()
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionButton = (action: string) => {
    const actionConfig = {
      edit: { 
        label: 'Düzenle', 
        icon: <EditOutlined />, 
        type: 'default' as const,
        onClick: onEdit 
      },
      confirm: { 
        label: 'Onayla', 
        icon: <CheckOutlined />, 
        type: 'primary' as const,
        onClick: () => handleStatusAction('confirm') 
      },
      ship: { 
        label: 'Kargoya Ver', 
        icon: <CarOutlined />, 
        type: 'default' as const,
        onClick: () => handleStatusAction('ship') 
      },
      deliver: { 
        label: 'Teslim Et', 
        icon: <DeliveredProcedureOutlined />, 
        type: 'primary' as const,
        onClick: () => handleStatusAction('deliver') 
      },
      cancel: { 
        label: 'İptal Et', 
        icon: <CloseOutlined />, 
        type: 'default' as const,
        danger: true,
        onClick: () => handleStatusAction('cancel') 
      }
    }
    
    const config = actionConfig[action as keyof typeof actionConfig]
    if (!config) return null

    return (
      <Button
        key={action}
        type={config.type}
        icon={config.icon}
        onClick={config.onClick}
        loading={loading}
        danger={config.danger}
      >
        {config.label}
      </Button>
    )
  }

  // Order lines table columns
  const orderLineColumns = [
    {
      title: 'Ürün',
      key: 'product',
      render: (record: OrderLine) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.itemName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Kod: {record.itemCode}
          </Text>
          {record.itemDescription && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.itemDescription}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      align: 'center' as const,
      render: (record: OrderLine) => (
        <Text>{record.quantity} {record.unit}</Text>
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      align: 'right' as const,
      render: (record: OrderLine) => (
        <Text>{formatCurrency(record.unitPrice, record.currency)}</Text>
      ),
    },
    {
      title: 'İskonto',
      key: 'discount',
      align: 'right' as const,
      render: (record: OrderLine) => (
        <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
          {record.discountPercent > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              %{record.discountPercent}
            </Text>
          )}
          <Text>{formatCurrency(record.discountAmount, record.currency)}</Text>
        </Space>
      ),
    },
    {
      title: 'KDV',
      key: 'vat',
      align: 'right' as const,
      render: (record: OrderLine) => (
        <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            %{record.vatRate}
          </Text>
          <Text>{formatCurrency(record.vatAmount, record.currency)}</Text>
        </Space>
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      align: 'right' as const,
      render: (record: OrderLine) => (
        <Text strong style={{ fontSize: 16 }}>
          {formatCurrency(record.totalPrice, record.currency)}
        </Text>
      ),
    },
  ]

  // Mock order history data
  const orderHistory = [
    {
      status: 'created',
      title: 'Sipariş Oluşturuldu',
      time: order.createdAt,
      user: order.createdBy?.firstName + ' ' + order.createdBy?.lastName,
      color: 'blue'
    },
    ...(order.status !== OrderStatus.DRAFT ? [{
      status: 'confirmed',
      title: 'Sipariş Onaylandı',
      time: order.updatedAt,
      user: order.updatedBy?.firstName + ' ' + order.updatedBy?.lastName,
      color: 'green'
    }] : []),
    ...(order.shippedDate ? [{
      status: 'shipped',
      title: 'Kargoya Verildi',
      time: order.shippedDate,
      user: 'Sistem',
      color: 'orange'
    }] : []),
    ...(order.status === OrderStatus.DELIVERED ? [{
      status: 'delivered',
      title: 'Teslim Edildi',
      time: order.updatedAt,
      user: 'Sistem',
      color: 'green'
    }] : []),
    ...(order.status === OrderStatus.CANCELLED ? [{
      status: 'cancelled',
      title: 'İptal Edildi',
      time: order.updatedAt,
      user: order.updatedBy?.firstName + ' ' + order.updatedBy?.lastName,
      color: 'red'
    }] : [])
  ]

  return (
    <div>
      {/* Order Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="top">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Space align="center">
                <Avatar 
                  icon={<ShoppingCartOutlined />} 
                  size="large"
                  style={{ 
                    backgroundColor: getStatusColor(order.status as OrderStatus) === 'success' ? '#52c41a' :
                                    getStatusColor(order.status as OrderStatus) === 'error' ? '#ff4d4f' :
                                    getStatusColor(order.status as OrderStatus) === 'warning' ? '#faad14' :
                                    getStatusColor(order.status as OrderStatus) === 'processing' ? '#1890ff' : '#d9d9d9'
                  }}
                />
                <div>
                  <Title level={3} style={{ margin: 0 }}>
                    {order.orderNumber}
                  </Title>
                  <Space>
                    <Tag color={getStatusColor(order.status as OrderStatus)} style={{ fontSize: 14 }}>
                      {getStatusText(order.status as OrderStatus)}
                    </Tag>
                    <Text type="secondary">
                      <CalendarOutlined /> {dayjs(order.orderDate).format('DD.MM.YYYY')}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              {availableActions.map(action => getActionButton(action))}
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setShowHistory(true)}
              >
                Geçmiş
              </Button>
              <Button icon={<PrinterOutlined />}>
                Yazdır
              </Button>
              <Button icon={<MailOutlined />}>
                E-posta
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        {/* Left Column - Order Details */}
        <Col xs={24} lg={16}>
          {/* Customer Information */}
          <Card title="Müşteri Bilgileri" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Müşteri Adı">
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  {order.customer?.name || 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="E-posta">
                {order.customer?.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Telefon">
                {order.customer?.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Vergi No">
                {order.customer?.taxNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Teslimat Adresi" span={2}>
                {order.shippingAddress || 'Belirtilmemiş'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Lines */}
          <Card title="Sipariş Kalemleri">
            <Table
              columns={orderLineColumns}
              dataSource={order.orderLines}
              pagination={false}
              scroll={{ x: 800 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <Text strong>TOPLAM</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong style={{ fontSize: 16 }}>
                      {formatCurrency(order.totalAmount, order.currency)}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        {/* Right Column - Summary & Details */}
        <Col xs={24} lg={8}>
          {/* Order Summary */}
          <Card title="Sipariş Özeti" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>Ara Toplam:</Text>
                <Text>{formatCurrency(order.subtotalAmount, order.currency)}</Text>
              </Row>
              
              {order.discountAmount > 0 && (
                <Row justify="space-between">
                  <Text>Sipariş İskontosu:</Text>
                  <Text type="danger">-{formatCurrency(order.discountAmount, order.currency)}</Text>
                </Row>
              )}
              
              <Row justify="space-between">
                <Text>KDV:</Text>
                <Text>{formatCurrency(order.vatAmount, order.currency)}</Text>
              </Row>

              <Divider style={{ margin: '8px 0' }} />

              <Row justify="space-between">
                <Text strong style={{ fontSize: 16 }}>TOPLAM:</Text>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {formatCurrency(order.totalAmount, order.currency)}
                </Text>
              </Row>
            </Space>
          </Card>

          {/* Order Statistics */}
          <Card title="İstatistikler" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Ürün Sayısı"
                  value={order.orderLines?.length || 0}
                  suffix="adet"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Toplam Miktar"
                  value={order.orderLines?.reduce((sum, line) => sum + line.quantity, 0) || 0}
                  suffix="adet"
                />
              </Col>
            </Row>
          </Card>

          {/* Order Details */}
          <Card title="Sipariş Detayları">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Sipariş Tarihi">
                {dayjs(order.orderDate).format('DD.MM.YYYY')}
              </Descriptions.Item>
              {order.deliveryDate && (
                <Descriptions.Item label="Teslimat Tarihi">
                  {dayjs(order.deliveryDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
              )}
              {order.shippedDate && (
                <Descriptions.Item label="Kargo Tarihi">
                  {dayjs(order.shippedDate).format('DD.MM.YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Kargo Yöntemi">
                {order.shippingMethod || 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Yöntemi">
                {order.paymentMethod || 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Ödeme Durumu">
                {order.paymentStatus || 'Belirtilmemiş'}
              </Descriptions.Item>
              <Descriptions.Item label="Para Birimi">
                {order.currency}
              </Descriptions.Item>
            </Descriptions>

            {(order.notes || order.internalNotes) && (
              <>
                <Divider />
                {order.notes && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Müşteri Notu:</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {order.notes}
                    </Paragraph>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <Text strong>İç Not:</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {order.internalNotes}
                    </Paragraph>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Order History Modal */}
      <Modal
        title="Sipariş Geçmişi"
        open={showHistory}
        onCancel={() => setShowHistory(false)}
        footer={null}
        width={600}
      >
        <Timeline
          items={orderHistory.map(item => ({
            color: item.color,
            children: (
              <div>
                <Text strong>{item.title}</Text>
                <br />
                <Text type="secondary">
                  {dayjs(item.time).format('DD.MM.YYYY HH:mm')} - {item.user}
                </Text>
              </div>
            )
          }))}
        />
      </Modal>
    </div>
  )
}

export default OrderDetail 