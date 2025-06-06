import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  Length,
  Matches
} from 'class-validator'
import { ContactType, ContactStatus } from '../../entities/contact.entity'

export class CreateContactDto {
  @IsString({ message: 'Ad alanı metin olmalıdır' })
  @Length(1, 100, { message: 'Ad 1-100 karakter arasında olmalıdır' })
  firstName: string

  @IsString({ message: 'Soyad alanı metin olmalıdır' })
  @Length(1, 100, { message: 'Soyad 1-100 karakter arasında olmalıdır' })
  lastName: string

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @Length(1, 255, { message: 'Email en fazla 255 karakter olabilir' })
  email?: string

  @IsOptional()
  @IsString({ message: 'Telefon alanı metin olmalıdır' })
  @Length(1, 50, { message: 'Telefon en fazla 50 karakter olabilir' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Geçerli bir telefon numarası giriniz' })
  phone?: string

  @IsOptional()
  @IsString({ message: 'Mobil telefon alanı metin olmalıdır' })
  @Length(1, 50, { message: 'Mobil telefon en fazla 50 karakter olabilir' })
  @Matches(/^[\d\s\-\+\(\)]+$/, { message: 'Geçerli bir mobil telefon numarası giriniz' })
  mobile?: string

  @IsOptional()
  @IsString({ message: 'Pozisyon alanı metin olmalıdır' })
  @Length(1, 100, { message: 'Pozisyon en fazla 100 karakter olabilir' })
  jobTitle?: string

  @IsOptional()
  @IsString({ message: 'Departman alanı metin olmalıdır' })
  @Length(1, 100, { message: 'Departman en fazla 100 karakter olabilir' })
  department?: string

  @IsOptional()
  @IsEnum(ContactType, { message: 'Geçerli bir kişi tipi seçiniz' })
  contactType?: ContactType

  @IsOptional()
  @IsEnum(ContactStatus, { message: 'Geçerli bir durum seçiniz' })
  status?: ContactStatus

  @IsOptional()
  @IsBoolean({ message: 'Birincil kişi alanı doğru/yanlış olmalıdır' })
  isPrimary?: boolean

  @IsOptional()
  @IsBoolean({ message: 'Aktif durum alanı doğru/yanlış olmalıdır' })
  isActive?: boolean

  @IsOptional()
  @IsString({ message: 'LinkedIn URL alanı metin olmalıdır' })
  @Length(1, 255, { message: 'LinkedIn URL en fazla 255 karakter olabilir' })
  linkedInUrl?: string

  @IsOptional()
  @IsString({ message: 'Skype alanı metin olmalıdır' })
  @Length(1, 255, { message: 'Skype en fazla 255 karakter olabilir' })
  skype?: string

  @IsOptional()
  @IsString({ message: 'Adres alanı metin olmalıdır' })
  @Length(1, 255, { message: 'Adres en fazla 255 karakter olabilir' })
  address?: string

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir doğum tarihi giriniz (YYYY-MM-DD)' })
  birthDate?: string

  @IsOptional()
  @IsString({ message: 'Notlar alanı metin olmalıdır' })
  @Length(1, 1000, { message: 'Notlar en fazla 1000 karakter olabilir' })
  notes?: string

  @IsString({ message: 'Firma ID alanı metin olmalıdır' })
  @Length(36, 36, { message: 'Geçerli bir firma ID\'si giriniz' })
  companyId: string
} 