import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Company } from '../entities/company.entity';
import { Product } from '../entities/product.entity';
import { Contact } from '../entities/contact.entity';

export interface DashboardMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalInvoices: number;
  averageOrderValue: number;
  monthlyGrowth: number;
}

export interface SalesChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }>;
}

export interface TopCustomer {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Get current date and start of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total Revenue (from paid invoices)
    const totalRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: 'paid' })
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    // Monthly Revenue
    const monthlyRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: 'paid' })
      .andWhere('invoice.invoiceDate >= :startOfMonth', { startOfMonth })
      .getRawOne();
    const monthlyRevenue = parseFloat(monthlyRevenueResult?.total || '0');

    // Last Month Revenue for growth calculation
    const lastMonthRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .where('invoice.status = :status', { status: 'paid' })
      .andWhere('invoice.invoiceDate >= :startOfLastMonth', { startOfLastMonth })
      .andWhere('invoice.invoiceDate <= :endOfLastMonth', { endOfLastMonth })
      .getRawOne();
    const lastMonthRevenue = parseFloat(lastMonthRevenueResult?.total || '0');

    // Calculate monthly growth
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Total Orders
    const totalOrders = await this.orderRepository.count();

    // Total Customers (Companies)
    const totalCustomers = await this.companyRepository.count();

    // Total Products
    const totalProducts = await this.productRepository.count();

    // Total Invoices
    const totalInvoices = await this.invoiceRepository.count();

    // Average Order Value
    const totalOrderValueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();
    const totalOrderValue = parseFloat(totalOrderValueResult?.total || '0');
    const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      totalInvoices,
      averageOrderValue,
      monthlyGrowth,
    };
  }

  async getMonthlySalesChart(): Promise<SalesChartData> {
    // Get last 12 months data
    const months = [];
    const salesData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Month name
      const monthName = date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      months.push(monthName);

      // Sales for this month
      const monthSalesResult = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.status = :status', { status: 'paid' })
        .andWhere('invoice.invoiceDate >= :startOfMonth', { startOfMonth })
        .andWhere('invoice.invoiceDate <= :endOfMonth', { endOfMonth })
        .getRawOne();
      
      const monthSales = parseFloat(monthSalesResult?.total || '0');
      salesData.push(monthSales);
    }

    return {
      labels: months,
      datasets: [{
        label: 'Aylık Satış (TL)',
        data: salesData,
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        borderColor: 'rgba(24, 144, 255, 1)',
      }]
    };
  }

  async getTopCustomers(limit = 5): Promise<TopCustomer[]> {
    const topCustomers = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'invoice.customerName as name',
        'SUM(invoice.total) as totalSpent',
        'COUNT(invoice.id) as orderCount'
      ])
      .where('invoice.status = :status', { status: 'paid' })
      .groupBy('invoice.customerName')
      .orderBy('SUM(invoice.total)', 'DESC')
      .limit(limit)
      .getRawMany();

    return topCustomers.map((customer, index) => ({
      id: `customer-${index}`,
      name: customer.name || 'Bilinmeyen Müşteri',
      totalSpent: parseFloat(customer.totalSpent || '0'),
      orderCount: parseInt(customer.orderCount || '0'),
    }));
  }

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    // This would need invoice lines to be properly implemented
    // For now, return mock data based on products
    const products = await this.productRepository
      .createQueryBuilder('product')
      .limit(limit)
      .getMany();

    return products.map((product, index) => ({
      id: product.id.toString(),
      name: product.name,
      totalSold: Math.floor(Math.random() * 100) + 10, // Mock data
      revenue: (Math.random() * 50000) + 5000, // Mock data
    }));
  }

  async getInvoiceStatusChart(): Promise<SalesChartData> {
    const statusCounts = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'invoice.status as status',
        'COUNT(invoice.id) as count'
      ])
      .groupBy('invoice.status')
      .getRawMany();

    const statusLabels = statusCounts.map(item => {
      const statusMap = {
        'draft': 'Taslak',
        'sent': 'Gönderildi',
        'paid': 'Ödendi',
        'cancelled': 'İptal'
      };
      return statusMap[item.status as keyof typeof statusMap] || item.status;
    });

    const statusData = statusCounts.map(item => parseInt(item.count || '0'));

    return {
      labels: statusLabels,
      datasets: [{
        label: 'Fatura Durumu',
        data: statusData,
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',  // draft - yellow
          'rgba(54, 162, 235, 0.8)', // sent - blue
          'rgba(75, 192, 192, 0.8)', // paid - green
          'rgba(255, 99, 132, 0.8)'  // cancelled - red
        ]
      }]
    };
  }

  async getRecentActivity() {
    // Get recent orders
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .orderBy('order.orderDate', 'DESC')
      .limit(5)
      .getMany();

    // Get recent invoices
    const recentInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .orderBy('invoice.invoiceDate', 'DESC')
      .limit(5)
      .getMany();

    return {
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        title: `Sipariş ${order.orderNumber}`,
        description: `Müşteri ID: ${order.customerId} - ${order.totalAmount?.toLocaleString('tr-TR')} TL`,
        date: order.orderDate,
        status: order.status
      })),
      recentInvoices: recentInvoices.map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        title: `Fatura ${invoice.invoiceNumber}`,
        description: `${invoice.customerName} - ${invoice.total?.toLocaleString('tr-TR')} TL`,
        date: invoice.invoiceDate,
        status: invoice.status
      }))
    };
  }
}
