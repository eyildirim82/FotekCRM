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
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarFilled
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import contactService, { Contact, ContactType, ContactStatus } from '../services/contactService'
import ContactForm from './ContactForm'
import ContactDetail from './ContactDetail'

const { Search } = Input
const { Option } = Select
const { Title } = Typography

interface ContactStats {
  total: number
  employees: number
  managers: number
  decisionMakers: number
  active: number
  inactive: number
}

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: number[]) => 
      `${range[0]}-${range[1]} of ${total} items`
  })
  const [filters, setFilters] = useState({
    search: '',
    contactType: '',
    status: '',
    companyId: ''
  })
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    employees: 0,
    managers: 0,
    decisionMakers: 0,
    active: 0,
    inactive: 0
  })
  
  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [viewingContact, setViewingContact] = useState<Contact | null>(null)

  const { message } = App.useApp()

  // Load contacts
  const loadContacts = async (page = 1, pageSize = 10, search = '', contactType = '', status = '', companyId = '') => {
    try {
      setLoading(true)
      const response = await contactService.getContacts({
        page,
        limit: pageSize,
        search: search || undefined,
        contactType: contactType as ContactType || undefined,
        status: status as ContactStatus || undefined,
        companyId: companyId || undefined
      })
      
      setContacts(response.data.contacts)
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
      const response = await contactService.getContactStats()
      setStats(response.data)
    } catch (error: any) {
      console.error('Stats load error:', error)
    }
  }

  // Initial load
  useEffect(() => {
    loadContacts()
    loadStats()
  }, [])

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (paginationInfo: any) => {
    loadContacts(
      paginationInfo.current,
      paginationInfo.pageSize,
      filters.search,
      filters.contactType,
      filters.status,
      filters.companyId
    )
  }

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    loadContacts(1, pagination.pageSize, value, filters.contactType, filters.status, filters.companyId)
  }

  // Handle contact type filter
  const handleContactTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, contactType: value }))
    loadContacts(1, pagination.pageSize, filters.search, value, filters.status, filters.companyId)
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
    loadContacts(1, pagination.pageSize, filters.search, filters.contactType, value, filters.companyId)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadContacts(pagination.current, pagination.pageSize, filters.search, filters.contactType, filters.status, filters.companyId)
    loadStats()
  }

  // Handle create/edit success
  const handleFormSuccess = () => {
    setFormModalVisible(false)
    setEditingContact(null)
    handleRefresh()
    message.success(editingContact ? 'Kişi başarıyla güncellendi' : 'Kişi başarıyla oluşturuldu')
  }

  // Handle delete
  const handleDelete = async (contact: Contact) => {
    try {
      await contactService.deleteContact(contact.id)
      message.success('Kişi başarıyla silindi')
      handleRefresh()
    } catch (error: any) {
      message.error(error.message)
    }
  }

  // Get avatar initials
  const getAvatarText = (contact: Contact) => {
    return `${contact.firstName.charAt(0)}${contact.lastName.charAt(0)}`.toUpperCase()
  }

  // Table columns
  const columns: ColumnsType<Contact> = [
    {
      title: 'Kişi',
      key: 'person',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar style={{ backgroundColor: '#1890ff' }}>
            {getAvatarText(record)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {record.fullName}
              {record.isPrimary && (
                <Tooltip title="Birincil kişi">
                  <StarFilled style={{ color: '#faad14', fontSize: '12px' }} />
                </Tooltip>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.jobTitle && `${record.jobTitle}`}
              {record.department && ` - ${record.department}`}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div>
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <MailOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
              <a href={`mailto:${record.email}`} style={{ fontSize: '12px' }}>
                {record.email}
              </a>
            </div>
          )}
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <PhoneOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <a href={`tel:${record.phone}`} style={{ fontSize: '12px' }}>
                {record.phone}
              </a>
            </div>
          )}
          {record.mobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneOutlined style={{ color: '#fa8c16', fontSize: '12px' }} />
              <a href={`tel:${record.mobile}`} style={{ fontSize: '12px' }}>
                {record.mobile}
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Firma',
      dataIndex: 'company',
      key: 'company',
      width: 180,
      render: (company: any) => company?.name || '-'
    },
    {
      title: 'Kişi Tipi',
      dataIndex: 'contactType',
      key: 'contactType',
      width: 120,
      render: (contactType: ContactType) => (
        <Tag color={contactService.getContactTypeColor(contactType)}>
          {contactService.getContactTypeText(contactType)}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ContactStatus) => (
        <Tag color={contactService.getContactStatusColor(status)}>
          {contactService.getContactStatusText(status)}
        </Tag>
      )
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
              setViewingContact(record)
              setDetailModalVisible(true)
            }}
            title="Detay"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingContact(record)
              setFormModalVisible(true)
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Kişiyi silmek istediğinizden emin misiniz?"
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
              title="Toplam Kişi"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Çalışanlar"
              value={stats.employees}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Yöneticiler"
              value={stats.managers}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Karar Vericiler"
              value={stats.decisionMakers}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Aktif"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Pasif"
              value={stats.inactive}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Kişi Listesi
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingContact(null)
                  setFormModalVisible(true)
                }}
              >
                Yeni Kişi
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
                placeholder="Ad, soyad, email, telefon ile ara..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Kişi tipi"
                allowClear
                style={{ width: '100%' }}
                onChange={handleContactTypeFilter}
                value={filters.contactType || undefined}
              >
                <Option value={ContactType.EMPLOYEE}>Çalışan</Option>
                <Option value={ContactType.MANAGER}>Yönetici</Option>
                <Option value={ContactType.DECISION_MAKER}>Karar Verici</Option>
                <Option value={ContactType.TECHNICAL}>Teknik</Option>
                <Option value={ContactType.FINANCIAL}>Mali İşler</Option>
                <Option value={ContactType.OTHER}>Diğer</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Durum filtresi"
                allowClear
                style={{ width: '100%' }}
                onChange={handleStatusFilter}
                value={filters.status || undefined}
              >
                <Option value={ContactStatus.ACTIVE}>Aktif</Option>
                <Option value={ContactStatus.INACTIVE}>Pasif</Option>
                <Option value={ContactStatus.LEFT_COMPANY}>Ayrıldı</Option>
                <Option value={ContactStatus.NO_CONTACT}>İletişim Yok</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={contacts}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Contact Form Modal */}
      <Modal
        title={editingContact ? 'Kişi Düzenle' : 'Yeni Kişi'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false)
          setEditingContact(null)
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ContactForm
          contact={editingContact}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormModalVisible(false)}
        />
      </Modal>

      {/* Contact Detail Modal */}
      <Modal
        title="Kişi Detayları"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setViewingContact(null)
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
              setEditingContact(viewingContact)
              setFormModalVisible(true)
            }}
          >
            Düzenle
          </Button>
        ]}
        width={800}
      >
        {viewingContact && (
          <ContactDetail
            contact={viewingContact}
            onEdit={() => {
              setDetailModalVisible(false)
              setEditingContact(viewingContact)
              setFormModalVisible(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default ContactList 