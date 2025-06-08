import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, Spin } from 'antd'
import { analyticsApi, SalesChartData } from '../../services/analyticsApi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const SalesChart: React.FC = () => {
  const [chartData, setChartData] = useState<SalesChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSalesChart()
  }, [])

  const loadSalesChart = async () => {
    setLoading(true)
    try {
      const response = await analyticsApi.getSalesChart()
      if (response.success && response.data) {
        setChartData(response.data)
      }
    } catch (error) {
      console.error('Sales chart yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Aylık Satış Trendi',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY'
            }).format(value)
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Card title="📈 Aylık Satış Trendi" style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="📈 Aylık Satış Trendi" 
      style={{ height: '400px' }}
      extra={
        <a onClick={loadSalesChart} style={{ cursor: 'pointer' }}>
          Yenile
        </a>
      }
    >
      {chartData && (
        <Line 
          options={options} 
          data={chartData} 
          height={300}
        />
      )}
    </Card>
  )
}

export default SalesChart 