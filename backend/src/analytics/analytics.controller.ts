import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-metrics')
  async getDashboardMetrics() {
    try {
      const metrics = await this.analyticsService.getDashboardMetrics();
      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      return {
        success: false,
        message: 'Dashboard metrics alınırken hata oluştu',
        error: error.message
      };
    }
  }

  @Get('sales-chart')
  async getSalesChart() {
    try {
      const chartData = await this.analyticsService.getMonthlySalesChart();
      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      return {
        success: false,
        message: 'Satış grafiği verisi alınırken hata oluştu',
        error: error.message
      };
    }
  }

  @Get('top-customers')
  async getTopCustomers(@Query('limit') limit?: string) {
    try {
      const customers = await this.analyticsService.getTopCustomers(
        limit ? parseInt(limit) : 5
      );
      return {
        success: true,
        data: customers
      };
    } catch (error) {
      return {
        success: false,
        message: 'En iyi müşteri listesi alınırken hata oluştu',
        error: error.message
      };
    }
  }

  @Get('top-products')
  async getTopProducts(@Query('limit') limit?: string) {
    try {
      const products = await this.analyticsService.getTopProducts(
        limit ? parseInt(limit) : 5
      );
      return {
        success: true,
        data: products
      };
    } catch (error) {
      return {
        success: false,
        message: 'En çok satan ürün listesi alınırken hata oluştu',
        error: error.message
      };
    }
  }

  @Get('invoice-status-chart')
  async getInvoiceStatusChart() {
    try {
      const chartData = await this.analyticsService.getInvoiceStatusChart();
      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      return {
        success: false,
        message: 'Fatura durum grafiği verisi alınırken hata oluştu',
        error: error.message
      };
    }
  }

  @Get('recent-activity')
  async getRecentActivity() {
    try {
      const activity = await this.analyticsService.getRecentActivity();
      return {
        success: true,
        data: activity
      };
    } catch (error) {
      return {
        success: false,
        message: 'Son aktiviteler alınırken hata oluştu',
        error: error.message
      };
    }
  }
}
