import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import { analyticsApi, DashboardMetrics } from '../services/analyticsApi'
import SalesChart from './Charts/SalesChart'
import InvoiceStatusChart from './Charts/InvoiceStatusChart'

const { Title } = Typography

const DashboardAnalytics: React.FC = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDashboardMetrics()
  }, [])

  const loadDashboardMetrics = async () => {
    setLoading(true)
    try {
      const response = await analyticsApi.getDashboardMetrics()
      if (response.success && response.data) {
        setDashboardMetrics(response.data)
      } else {
        console.error('Dashboard metrics yüklenemedi:', response.message)
      }
    } catch (error) {
      console.error('Dashboard metrics yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    // Mock PDF export
    const link = document.createElement('a')
    link.href = 'data:application/pdf;base64,JVBERi0xLjQKJfbk/N0KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCgozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA0IDAgUgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgokIDAgb2JqCjw8Ci9GMSAKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+Cj4+CmVuZG9iagoKNSAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzIgNzIwIFRkCihEYXNoYm9hcmQgUmVwb3J0KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA3OSAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAzMDEgMDAwMDAgbiAKMDAwMDAwMDM4MCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ5Mgp7JUVPRGO0'
    link.download = 'dashboard-report.pdf'
    link.click()
  }

  const handleExportExcel = () => {
    // Mock Excel export
    if (!dashboardMetrics) return
    
    const csvContent = `Dashboard Raporu\n\nMetric,Value\nToplam Gelir,${dashboardMetrics.totalRevenue} TL\nAylık Gelir,${dashboardMetrics.monthlyRevenue} TL\nToplam Sipariş,${dashboardMetrics.totalOrders}\nToplam Müşteri,${dashboardMetrics.totalCustomers}\nToplam Ürün,${dashboardMetrics.totalProducts}\nToplam Fatura,${dashboardMetrics.totalInvoices}\nOrtalama Sipariş Değeri,${dashboardMetrics.averageOrderValue} TL\nAylık Büyüme,%${dashboardMetrics.monthlyGrowth.toFixed(1)}`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'dashboard-report.csv'
    link.click()
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header with Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2}>📊 Dashboard Analytics</Title>
        <div>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={handleExportPDF}
            style={{ marginRight: '8px' }}
          >
            PDF İndir
          </Button>
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={handleExportExcel}
            type="primary"
          >
            Excel İndir
          </Button>
        </div>
      </div>
      {/* Business Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={dashboardMetrics?.totalRevenue || 0}
              precision={2}
              suffix="TL"
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aylık Gelir"
              value={dashboardMetrics?.monthlyRevenue || 0}
              precision={2}
              suffix="TL"
              prefix={dashboardMetrics?.monthlyGrowth && dashboardMetrics.monthlyGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: dashboardMetrics?.monthlyGrowth && dashboardMetrics.monthlyGrowth > 0 ? '#3f8600' : '#cf1322' }}
              loading={loading}
            />
            {dashboardMetrics?.monthlyGrowth && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                %{dashboardMetrics.monthlyGrowth.toFixed(1)} (önceki aya göre)
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Sipariş"
              value={dashboardMetrics?.totalOrders || 0}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama Sipariş Değeri"
              value={dashboardMetrics?.averageOrderValue || 0}
              precision={2}
              suffix="TL"
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Müşteri"
              value={dashboardMetrics?.totalCustomers || 0}
              valueStyle={{ color: '#fa8c16' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Ürün"
              value={dashboardMetrics?.totalProducts || 0}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Fatura"
              value={dashboardMetrics?.totalInvoices || 0}
              valueStyle={{ color: '#eb2f96' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Button 
              type="primary" 
              onClick={loadDashboardMetrics} 
              loading={loading}
              style={{ width: '100%' }}
            >
              Verileri Yenile
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <SalesChart />
        </Col>
        <Col xs={24} lg={12}>
          <InvoiceStatusChart />
        </Col>
      </Row>
    </div>
  )
}

export default DashboardAnalytics 