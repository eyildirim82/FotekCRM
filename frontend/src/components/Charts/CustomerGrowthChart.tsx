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
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, Spin } from 'antd'
import { SalesChartData } from '../../services/analyticsApi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CustomerGrowthChart: React.FC = () => {
  const [chartData, setChartData] = useState<SalesChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomerGrowthChart()
  }, [])

  const loadCustomerGrowthChart = async () => {
    setLoading(true)
    try {
      // Mock data - real endpoint would be getCustomerGrowthChart()
      const mockData: SalesChartData = {
        labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
        datasets: [
          {
            label: 'Yeni Müşteriler',
            data: [12, 19, 23, 15, 32, 28],
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
          },
          {
            label: 'Toplam Müşteri',
            data: [65, 84, 107, 122, 154, 182],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          },
        ],
      }
      setChartData(mockData)
    } catch (error) {
      console.error('Customer growth chart yüklenemedi:', error)
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
        text: 'Müşteri Büyüme Trendi',
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Aylar'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Müşteri Sayısı'
        },
        beginAtZero: true,
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    maintainAspectRatio: false,
  }

  if (loading) {
    return (
      <Card title="📈 Müşteri Büyüme Trendi" style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="📈 Müşteri Büyüme Trendi" 
      style={{ height: '400px' }}
      extra={
        <a onClick={loadCustomerGrowthChart} style={{ cursor: 'pointer' }}>
          Yenile
        </a>
      }
    >
      <div style={{ height: '300px', padding: '20px' }}>
        {chartData && (
          <Line options={options} data={chartData} />
        )}
      </div>
    </Card>
  )
}

export default CustomerGrowthChart 