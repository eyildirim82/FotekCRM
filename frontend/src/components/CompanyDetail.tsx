import React from 'react'
import {
  Descriptions,
  Card,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Button
} from 'antd'
import {
  EditOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { Company } from '../services/companyService'

const { Title, Text } = Typography

interface CompanyDetailProps {
  company: Company
  onEdit?: () => void
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onEdit }) => {
  // Status color mapping
  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'blue',
      prospect: 'orange',
      customer: 'green',
      inactive: 'default'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  // Status text mapping
  const getStatusText = (status: string) => {
    const texts = {
      lead: 'Potansiyel',
      prospect: 'Aday',
      customer: 'Müşteri',
      inactive: 'Pasif'
    }
    return texts[status as keyof typeof texts] || status
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
              {company.name}
            </Title>
            <Space size="large">
              <Tag color={getStatusColor(company.status)} style={{ fontSize: '14px' }}>
                {getStatusText(company.status)}
              </Tag>
              <Tag color={company.isActive ? 'green' : 'default'}>
                {company.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </Space>
          </div>
          {onEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
              Düzenle
            </Button>
          )}
        </div>
      </div>

      <Row gutter={24}>
        {/* Basic Information */}
        <Col span={24}>
          <Card title="Temel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Firma Adı" span={2}>
                <Text strong>{company.name}</Text>
              </Descriptions.Item>
              
              {company.taxNumber && (
                <Descriptions.Item label="Vergi Numarası">
                  {company.taxNumber}
                </Descriptions.Item>
              )}
              
              {company.industry && (
                <Descriptions.Item label="Sektör">
                  <Tag>{company.industry}</Tag>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="Durum">
                <Tag color={getStatusColor(company.status)}>
                  {getStatusText(company.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Aktif Durum">
                <Tag color={company.isActive ? 'green' : 'default'}>
                  {company.isActive ? 'Aktif' : 'Pasif'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Contact Information */}
        <Col span={24}>
          <Card title="İletişim Bilgileri" size="small" style={{ marginBottom: '16px' }}>
            <Descriptions bordered column={2} size="small">
              {company.email && (
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </Descriptions.Item>
              )}
              
              {company.phone && (
                <Descriptions.Item label={<><PhoneOutlined /> Telefon</>}>
                  <a href={`tel:${company.phone}`}>{company.phone}</a>
                </Descriptions.Item>
              )}
              
              {company.website && (
                <Descriptions.Item label={<><GlobalOutlined /> Website</> } span={2}>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    {company.website}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Address Information */}
        {(company.address || company.city || company.country || company.postalCode) && (
          <Col span={24}>
            <Card title="Adres Bilgileri" size="small" style={{ marginBottom: '16px' }}>
              <Descriptions bordered column={2} size="small">
                {company.address && (
                  <Descriptions.Item label={<><EnvironmentOutlined /> Adres</> } span={2}>
                    {company.address}
                  </Descriptions.Item>
                )}
                
                {company.city && (
                  <Descriptions.Item label="Şehir">
                    {company.city}
                  </Descriptions.Item>
                )}
                
                {company.country && (
                  <Descriptions.Item label="Ülke">
                    {company.country}
                  </Descriptions.Item>
                )}
                
                {company.postalCode && (
                  <Descriptions.Item label="Posta Kodu">
                    {company.postalCode}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        )}

        {/* Notes */}
        {company.notes && (
          <Col span={24}>
            <Card title="Notlar" size="small" style={{ marginBottom: '16px' }}>
              <Text>{company.notes}</Text>
            </Card>
          </Col>
        )}

        {/* System Information */}
        <Col span={24}>
          <Card title="Sistem Bilgileri" size="small">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label={<><UserOutlined /> Oluşturan</> }>
                {company.createdBy 
                  ? `${company.createdBy.firstName} ${company.createdBy.lastName}`
                  : 'Bilinmiyor'
                }
              </Descriptions.Item>
              
              <Descriptions.Item label="Oluşturan Email">
                {company.createdBy?.email || 'Bilinmiyor'}
              </Descriptions.Item>
              
              <Descriptions.Item label={<><CalendarOutlined /> Oluşturma Tarihi</> }>
                {new Date(company.createdAt).toLocaleString('tr-TR')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Son Güncelleme">
                {new Date(company.updatedAt).toLocaleString('tr-TR')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Firma ID" span={2}>
                <Text code>{company.id}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CompanyDetail 