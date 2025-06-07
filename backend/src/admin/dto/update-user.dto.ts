import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '../../auth/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Ad alanı gereklidir' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Soyad alanı gereklidir' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 