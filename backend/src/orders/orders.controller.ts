import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    try {
      const order = await this.ordersService.create(createOrderDto, req.user.id)
      return {
        success: true,
        message: 'Sipariş başarıyla oluşturuldu',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const result = await this.ordersService.findAll({
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        status,
        customerId,
        startDate,
        endDate,
      })

      return {
        success: true,
        message: 'Siparişler başarıyla listelendi',
        data: result.data,
        pagination: result.pagination
      }
    } catch (error) {
      throw error
    }
  }

  @Get('stats')
  async getStats(
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const stats = await this.ordersService.getStats({
        customerId,
        startDate,
        endDate,
      })

      return {
        success: true,
        message: 'Sipariş istatistikleri başarıyla alındı',
        data: stats
      }
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const order = await this.ordersService.findOne(id)
      return {
        success: true,
        message: 'Sipariş başarıyla bulundu',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    try {
      const order = await this.ordersService.update(id, updateOrderDto, req.user.id)
      return {
        success: true,
        message: 'Sipariş başarıyla güncellendi',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.ordersService.remove(id)
      return result
    } catch (error) {
      throw error
    }
  }

  @Patch(':id/confirm')
  async confirm(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const order = await this.ordersService.update(
        id,
        { status: 'confirmed' },
        req.user.id
      )
      return {
        success: true,
        message: 'Sipariş başarıyla onaylandı',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Patch(':id/ship')
  async ship(
    @Param('id', ParseIntPipe) id: number,
    @Body() shipData: { shippedDate?: string; shippingMethod?: string },
    @Request() req
  ) {
    try {
      const order = await this.ordersService.update(
        id,
        { 
          status: 'shipped',
          shippedDate: shipData.shippedDate || new Date().toISOString(),
          shippingMethod: shipData.shippingMethod
        },
        req.user.id
      )
      return {
        success: true,
        message: 'Sipariş kargoya verildi',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Patch(':id/deliver')
  async deliver(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const order = await this.ordersService.update(
        id,
        { 
          status: 'delivered',
          deliveryDate: new Date().toISOString()
        },
        req.user.id
      )
      return {
        success: true,
        message: 'Sipariş teslim edildi',
        data: order
      }
    } catch (error) {
      throw error
    }
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    try {
      const order = await this.ordersService.update(
        id,
        { status: 'cancelled' },
        req.user.id
      )
      return {
        success: true,
        message: 'Sipariş iptal edildi',
        data: order
      }
    } catch (error) {
      throw error
    }
  }
} 