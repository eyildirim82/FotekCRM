import React from 'react'
import {
  Card,
  Row,
  Col,
  Tag,
  Avatar,
  Typography,
  Space,
  Tooltip
} from 'antd'
import {
  MailOutlined,
  PhoneOutlined,
  MobileOutlined,
  LinkedinOutlined,
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
  StarFilled,
  StarOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import contactService, { Contact } from '../services/contactService'

const { Title, Text } = Typography

interface ContactDetailProps {
  contact: Contact
  onEdit?: () => void
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact }) => {
  
  // Get avatar initials
  const getAvatarText = (contact: Contact) => {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div>
      {/* Header */}
      <Row align="middle" style={{ marginBottom: '24px' }}>
        <Col flex="none">
          <Avatar 
            size={64} 
            style={{ backgroundColor: '#1890ff', fontSize: '24px' }}
          >
            {getAvatarText(contact)}
          </Avatar>
        </Col>
        <Col flex="auto" style={{ marginLeft: '16px' }}>
          <div>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {contact.fullName}
              {contact.isPrimary && (
                <Tooltip title="Birincil kişi">
                  <StarFilled style={{ color: '#faad14', fontSize: '20px' }} />
                </Tooltip>
              )}
              {contact.isActive ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Aktif</Tag>
              ) : (
                <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
              )}
            </Title>
            <div style={{ marginTop: '4px' }}>
              {contact.jobTitle && (
                <Text strong style={{ fontSize: '16px', color: '#666' }}>
                  {contact.jobTitle}
                </Text>
              )}
              {contact.department && (
                <Text style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }}>
                  - {contact.department}
                </Text>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <Tag color={contactService.getContactTypeColor(contact.contactType)}>
                {contactService.getContactTypeText(contact.contactType)}
              </Tag>
              <Tag color={contactService.getContactStatusColor(contact.status)}>
                {contactService.getContactStatusText(contact.status)}
              </Tag>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Left Column */}
        <Col span={12}>
          {/* Contact Information */}
          <Card title="İletişim Bilgileri" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {contact.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  <Text>Email:</Text>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              )}
              
              {contact.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneOutlined style={{ color: '#52c41a' }} />
                  <Text>Telefon:</Text>
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </div>
              )}
              
              {contact.mobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MobileOutlined style={{ color: '#fa8c16' }} />
                  <Text>Mobil:</Text>
                  <a href={`tel:${contact.mobile}`}>{contact.mobile}</a>
                </div>
              )}
              
              {contact.skype && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined style={{ color: '#00b4d8' }} />
                  <Text>Skype:</Text>
                  <Text copyable>{contact.skype}</Text>
                </div>
              )}
              
              {contact.linkedInUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LinkedinOutlined style={{ color: '#0077b5' }} />
                  <Text>LinkedIn:</Text>
                  <a href={contact.linkedInUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn Profili
                  </a>
                </div>
              )}
            </Space>
          </Card>

          {/* Address Information */}
          {contact.address && (
            <Card title="Adres Bilgileri" size="small" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <HomeOutlined style={{ color: '#722ed1', marginTop: '2px' }} />
                <Text>{contact.address}</Text>
              </div>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card title="Notlar" size="small">
              <Text>{contact.notes}</Text>
            </Card>
          )}
        </Col>

        {/* Right Column */}
        <Col span={12}>
          {/* Company Information */}
          <Card title="Firma Bilgileri" size="small" style={{ marginBottom: '16px' }}>
            {contact.company ? (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Firma Adı:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '16px' }}>{contact.company.name}</Text>
                  </div>
                </div>
                <div>
                  <Text strong>Firma Durumu:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={contact.company.status === 'active' ? 'green' : 'default'}>
                      {contact.company.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Tag>
                  </div>
                </div>
              </div>
            ) : (
              <Text type="secondary">Firma bilgisi bulunamadı</Text>
            )}
          </Card>

          {/* Personal Information */}
          <Card title="Kişisel Bilgiler" size="small" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {contact.birthDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: '#eb2f96' }} />
                  <Text>Doğum Tarihi:</Text>
                  <Text>{new Date(contact.birthDate).toLocaleDateString('tr-TR')}</Text>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <Text>Kişi Tipi:</Text>
                <Tag color={contactService.getContactTypeColor(contact.contactType)}>
                  {contactService.getContactTypeText(contact.contactType)}
                </Tag>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text>Durum:</Text>
                <Tag color={contactService.getContactStatusColor(contact.status)}>
                  {contactService.getContactStatusText(contact.status)}
                </Tag>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text>Birincil Kişi:</Text>
                {contact.isPrimary ? (
                  <Tag color="gold" icon={<StarFilled />}>Birincil</Tag>
                ) : (
                  <Tag color="default" icon={<StarOutlined />}>Normal</Tag>
                )}
              </div>
            </Space>
          </Card>

          {/* System Information */}
          <Card title="Sistem Bilgileri" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Oluşturan:</Text>
                <div style={{ marginTop: '4px' }}>
                  {contact.createdBy ? (
                    <Text>{contact.createdBy.firstName} {contact.createdBy.lastName}</Text>
                  ) : (
                    <Text type="secondary">Bilinmiyor</Text>
                  )}
                </div>
              </div>
              
              <div>
                <Text strong>Oluşturma Tarihi:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>{new Date(contact.createdAt).toLocaleString('tr-TR')}</Text>
                </div>
              </div>
              
              <div>
                <Text strong>Son Güncelleme:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>{new Date(contact.updatedAt).toLocaleString('tr-TR')}</Text>
                </div>
              </div>
              
              <div>
                <Text strong>Kişi ID:</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text code copyable>{contact.id}</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ContactDetail 