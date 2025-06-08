import React, { useEffect, useState } from 'react'
import { Card, Spin } from 'antd'
import { analyticsApi, SalesChartData } from '../../services/analyticsApi'

const InvoiceStatusChart: React.FC = () => {
  const [chartData, setChartData] = useState<SalesChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoiceStatusChart()
  }, [])

  const loadInvoiceStatusChart = async () => {
    setLoading(true)
    try {
      const response = await analyticsApi.getInvoiceStatusChart()
      if (response.success && response.data) {
        setChartData(response.data)
      }
    } catch (error) {
      console.error('Invoice status chart yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card title="🍩 Fatura Durumu" style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="🍩 Fatura Durumu" 
      style={{ height: '400px' }}
      extra={
        <a onClick={loadInvoiceStatusChart} style={{ cursor: 'pointer' }}>
          Yenile
        </a>
      }
    >
      {chartData && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          {chartData.labels.map((label, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <span style={{ 
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: chartData.datasets[0].backgroundColor?.[index] || '#1890ff',
                marginRight: '8px',
                borderRadius: '50%'
              }}></span>
              <strong>{label}:</strong> {chartData.datasets[0].data[index]} adet
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default InvoiceStatusChart 