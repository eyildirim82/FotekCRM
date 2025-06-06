import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2, { message: 'Firma adı en az 2 karakter olmalıdır' })
  @MaxLength(200, { message: 'Firma adı en fazla 200 karakter olabilir' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Vergi numarası en fazla 50 karakter olabilir' })
  taxNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Sektör bilgisi en fazla 100 karakter olabilir' })
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Telefon numarası en fazla 50 karakter olabilir' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @MaxLength(100, { message: 'Email adresi en fazla 100 karakter olabilir' })
  email?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Geçerli bir website URL\'si giriniz' })
  @MaxLength(100, { message: 'Website URL\'si en fazla 100 karakter olabilir' })
  website?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Şehir bilgisi en fazla 50 karakter olabilir' })
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Ülke bilgisi en fazla 50 karakter olabilir' })
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Posta kodu en fazla 20 karakter olabilir' })
  postalCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['lead', 'prospect', 'customer', 'inactive'], {
    message: 'Durum lead, prospect, customer veya inactive olmalıdır'
  })
  status?: 'lead' | 'prospect' | 'customer' | 'inactive';
} 