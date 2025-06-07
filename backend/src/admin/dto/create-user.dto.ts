import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, MinLength } from 'class-validator';
import { UserRole } from '../../auth/roles.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email: string;

  @IsString({ message: 'Ad alanı gereklidir' })
  firstName: string;

  @IsString({ message: 'Soyad alanı gereklidir' })
  lastName: string;

  @IsString({ message: 'Şifre gereklidir' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Geçerli bir rol seçiniz' })
  role?: UserRole = UserRole.USER;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
} 