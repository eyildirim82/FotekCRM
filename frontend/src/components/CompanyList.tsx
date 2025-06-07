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
  Statistic
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import companyService, { Company } from '../services/companyService'
import CompanyForm from './CompanyForm'
import CompanyDetail from './CompanyDetail'

const { Search } = Input
const { Option } = Select
const { Title } = Typography

interface CompanyStats {
  total: number
  leads: number
  prospects: number
  customers: number
  inactive: number
}

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([])
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
    status: ''
  })
  const [stats, setStats] = useState<CompanyStats>({
    total: 0,
    leads: 0,
    prospects: 0,
    customers: 0,
    inactive: 0
  })
  
  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)

  const { message } = App.useApp()

  // Load companies
  const loadCompanies = async (page = 1, pageSize = 10, search = '', status = '') => {
    try {
      setLoading(true)
      const response = await companyService.getCompanies({
        page,
        limit: pageSize,
        search: search || undefined,
        status: status || undefined
      })
      
      setCompanies(response.data.companies)
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
      const response = await companyService.getCompanyStats()
      setStats(response.data)
    } catch (error: any) {
      console.error('Stats load error:', error)
    }
  }

  // Initial load
  useEffect(() => {
    loadCompanies()
    loadStats()
  }, [])

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (paginationInfo: any) => {
    loadCompanies(
      paginationInfo.current,
      paginationInfo.pageSize,
      filters.search,
      filters.status
    )
  }

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    loadCompanies(1, pagination.pageSize, value, filters.status)
  }

  // Handle status filter
  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }))
    loadCompanies(1, pagination.pageSize, filters.search, value)
  }

  // Handle refresh
  const handleRefresh = () => {
    loadCompanies(pagination.current, pagination.pageSize, filters.search, filters.status)
    loadStats()
  }

  // Handle create/edit success
  const handleFormSuccess = () => {
    setFormModalVisible(false)
    setEditingCompany(null)
    handleRefresh()
    message.success(editingCompany ? 'Firma başarıyla güncellendi' : 'Firma başarıyla oluşturuldu')
  }

  // Handle delete
  const handleDelete = async (company: Company) => {
    try {
      await companyService.deleteCompany(company.id)
      message.success('Firma başarıyla silindi')
      handleRefresh()
    } catch (error: any) {
      message.error(error.message)
    }
  }

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

  // Table columns
  const columns: ColumnsType<Company> = [
    {
      title: 'Firma Adı',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => text || '-'
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => text || '-'
    },
    {
      title: 'Sektör',
      dataIndex: 'industry',
      key: 'industry',
      width: 150,
      render: (text: string) => text || '-'
    },
    {
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (text: string) => text || '-'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
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
              setViewingCompany(record)
              setDetailModalVisible(true)
            }}
            title="Detay"
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCompany(record)
              setFormModalVisible(true)
            }}
            title="Düzenle"
          />
          <Popconfirm
            title="Firmayı silmek istediğinizden emin misiniz?"
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
        <Col span={6}>
          <Card>
            <Statistic
              title="Toplam Firma"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Potansiyel Müşteri"
              value={stats.leads}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aday Müşteri"
              value={stats.prospects}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Aktif Müşteri"
              value={stats.customers}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>
              Firma Listesi
            </Title>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCompany(null)
                  setFormModalVisible(true)
                }}
              >
                Yeni Firma
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
            <Col span={8}>
              <Search
                placeholder="Firma adı, email veya telefon ile ara..."
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Durum filtresi"
                allowClear
                style={{ width: '100%' }}
                onChange={handleStatusFilter}
                value={filters.status || undefined}
              >
                <Option value="lead">Potansiyel</Option>
                <Option value="prospect">Aday</Option>
                <Option value="customer">Müşteri</Option>
                <Option value="inactive">Pasif</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={companies}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* Company Form Modal */}
      <Modal
        title={editingCompany ? 'Firma Düzenle' : 'Yeni Firma'}
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false)
          setEditingCompany(null)
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <CompanyForm
          company={editingCompany}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormModalVisible(false)}
        />
      </Modal>

      {/* Company Detail Modal */}
      <Modal
        title="Firma Detayları"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setViewingCompany(null)
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
              setEditingCompany(viewingCompany)
              setFormModalVisible(true)
            }}
          >
            Düzenle
          </Button>
        ]}
        width={800}
      >
        {viewingCompany && (
          <CompanyDetail
            company={viewingCompany}
            onEdit={() => {
              setDetailModalVisible(false)
              setEditingCompany(viewingCompany)
              setFormModalVisible(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default CompanyList 