import React from 'react'
import {
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography,
  Space,
  Progress,
  Image
} from 'antd'
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  StopOutlined,
  WarningOutlined,
  AlertOutlined,
  DollarOutlined,
  InboxOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  LinkOutlined
} from '@ant-design/icons'
import productService, { Product } from '../services/productService'

const { Title, Text } = Typography

interface ProductDetailProps {
  product: Product
  onEdit?: () => void
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  
  // Get product avatar
  const getProductAvatar = () => {
    if (product.imageUrl) {
      return <Avatar size={64} src={product.imageUrl} />
    }
    return (
      <Avatar 
        size={64} 
        style={{ backgroundColor: '#1890ff', fontSize: '24px' }}
        icon={<ShoppingOutlined />}
      >
        {product.name.charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  // Get stock level progress
  const getStockProgress = () => {
    if (product.isService) return null
    
    const { stockQuantity, minStockLevel } = product
    if (minStockLevel === 0) return null
    
    const percentage = Math.min((stockQuantity / (minStockLevel * 2)) * 100, 100)
    let status: 'success' | 'normal' | 'exception' = 'success'
    
    if (stockQuantity === 0) status = 'exception'
    else if (stockQuantity <= minStockLevel) status = 'normal'
    
    return (
      <Progress 
        percent={percentage} 
        status={status}
        size="small"
        format={() => `${stockQuantity} / ${minStockLevel * 2}`}
      />
    )
  }

  // Get status icon
  const getStatusIcon = () => {
    if (!product.isActive) return <StopOutlined style={{ color: '#8c8c8c' }} />
    if (product.isService) return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    if (product.stockQuantity === 0) return <AlertOutlined style={{ color: '#f5222d' }} />
    if (product.stockQuantity <= product.minStockLevel) return <WarningOutlined style={{ color: '#fa8c16' }} />
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />
  }

  return (
    <div>
      {/* Header */}
      <Row align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="none">
          {getProductAvatar()}
        </Col>
        <Col flex="auto" style={{ marginLeft: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {product.name}
              {getStatusIcon()}
              <Tag color={productService.getStatusColor(product.status!)}>
                {productService.getStatusText(product.status!)}
              </Tag>
            </Title>
            <div style={{ marginTop: '4px' }}>
              <Text strong style={{ fontSize: '16px', color: '#666' }}>
                Kod: {product.code}
              </Text>
              {product.brand && (
                <Text style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }}>
                  - {product.brand}
                </Text>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              {product.category && (
                <Tag color={productService.getCategoryColor(product.category)}>
                  {productService.getCategoryText(product.category)}
                </Tag>
              )}
              {product.isService ? (
                <Tag color="blue">Hizmet Ürünü</Tag>
              ) : (
                <Tag color="green">Fiziksel Ürün</Tag>
              )}
              {product.isActive ? (
                <Tag color="green">Aktif</Tag>
              ) : (
                <Tag color="default">Pasif</Tag>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Left Column */}
        <Col span={12}>
          {/* Basic Information */}
          <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Ürün Adı:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '16px' }}>{product.name}</Text>
                </div>
              </div>
              
              <div>
                <Text strong>Ürün Kodu (SKU):</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text code copyable>{product.code}</Text>
                </div>
              </div>
              
              {product.brand && (
                <div>
                  <Text strong>Marka:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>{product.brand}</Text>
                  </div>
                </div>
              )}
              
              {product.category && (
                <div>
                  <Text strong>Kategori:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={productService.getCategoryColor(product.category)}>
                      {productService.getCategoryText(product.category)}
                    </Tag>
                  </div>
                </div>
              )}
              
              {product.unit && (
                <div>
                  <Text strong>Birim:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>{product.unit}</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>

          {/* Price Analysis */}
          <Card title="Fiyat Analizi" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Maliyet Fiyatı:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '16px', color: '#f5222d' }}>
                    {productService.formatCurrency(product.costPrice, product.currency)}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text strong>Satış Fiyatı:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ fontSize: '16px', color: '#1890ff' }}>
                    {productService.formatCurrency(product.listPrice, product.currency)}
                  </Text>
                </div>
              </div>
              
              {product.profitMargin !== undefined && product.profitMargin > 0 && (
                <div>
                  <Text strong>Kar Marjı:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ 
                      fontSize: '16px', 
                      color: product.profitMargin > 0 ? '#52c41a' : '#f5222d',
                      fontWeight: 'bold'
                    }}>
                      <TrophyOutlined style={{ marginRight: '4px' }} />
                      {productService.formatProfitMargin(product.profitMargin)}
                    </Text>
                  </div>
                </div>
              )}
              
              <div>
                <Text strong>KDV Oranı:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Tag color="blue">%{product.vatRate}</Tag>
                </div>
              </div>
              
              <div>
                <Text strong>Para Birimi:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Tag color="purple">{product.currency}</Tag>
                </div>
              </div>
            </Space>
          </Card>

          {/* Stock Information */}
          {!product.isService && (
            <Card title="Stok Bilgileri" size="small" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Mevcut Stok:</Text>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <InboxOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {productService.formatStock(product.stockQuantity, product.unit)}
                    </Text>
                  </div>
                </div>
                
                <div>
                  <Text strong>Minimum Stok Seviyesi:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>{productService.formatStock(product.minStockLevel, product.unit)}</Text>
                  </div>
                </div>
                
                {getStockProgress() && (
                  <div>
                    <Text strong>Stok Durumu:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {getStockProgress()}
                    </div>
                  </div>
                )}
                
                {product.totalValue && (
                  <div>
                    <Text strong>Toplam Stok Değeri:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '16px', color: '#722ed1', fontWeight: 'bold' }}>
                        <DollarOutlined style={{ marginRight: '4px' }} />
                        {productService.formatCurrency(product.totalValue, product.currency)}
                      </Text>
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* Description */}
          {product.description && (
            <Card title="Ürün Açıklaması" size="small">
              <Text>{product.description}</Text>
            </Card>
          )}
        </Col>

        {/* Right Column */}
        <Col span={12}>
          {/* Company Information */}
          {product.company && (
            <Card title="Tedarikçi Firma" size="small" style={{ marginBottom: '16px' }}>
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Firma Adı:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '16px' }}>{product.company.name}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Firma Durumu:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={product.company.status === 'active' ? 'green' : 'default'}>
                      {product.company.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Product Image */}
          {product.imageUrl && (
            <Card title="Ürün Görseli" size="small" style={{ marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <Image
                  width={200}
                  src={product.imageUrl}
                  alt={product.name}
                  placeholder={
                    <div style={{ 
                      height: '200px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f5f5f5'
                    }}>
                      <ShoppingOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                    </div>
                  }
                />
                <div style={{ marginTop: '8px' }}>
                  <a href={product.imageUrl} target="_blank" rel="noopener noreferrer">
                    <LinkOutlined /> Resmi büyük boyutta görüntüle
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* Additional Information */}
          <Card title="Ek Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Ürün Tipi:</Text>
                <div style={{ marginTop: '4px' }}>
                  {product.isService ? (
                    <Tag color="blue" icon={<CheckCircleOutlined />}>Hizmet Ürünü</Tag>
                  ) : (
                    <Tag color="green" icon={<InboxOutlined />}>Fiziksel Ürün</Tag>
                  )}
                </div>
              </div>
              
              <div>
                <Text strong>Durum:</Text>
                <div style={{ marginTop: '4px' }}>
                  {product.isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Aktif</Tag>
                  ) : (
                    <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
                  )}
                </div>
              </div>
              
              {product.notes && (
                <div>
                  <Text strong>Notlar:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>{product.notes}</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>

          {/* System Information */}
          <Card title="Sistem Bilgileri" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Oluşturan:</Text>
                <div style={{ marginTop: '4px' }}>
                  {product.createdBy ? (
                    <Text>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {product.createdBy.firstName} {product.createdBy.lastName}
                    </Text>
                  ) : (
                    <Text type="secondary">Bilinmiyor</Text>
                  )}
                </div>
              </div>
              
              {product.updatedBy && (
                <div>
                  <Text strong>Son Güncelleyen:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {product.updatedBy.firstName} {product.updatedBy.lastName}
                    </Text>
                  </div>
                </div>
              )}
              
              <div>
                <Text strong>Oluşturma Tarihi:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    {new Date(product.createdAt).toLocaleString('tr-TR')}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text strong>Son Güncelleme:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    {new Date(product.updatedAt).toLocaleString('tr-TR')}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text strong>Ürün ID:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text code copyable>{product.id}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProductDetail 