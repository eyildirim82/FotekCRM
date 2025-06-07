import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum, IsUUID, IsDecimal, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderStatus, Currency } from '../../entities/order.entity'

export class CreateOrderLineDto {
  @IsOptional()
  @IsNumber()
  productId?: number

  @IsOptional()
  @IsNumber()
  variantId?: number

  @IsNotEmpty({ message: 'Ürün kodu zorunludur' })
  @IsString()
  itemCode: string

  @IsNotEmpty({ message: 'Ürün adı zorunludur' })
  @IsString()
  itemName: string

  @IsOptional()
  @IsString()
  itemDescription?: string

  @IsNotEmpty({ message: 'Miktar zorunludur' })
  @IsNumber({}, { message: 'Geçerli bir miktar giriniz' })
  @Min(0.01, { message: 'Miktar 0\'dan büyük olmalıdır' })
  quantity: number

  @IsOptional()
  @IsString()
  unit?: string

  @IsNotEmpty({ message: 'Birim fiyat zorunludur' })
  @IsNumber({}, { message: 'Geçerli bir fiyat giriniz' })
  @Min(0, { message: 'Fiyat 0\'dan küçük olamaz' })
  unitPrice: number

  @IsOptional()
  @IsNumber({}, { message: 'Geçerli bir iskonto oranı giriniz' })
  @Min(0, { message: 'İskonto oranı 0\'dan küçük olamaz' })
  @Max(100, { message: 'İskonto oranı 100\'den büyük olamaz' })
  discountPercent?: number

  @IsOptional()
  @IsNumber({}, { message: 'Geçerli bir iskonto tutarı giriniz' })
  @Min(0, { message: 'İskonto tutarı 0\'dan küçük olamaz' })
  discountAmount?: number

  @IsOptional()
  @IsNumber({}, { message: 'Geçerli bir KDV oranı giriniz' })
  @Min(0, { message: 'KDV oranı 0\'dan küçük olamaz' })
  @Max(100, { message: 'KDV oranı 100\'den büyük olamaz' })
  vatRate?: number

  @IsOptional()
  @IsString()
  @IsEnum(Currency, { message: 'Geçerli bir para birimi seçiniz (TRY, USD, EUR)' })
  currency?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Müşteri ID zorunludur' })
  @IsUUID('4', { message: 'Geçerli bir müşteri ID\'si giriniz' })
  customerId: string

  @IsOptional()
  @IsString()
  orderNumber?: string

  @IsOptional()
  @IsNumber({}, { message: 'Geçerli bir iskonto tutarı giriniz' })
  @Min(0, { message: 'İskonto tutarı 0\'dan küçük olamaz' })
  discountAmount?: number

  @IsOptional()
  @IsString()
  @IsEnum(Currency, { message: 'Geçerli bir para birimi seçiniz (TRY, USD, EUR)' })
  currency?: string

  @IsOptional()
  @IsString()
  @IsEnum(OrderStatus, { message: 'Geçerli bir sipariş durumu seçiniz' })
  status?: string

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir tarih formatı giriniz' })
  orderDate?: string

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir teslimat tarihi giriniz' })
  deliveryDate?: string

  @IsOptional()
  @IsString()
  shippingAddress?: string

  @IsOptional()
  @IsString()
  shippingMethod?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  paymentStatus?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  internalNotes?: string

  @IsNotEmpty({ message: 'Sipariş satırları zorunludur' })
  @IsArray({ message: 'Sipariş satırları dizi formatında olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderLineDto)
  orderLines: CreateOrderLineDto[]
} 