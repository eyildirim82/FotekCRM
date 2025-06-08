import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Invoice } from './entities/invoice.entity'
import { InvoiceLine } from './entities/invoice-line.entity'
import { CreateInvoiceDto } from './dto/create-invoice.dto'

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLine)
    private invoiceLineRepository: Repository<InvoiceLine>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    try {
      // Fatura numarası benzersizlik kontrolü
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { invoiceNumber: createInvoiceDto.invoiceNumber }
      })

      if (existingInvoice) {
        throw new BadRequestException('Bu fatura numarası zaten kullanılıyor')
      }

      // Yeni fatura oluştur
      const invoice = this.invoiceRepository.create({
        ...createInvoiceDto,
        invoiceDate: new Date(createInvoiceDto.invoiceDate),
        dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : null,
        status: createInvoiceDto.status || 'draft',
        currency: createInvoiceDto.currency || 'TRY',
        exchangeRate: createInvoiceDto.exchangeRate || 1,
      })

      // Fatura satırlarını oluştur ve hesapla
      const lines: InvoiceLine[] = []
      let subtotal = 0
      let totalDiscount = 0
      let totalVat = 0

      for (const lineDto of createInvoiceDto.lines) {
        const line = this.invoiceLineRepository.create({
          ...lineDto,
          discountPercent: lineDto.discountPercent || 0,
        })

        // Satır tutarlarını hesapla
        line.calculateAmounts()
        
        lines.push(line)
        subtotal += line.lineTotal
        totalDiscount += line.discountAmount
        totalVat += line.vatAmount
      }

      // Fatura toplamlarını hesapla
      invoice.subtotal = subtotal
      invoice.totalDiscount = totalDiscount
      invoice.totalVat = totalVat
      invoice.total = subtotal + totalVat

      // Faturayı kaydet
      const savedInvoice = await this.invoiceRepository.save(invoice)

      // Satırları fatura ile ilişkilendir ve kaydet
      for (const line of lines) {
        line.invoiceId = savedInvoice.id
        await this.invoiceLineRepository.save(line)
      }

      // Satırlarla birlikte faturayı döndür
      return await this.findOne(savedInvoice.id)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Fatura oluşturulurken hata oluştu: ' + error.message)
    }
  }

  async findAll(page: number = 1, limit: number = 50): Promise<{ data: Invoice[], total: number, page: number, totalPages: number }> {
    const [invoices, total] = await this.invoiceRepository.findAndCount({
      relations: ['lines'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data: invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['lines'],
    })

    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı')
    }

    return invoice
  }

  async updateStatus(id: string, status: string): Promise<Invoice> {
    const invoice = await this.findOne(id)
    invoice.status = status
    await this.invoiceRepository.save(invoice)
    return invoice
  }

  async delete(id: string): Promise<void> {
    const invoice = await this.findOne(id)
    await this.invoiceRepository.remove(invoice)
  }

  async generateInvoiceNumber(type: string = 'sales'): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = type === 'sales' ? 'SAT' : 'AL'
    
    // Bu yıl için son fatura numarasını bul
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :pattern', { pattern: `${prefix}${year}%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne()

    let nextNumber = 1
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-6))
      nextNumber = lastNumber + 1
    }

    return `${prefix}${year}${nextNumber.toString().padStart(6, '0')}`
  }

  // Mock PDF generation
  async generatePDF(id: string): Promise<{ message: string, downloadUrl: string }> {
    const invoice = await this.findOne(id)
    
    // Mock PDF generation - gerçek implementasyonda PDF library kullanılacak
    const mockPdfUrl = `/api/invoices/${id}/download`
    
    return {
      message: 'PDF başarıyla oluşturuldu',
      downloadUrl: mockPdfUrl
    }
  }

  // İstatistikler
  async getStatistics(): Promise<any> {
    const totalInvoices = await this.invoiceRepository.count()
    const draftInvoices = await this.invoiceRepository.count({ where: { status: 'draft' } })
    const paidInvoices = await this.invoiceRepository.count({ where: { status: 'paid' } })
    
    const totalAmount = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total)', 'total')
      .getRawOne()

    return {
      totalInvoices,
      draftInvoices,
      paidInvoices,
      totalAmount: parseFloat(totalAmount.total) || 0,
    }
  }
}
