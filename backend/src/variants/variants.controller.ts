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
  Req,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('variants')
@UseGuards(JwtAuthGuard)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVariantDto: CreateVariantDto, @Req() req: any) {
    const userId = req.user.id;
    return await this.variantsService.create(createVariantDto, userId);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('productId') productId?: string,
    @Query('color') color?: string,
    @Query('size') size?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const productIdNum = productId ? parseInt(productId, 10) : undefined;
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return await this.variantsService.findAll(
      pageNum,
      limitNum,
      search,
      productIdNum,
      color,
      size,
      isActiveBool,
    );
  }

  @Get('stats')
  async getStats() {
    return await this.variantsService.getStats();
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return await this.variantsService.findByProduct(productId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.variantsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVariantDto: UpdateVariantDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return await this.variantsService.update(id, updateVariantDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.variantsService.remove(id);
  }
} 