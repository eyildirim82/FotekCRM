import { PartialType } from '@nestjs/mapped-types'
import { CreateContactDto } from './create-contact.dto'
import { IsOptional, IsUUID, IsBoolean, IsDateString } from 'class-validator'

export class UpdateContactDto extends PartialType(CreateContactDto) {
  @IsOptional()
  @IsUUID('4', { message: 'Geçerli bir firma ID\'si giriniz' })
  companyId?: string

  @IsOptional()
  @IsBoolean({ message: 'Birincil kişi alanı doğru/yanlış olmalıdır' })
  isPrimary?: boolean

  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir doğum tarihi giriniz (YYYY-MM-DD)' })
  birthDate?: string
} 