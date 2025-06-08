import React from 'react'
import { Card, DatePicker, Select, Space, Button } from 'antd'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

export interface FilterOptions {
  dateRange: [Dayjs | null, Dayjs | null]
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  category: 'all' | 'sales' | 'customers' | 'products' | 'invoices'
}

interface ChartFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onRefresh: () => void
  loading?: boolean
}

const ChartFilters: React.FC<ChartFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  loading = false
}) => {
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    onFiltersChange({
      ...filters,
      dateRange: dates || [null, null]
    })
  }

  const handlePeriodChange = (period: string) => {
    onFiltersChange({
      ...filters,
      period: period as FilterOptions['period']
    })
  }

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category as FilterOptions['category']
    })
  }

  const handleQuickDateRange = (days: number) => {
    const endDate = dayjs()
    const startDate = dayjs().subtract(days, 'day')
    onFiltersChange({
      ...filters,
      dateRange: [startDate, endDate]
    })
  }

  const resetFilters = () => {
    onFiltersChange({
      dateRange: [dayjs().subtract(30, 'day'), dayjs()],
      period: 'daily',
      category: 'all'
    })
  }

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          Dashboard Filtreleri
        </Space>
      }
      size="small"
      style={{ marginBottom: '16px' }}
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          size="small"
        >
          Yenile
        </Button>
      }
    >
      <Space wrap>
        {/* Date Range Picker */}
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px', color: '#666' }}>Tarih Aralığı:</div>
          <RangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={['Başlangıç', 'Bitiş']}
            size="small"
            style={{ width: '200px' }}
          />
        </Space>

        {/* Quick Date Buttons */}
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px', color: '#666' }}>Hızlı Seçim:</div>
          <Space>
            <Button 
              size="small" 
              onClick={() => handleQuickDateRange(7)}
              type={filters.dateRange?.[0]?.isSame(dayjs().subtract(7, 'day'), 'day') ? 'primary' : 'default'}
            >
              Son 7 Gün
            </Button>
            <Button 
              size="small" 
              onClick={() => handleQuickDateRange(30)}
              type={filters.dateRange?.[0]?.isSame(dayjs().subtract(30, 'day'), 'day') ? 'primary' : 'default'}
            >
              Son 30 Gün
            </Button>
            <Button 
              size="small" 
              onClick={() => handleQuickDateRange(90)}
              type={filters.dateRange?.[0]?.isSame(dayjs().subtract(90, 'day'), 'day') ? 'primary' : 'default'}
            >
              Son 3 Ay
            </Button>
          </Space>
        </Space>

        {/* Period Selection */}
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px', color: '#666' }}>Periyot:</div>
          <Select
            value={filters.period}
            onChange={handlePeriodChange}
            size="small"
            style={{ width: '100px' }}
          >
            <Option value="daily">Günlük</Option>
            <Option value="weekly">Haftalık</Option>
            <Option value="monthly">Aylık</Option>
            <Option value="yearly">Yıllık</Option>
          </Select>
        </Space>

        {/* Category Filter */}
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px', color: '#666' }}>Kategori:</div>
          <Select
            value={filters.category}
            onChange={handleCategoryChange}
            size="small"
            style={{ width: '120px' }}
          >
            <Option value="all">Tümü</Option>
            <Option value="sales">Satışlar</Option>
            <Option value="customers">Müşteriler</Option>
            <Option value="products">Ürünler</Option>
            <Option value="invoices">Faturalar</Option>
          </Select>
        </Space>

        {/* Reset Filters */}
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px', color: 'transparent' }}>.</div>
          <Button size="small" onClick={resetFilters}>
            Sıfırla
          </Button>
        </Space>
      </Space>
    </Card>
  )
}

export default ChartFilters 