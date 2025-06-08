import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { Card, Spin } from 'antd'
import { analyticsApi, SalesChartData } from '../../services/analyticsApi'

ChartJS.register(ArcElement, Tooltip, Legend)

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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Fatura Durumu Dağılımı',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} adet (%${percentage})`
          }
        }
      }
    },
    maintainAspectRatio: false,
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
      <div style={{ height: '300px', padding: '20px' }}>
        {chartData && (
          <Pie 
            options={options} 
            data={chartData}
          />
        )}
      </div>
    </Card>
  )
}

export default InvoiceStatusChart 