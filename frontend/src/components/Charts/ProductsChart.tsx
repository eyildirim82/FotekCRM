import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Card, Spin } from 'antd'
import { analyticsApi, TopProduct } from '../../services/analyticsApi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const ProductsChart: React.FC = () => {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTopProducts()
  }, [])

  const loadTopProducts = async () => {
    setLoading(true)
    try {
      const response = await analyticsApi.getTopProducts(10)
      if (response.success && response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Top products yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Satış Adedi',
        data: products.map(p => p.totalSold),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
          'rgba(255, 99, 255, 0.8)',
          'rgba(99, 255, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 99, 255, 1)',
          'rgba(99, 255, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'En Çok Satan Ürünler',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const product = products[context.dataIndex]
            return `Gelir: ${new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY'
            }).format(product.revenue)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Satış Adedi'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Ürünler'
        }
      }
    },
    maintainAspectRatio: false,
  }

  if (loading) {
    return (
      <Card title="📊 En Çok Satan Ürünler" style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title="📊 En Çok Satan Ürünler" 
      style={{ height: '400px' }}
      extra={
        <a onClick={loadTopProducts} style={{ cursor: 'pointer' }}>
          Yenile
        </a>
      }
    >
      <div style={{ height: '300px', padding: '20px' }}>
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  )
}

export default ProductsChart 