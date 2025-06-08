import { IsString, IsIn, IsOptional, IsDateString, IsArray, ValidateNested, IsUUID, IsNumber, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateInvoiceLineDto {
  @IsOptional()
  @IsUUID()
  productId?: string

  @IsOptional()
  @IsString()
  productCode?: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  unit?: string

  @IsNumber()
  @Min(0.001)
  quantity: number

  @IsNumber()
  @Min(0)
  unitPrice: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number

  @IsIn([0, 10, 20])
  vatRate: number
}

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber: string

  @IsIn(['sales', 'purchase'])
  type: string

  @IsOptional()
  @IsIn(['draft', 'sent', 'paid', 'cancelled'])
  status?: string

  @IsDateString()
  invoiceDate: string

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsUUID()
  companyId?: string

  @IsOptional()
  @IsUUID()
  contactId?: string

  @IsOptional()
  @IsString()
  customerName?: string

  @IsOptional()
  @IsString()
  customerAddress?: string

  @IsOptional()
  @IsString()
  customerTaxNumber?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines: CreateInvoiceLineDto[]

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  terms?: string

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  exchangeRate?: number
} 