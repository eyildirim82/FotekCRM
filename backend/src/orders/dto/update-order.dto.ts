import { PartialType } from '@nestjs/mapped-types'
import { CreateOrderDto } from './create-order.dto'
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator'
import { OrderStatus } from '../../entities/order.entity'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  @IsEnum(OrderStatus, { message: 'Geçerli bir sipariş durumu seçiniz' })
  status?: string

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir kargo tarihi giriniz' })
  shippedDate?: string

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir teslimat tarihi giriniz' })
  deliveryDate?: string
} 