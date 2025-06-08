import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe, Res } from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { InvoicesService } from './invoices.service'
import { CreateInvoiceDto } from './dto/create-invoice.dto'
// InvoiceStatus enum kaldırıldı, string kullanıyoruz

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    try {
      const invoice = await this.invoicesService.create(createInvoiceDto)
      return {
        success: true,
        message: 'Fatura başarıyla oluşturuldu',
        data: invoice
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50'
  ) {
    try {
      const result = await this.invoicesService.findAll(
        parseInt(page),
        parseInt(limit)
      )
      return {
        success: true,
        message: 'Fatura listesi başarıyla alındı',
        data: result.data,
        pagination: {
          page: result.page,
          limit: parseInt(limit),
          total: result.total,
          totalPages: result.totalPages
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: null
      }
    }
  }

  @Get('statistics')
  async getStatistics() {
    try {
      const stats = await this.invoicesService.getStatistics()
      return {
        success: true,
        message: 'Fatura istatistikleri başarıyla alındı',
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }

  @Get('generate-number/:type')
  async generateInvoiceNumber(@Param('type') type: string) {
    try {
      const invoiceNumber = await this.invoicesService.generateInvoiceNumber(type)
      return {
        success: true,
        message: 'Fatura numarası başarıyla oluşturuldu',
        data: { invoiceNumber }
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const invoice = await this.invoicesService.findOne(id)
      return {
        success: true,
        message: 'Fatura başarıyla alındı',
        data: invoice
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }

  @Get(':id/pdf')
  async generatePDF(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    try {
      const invoice = await this.invoicesService.findOne(id)
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Fatura bulunamadı'
        })
      }

      // Mock PDF content - gelecekte gerçek PDF generation eklenecek
      const mockPDF = this.generateMockPDF(invoice)
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="fatura-${invoice.invoiceNumber}.pdf"`)
      res.send(Buffer.from(mockPDF, 'base64'))
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'PDF oluşturulamadı'
      })
    }
  }

  private generateMockPDF(invoice: any): string {
    // Bu fonksiyon gelecekte gerçek PDF library ile değiştirilecek
    // Şimdilik mock bir PDF base64 string döndürüyoruz
    
    const lines = invoice.lines?.map((line: any, index: number) => 
      `${index + 1}. ${line.description} - ${line.quantity} ${line.unit || 'Adet'} x ${line.unitPrice} TL = ${line.lineTotalWithVat || 0} TL`
    ).join('\\n') || 'Fatura satırı yok'

    const pdfContent = `%PDF-1.3
3 0 obj
<</Type /Page
/Parent 1 0 R
/Resources 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<</Length 1074>>
stream
BT
/F1 18 Tf
50 750 Td
(FATURA) Tj
0 -40 Td
/F1 12 Tf
(Fatura No: ${invoice.invoiceNumber}) Tj
0 -20 Td
(Musteri: ${invoice.customerName || 'Belirtilmemis'}) Tj
0 -20 Td
(Tarih: ${new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}) Tj
0 -40 Td
(FATURA SATIRLARI:) Tj
0 -30 Td
(${lines}) Tj
0 -40 Td
(TOPLAM: ${invoice.total || 0} TL) Tj
ET
endstream
endobj

2 0 obj
<</ProcSet[/PDF/Text]/Font<</F1 5 0 R>>>>
endobj

5 0 obj
<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
endobj

1 0 obj
<</Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

6 0 obj
<</Type /Catalog
/Pages 1 0 R
>>
endobj

xref
0 7
0000000000 65535 f 
0000000879 00000 n
0000000781 00000 n
0000000009 00000 n
0000000087 00000 n
0000000831 00000 n
0000000936 00000 n
trailer
<</Size 7/Root 6 0 R>>
startxref
985
%%EOF`

    return Buffer.from(pdfContent).toString('base64')
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string
  ) {
    try {
      const invoice = await this.invoicesService.updateStatus(id, status)
      return {
        success: true,
        message: 'Fatura durumu başarıyla güncellendi',
        data: invoice
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.invoicesService.delete(id)
      return {
        success: true,
        message: 'Fatura başarıyla silindi',
        data: null
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      }
    }
  }
}
