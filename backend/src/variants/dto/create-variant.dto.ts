import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, MaxLength, Min, IsIn } from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty({ message: 'Ürün ID zorunludur' })
  @IsNumber({}, { message: 'Ürün ID sayı olmalıdır' })
  productId: number;

  @IsNotEmpty({ message: 'SKU zorunludur' })
  @IsString({ message: 'SKU metin olmalıdır' })
  @MaxLength(100, { message: 'SKU en fazla 100 karakter olabilir' })
  sku: string;

  @IsOptional()
  @IsString({ message: 'Renk metin olmalıdır' })
  @MaxLength(50, { message: 'Renk en fazla 50 karakter olabilir' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Beden metin olmalıdır' })
  @MaxLength(20, { message: 'Beden en fazla 20 karakter olabilir' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'Kapasite metin olmalıdır' })
  @MaxLength(50, { message: 'Kapasite en fazla 50 karakter olabilir' })
  capacity?: string;

  @IsOptional()
  @IsString({ message: 'Malzeme metin olmalıdır' })
  @MaxLength(50, { message: 'Malzeme en fazla 50 karakter olabilir' })
  material?: string;

  @IsOptional()
  @IsString({ message: 'Stil metin olmalıdır' })
  @MaxLength(50, { message: 'Stil en fazla 50 karakter olabilir' })
  style?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Birim fiyat sayı olmalıdır' })
  @Min(0, { message: 'Birim fiyat negatif olamaz' })
  unitPrice?: number;

  @IsOptional()
  @IsString({ message: 'Para birimi metin olmalıdır' })
  @IsIn(['TRY', 'USD', 'EUR', 'GBP'], { message: 'Geçersiz para birimi' })
  currency?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Stok miktarı sayı olmalıdır' })
  @Min(0, { message: 'Stok miktarı negatif olamaz' })
  stockQuantity?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum stok seviyesi sayı olmalıdır' })
  @Min(0, { message: 'Minimum stok seviyesi negatif olamaz' })
  minStockLevel?: number;

  @IsOptional()
  @IsBoolean({ message: 'Aktif durumu boolean olmalıdır' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: 'Resim URL metin olmalıdır' })
  @MaxLength(255, { message: 'Resim URL en fazla 255 karakter olabilir' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Notlar metin olmalıdır' })
  notes?: string;
} 