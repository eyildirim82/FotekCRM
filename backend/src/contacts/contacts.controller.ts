import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ContactsService } from './contacts.service'
import { CreateContactDto } from './dto/create-contact.dto'
import { UpdateContactDto } from './dto/update-contact.dto'
import { ContactType, ContactStatus } from '../entities/contact.entity'

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // Create new contact
  @Post()
  async create(
    @Body(ValidationPipe) createContactDto: CreateContactDto,
    @Request() req
  ) {
    try {
      const contact = await this.contactsService.create(createContactDto, req.user.userId)
      return {
        success: true,
        message: 'Kişi başarıyla oluşturuldu',
        data: contact
      }
    } catch (error) {
      throw error
    }
  }

  // Get all contacts with pagination and filters
  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('companyId') companyId?: string,
    @Query('contactType') contactType?: ContactType,
    @Query('status') status?: ContactStatus,
    @Request() req?
  ) {
    try {
      const result = await this.contactsService.findAll(
        page || 1,
        limit || 10,
        search,
        companyId,
        contactType,
        status,
        req.user.userId
      )

      return {
        success: true,
        message: 'Kişiler başarıyla listelendi',
        data: result
      }
    } catch (error) {
      throw error
    }
  }

  // Get contact statistics
  @Get('stats')
  async getStats(
    @Query('companyId') companyId?: string,
    @Request() req?
  ) {
    try {
      const stats = await this.contactsService.getStats(req.user.userId, companyId)
      return {
        success: true,
        message: 'İstatistikler başarıyla alındı',
        data: stats
      }
    } catch (error) {
      throw error
    }
  }

  // Get contacts by company
  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req
  ) {
    try {
      const contacts = await this.contactsService.findByCompany(companyId, req.user.userId)
      return {
        success: true,
        message: 'Firma kişileri başarıyla listelendi',
        data: contacts
      }
    } catch (error) {
      throw error
    }
  }

  // Get single contact by ID
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    try {
      const contact = await this.contactsService.findOne(id, req.user.userId)
      return {
        success: true,
        message: 'Kişi başarıyla bulundu',
        data: contact
      }
    } catch (error) {
      throw error
    }
  }

  // Update contact
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
    @Request() req
  ) {
    try {
      const contact = await this.contactsService.update(id, updateContactDto, req.user.userId)
      return {
        success: true,
        message: 'Kişi başarıyla güncellendi',
        data: contact
      }
    } catch (error) {
      throw error
    }
  }

  // Delete contact (soft delete)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    try {
      await this.contactsService.remove(id, req.user.userId)
      return {
        success: true,
        message: 'Kişi başarıyla silindi'
      }
    } catch (error) {
      throw error
    }
  }
} 