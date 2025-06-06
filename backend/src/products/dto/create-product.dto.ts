import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsIn, Min, Max, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  listPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsIn([0, 1, 8, 18, 20])
  @IsOptional()
  vatRate?: number;

  @IsString()
  @IsIn(['TRY', 'USD', 'EUR'])
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  companyId?: number;
} 