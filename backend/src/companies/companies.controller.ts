import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // POST /api/companies - Create new company
  @Post()
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
    @Request() req: any,
  ) {
    const company = await this.companiesService.create(createCompanyDto, req.user);
    return {
      success: true,
      message: 'Firma başarıyla oluşturuldu',
      data: company.toResponseObject(),
    };
  }

  // GET /api/companies - Get all companies with pagination
  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const result = await this.companiesService.findAll(
      page || 1,
      limit || 20,
      search,
      status,
      userId,
    );

    return {
      success: true,
      message: 'Firmalar başarıyla listelendi',
      data: {
        companies: result.companies.map(company => 
          company.toResponseObject ? company.toResponseObject() : company
        ),
        pagination: {
          page: page || 1,
          limit: limit || 20,
          total: result.total,
          pages: result.pages,
        },
      },
    };
  }

  // GET /api/companies/stats - Get company statistics
  @Get('stats')
  async getStats(@Query('userId') userId?: string) {
    const stats = await this.companiesService.getStats(userId);
    return {
      success: true,
      message: 'İstatistikler başarıyla getirildi',
      data: stats,
    };
  }

  // GET /api/companies/:id - Get single company
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const company = await this.companiesService.findOne(id);
    return {
      success: true,
      message: 'Firma başarıyla getirildi',
      data: company.toResponseObject(),
    };
  }

  // PATCH /api/companies/:id - Update company
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
    @Request() req: any,
  ) {
    const company = await this.companiesService.update(id, updateCompanyDto, req.user);
    return {
      success: true,
      message: 'Firma başarıyla güncellendi',
      data: company.toResponseObject(),
    };
  }

  // DELETE /api/companies/:id - Soft delete company
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.companiesService.remove(id, req.user);
    return {
      success: true,
      message: 'Firma başarıyla silindi',
    };
  }
} 