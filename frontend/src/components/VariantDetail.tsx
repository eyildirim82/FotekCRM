import React from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Statistic,
  Avatar,
  Button,
  Space,
  Descriptions,
  Image,
  Divider
} from 'antd'
import {
  EditOutlined,
  BarcodeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  WarningOutlined
} from '@ant-design/icons'
import variantService, { ProductVariant, VariantStatus } from '../services/variantService'

const { Title, Text, Paragraph } = Typography

interface VariantDetailProps {
  variant: ProductVariant
  onEdit: () => void
}

const VariantDetail: React.FC<VariantDetailProps> = ({ variant, onEdit }) => {
  
  // Get variant avatar (color or first letter of SKU)
  const getVariantAvatar = () => {
    if (variant.imageUrl) {
      return <Avatar size={80} src={variant.imageUrl} />
    }
    if (variant.color) {
      return (
        <Avatar 
          size={80} 
          style={{ backgroundColor: variant.color.toLowerCase(), fontSize: '24px' }}
        >
          {variant.sku.charAt(0).toUpperCase()}
        </Avatar>
      )
    }
    return (
      <Avatar 
        size={80} 
        style={{ backgroundColor: '#1890ff', fontSize: '24px' }}
      >
        {variant.sku.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  // Get stock status icon
  const getStockStatusIcon = () => {
    switch (variant.status) {
      case VariantStatus.OUT_OF_STOCK:
        return <StopOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
      case VariantStatus.LOW_STOCK:
        return <WarningOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
      case VariantStatus.INACTIVE:
        return <StopOutlined style={{ color: '#8c8c8c', fontSize: '18px' }} />
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
    }
  }

  return (
    <div style={{ padding: '0 24px' }}>
      {/* Header Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {getVariantAvatar()}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <BarcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                  <Title level={3} style={{ margin: 0 }}>
                    {variant.sku}
                  </Title>
                  <Tag color={variantService.getStatusColor(variant.status!)}>
                    {variantService.getStatusText(variant.status!)}
                  </Tag>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShoppingOutlined style={{ color: '#666' }} />
                  <Text type="secondary">
                    {variant.product?.name || `Ürün ID: ${variant.productId}`}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text type="secondary">Kod: {variant.product?.code}</Text>
                  {variant.product?.brand && (
                    <>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">Marka: {variant.product.brand}</Text>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={onEdit}
            >
              Düzenle
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Birim Fiyat"
              value={variant.unitPrice}
              precision={2}
              suffix={variant.currency === 'TRY' ? '₺' : variant.currency}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Stok Miktarı"
              value={variant.stockQuantity}
              suffix="adet"
              valueStyle={{ 
                color: variant.stockQuantity === 0 ? '#f5222d' : 
                       variant.stockQuantity <= variant.minStockLevel ? '#fa8c16' : '#52c41a' 
              }}
              prefix={getStockStatusIcon()}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Minimum Stok"
              value={variant.minStockLevel}
              suffix="adet"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Değer"
              value={variant.totalValue || 0}
              precision={2}
              suffix={variant.currency === 'TRY' ? '₺' : variant.currency}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column - Basic Info */}
        <Col span={12}>
          <Card title="Varyant Bilgileri" style={{ marginBottom: '16px' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="SKU">
                <Text copyable strong>{variant.sku}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStockStatusIcon()}
                  <Tag color={variantService.getStatusColor(variant.status!)}>
                    {variantService.getStatusText(variant.status!)}
                  </Tag>
                  <Text type="secondary">
                    {variant.isActive ? 'Aktif' : 'Pasif'}
                  </Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Fiyat">
                <Text strong style={{ fontSize: '16px' }}>
                  {variantService.formatCurrency(variant.unitPrice, variant.currency)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Stok">
                <Space>
                  <Text strong>{variantService.formatStock(variant.stockQuantity)}</Text>
                  <Text type="secondary">(Min: {variant.minStockLevel})</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Variant Attributes */}
          <Card title="Varyant Özellikleri">
            <Row gutter={[16, 16]}>
              {variant.color && (
                <Col span={12}>
                  <div>
                    <Text type="secondary">Renk:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color={variant.color.toLowerCase()}>{variant.color}</Tag>
                    </div>
                  </div>
                </Col>
              )}
              {variant.size && (
                <Col span={12}>
                  <div>
                    <Text type="secondary">Beden:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag>{variant.size}</Tag>
                    </div>
                  </div>
                </Col>
              )}
              {variant.material && (
                <Col span={12}>
                  <div>
                    <Text type="secondary">Malzeme:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag>{variant.material}</Tag>
                    </div>
                  </div>
                </Col>
              )}
              {variant.capacity && (
                <Col span={12}>
                  <div>
                    <Text type="secondary">Kapasite:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag>{variant.capacity}</Tag>
                    </div>
                  </div>
                </Col>
              )}
              {variant.style && (
                <Col span={24}>
                  <div>
                    <Text type="secondary">Stil:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag>{variant.style}</Tag>
                    </div>
                  </div>
                </Col>
              )}
              {!variant.color && !variant.size && !variant.material && !variant.capacity && !variant.style && (
                <Col span={24}>
                  <Text type="secondary" italic>
                    Henüz özellik tanımlanmamış
                  </Text>
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        {/* Right Column - Additional Info */}
        <Col span={12}>
          {/* Variant Image */}
          {variant.imageUrl && (
            <Card title="Görsel" style={{ marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={variant.imageUrl}
                  alt={variant.sku}
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              </div>
            </Card>
          )}

          {/* Notes */}
          {variant.notes && (
            <Card title="Notlar" style={{ marginBottom: '16px' }}>
              <Paragraph>
                {variant.notes}
              </Paragraph>
            </Card>
          )}

          {/* System Information */}
          <Card title="Sistem Bilgileri">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Oluşturulma">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined />
                    <Text>{new Date(variant.createdAt).toLocaleString('tr-TR')}</Text>
                  </div>
                  {variant.createdBy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <UserOutlined />
                      <Text type="secondary">
                        {variant.createdBy.firstName} {variant.createdBy.lastName}
                      </Text>
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Son Güncelleme">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined />
                    <Text>{new Date(variant.updatedAt).toLocaleString('tr-TR')}</Text>
                  </div>
                  {variant.updatedBy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <UserOutlined />
                      <Text type="secondary">
                        {variant.updatedBy.firstName} {variant.updatedBy.lastName}
                      </Text>
                    </div>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="ID">
                <Text copyable code>{variant.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ürün ID">
                <Text copyable code>{variant.productId}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default VariantDetail 