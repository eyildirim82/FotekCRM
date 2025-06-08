import React, { useState, useEffect } from 'react'
import { invoicesApi, CreateInvoiceData, InvoiceLine } from '../../services/invoicesApi'
import './Invoices.css'

interface InvoiceFormProps {
  onCancel: () => void
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState<CreateInvoiceData>({
    invoiceNumber: '',
    type: 'sales',
    status: 'draft',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    customerName: '',
    customerAddress: '',
    customerTaxNumber: '',
    lines: [],
    notes: '',
    terms: 'Mallar teslim alındıktan sonra iade kabul edilmez.',
    currency: 'TRY',
    exchangeRate: 1
  })

  const [currentLine, setCurrentLine] = useState<InvoiceLine>({
    description: '',
    unit: 'Adet',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    vatRate: 20
  })

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    totalVat: 0,
    total: 0
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateInvoiceNumber()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [formData.lines])

  const generateInvoiceNumber = async () => {
    try {
      const response = await invoicesApi.generateInvoiceNumber(formData.type)
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          invoiceNumber: response.data
        }))
      }
    } catch (error) {
      console.error('Fatura numarası oluşturulurken hata:', error)
    }
  }

  const calculateLineAmounts = (line: InvoiceLine): InvoiceLine => {
    const subtotal = line.quantity * line.unitPrice
    const discountAmount = subtotal * (line.discountPercent || 0) / 100
    const lineTotal = subtotal - discountAmount
    const vatAmount = lineTotal * line.vatRate / 100
    const lineTotalWithVat = lineTotal + vatAmount

    return {
      ...line,
      discountAmount,
      lineTotal,
      vatAmount,
      lineTotalWithVat
    }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalDiscount = 0
    let totalVat = 0

    formData.lines.forEach(line => {
      const calculatedLine = calculateLineAmounts(line)
      subtotal += calculatedLine.lineTotal || 0
      totalDiscount += calculatedLine.discountAmount || 0
      totalVat += calculatedLine.vatAmount || 0
    })

    setTotals({
      subtotal,
      totalDiscount,
      totalVat,
      total: subtotal + totalVat
    })
  }

  const addLine = () => {
    if (!currentLine.description || currentLine.quantity <= 0 || currentLine.unitPrice <= 0) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    const calculatedLine = calculateLineAmounts(currentLine)
    
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, calculatedLine]
    }))

    // Form temizle
    setCurrentLine({
      description: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      vatRate: 20
    })
  }

  const removeLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.lines.length === 0) {
      alert('En az bir fatura satırı eklemelisiniz')
      return
    }

    setLoading(true)
    try {
      const response = await invoicesApi.createInvoice(formData)
      if (response.success) {
        alert('Fatura başarıyla oluşturuldu!')
        onCancel() // Fatura listesine dön
      } else {
        alert('Fatura oluşturulurken hata: ' + response.message)
      }
    } catch (error) {
      console.error('Fatura oluşturulurken hata:', error)
      alert('Fatura oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  return (
    <div className="invoice-form-container">
      <h1>Yeni Fatura Oluştur</h1>

      <form onSubmit={handleSubmit} className="invoice-form">
        {/* Fatura Bilgileri */}
        <div className="form-section">
          <h2>Fatura Bilgileri</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Fatura Numarası</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Fatura Türü</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="sales">Satış Faturası</option>
                <option value="purchase">Alış Faturası</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fatura Tarihi</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Vade Tarihi</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Müşteri Bilgileri */}
        <div className="form-section">
          <h2>Müşteri Bilgileri</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Müşteri Adı</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Vergi Numarası</label>
              <input
                type="text"
                value={formData.customerTaxNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, customerTaxNumber: e.target.value }))}
              />
            </div>
            <div className="form-group full-width">
              <label>Adres</label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Satır Ekleme */}
        <div className="form-section">
          <h2>Fatura Satırı Ekle</h2>
          <div className="line-form">
            <div className="form-group">
              <label>Açıklama</label>
              <input
                type="text"
                value={currentLine.description}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ürün/Hizmet açıklaması"
              />
            </div>
            <div className="form-group">
              <label>Birim</label>
              <select
                value={currentLine.unit}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="Adet">Adet</option>
                <option value="Kg">Kg</option>
                <option value="Metre">Metre</option>
                <option value="Litre">Litre</option>
                <option value="Saat">Saat</option>
                <option value="Gün">Gün</option>
                <option value="Ay">Ay</option>
              </select>
            </div>
            <div className="form-group">
              <label>Miktar</label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={currentLine.quantity}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="form-group">
              <label>Birim Fiyat (TL)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentLine.unitPrice}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="form-group">
              <label>İskonto (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={currentLine.discountPercent}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, discountPercent: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="form-group">
              <label>KDV (%)</label>
              <select
                value={currentLine.vatRate}
                onChange={(e) => setCurrentLine(prev => ({ ...prev, vatRate: parseInt(e.target.value) }))}
              >
                <option value="0">%0</option>
                <option value="10">%10</option>
                <option value="20">%20</option>
              </select>
            </div>
            <div className="form-group">
              <button type="button" onClick={addLine} className="btn-add-line">
                Satır Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Eklenen Satırlar */}
        {formData.lines.length > 0 && (
          <div className="form-section">
            <h2>Fatura Satırları</h2>
            <table className="lines-table">
              <thead>
                <tr>
                  <th>Açıklama</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>İskonto</th>
                  <th>KDV</th>
                  <th>Toplam</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {formData.lines.map((line, index) => {
                  const calculated = calculateLineAmounts(line)
                  return (
                    <tr key={index}>
                      <td>{line.description}</td>
                      <td>{line.quantity} {line.unit}</td>
                      <td>{formatCurrency(line.unitPrice)}</td>
                      <td>%{line.discountPercent}</td>
                      <td>%{line.vatRate}</td>
                      <td>{formatCurrency(calculated.lineTotalWithVat || 0)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="btn-remove"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Toplam Bilgileri */}
        <div className="form-section">
          <h2>Toplam Bilgileri</h2>
          <div className="totals-grid">
            <div className="total-row">
              <span>Ara Toplam:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Toplam İskonto:</span>
              <span>{formatCurrency(totals.totalDiscount)}</span>
            </div>
            <div className="total-row">
              <span>Toplam KDV:</span>
              <span>{formatCurrency(totals.totalVat)}</span>
            </div>
            <div className="total-row grand-total">
              <span>GENEL TOPLAM:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Notlar */}
        <div className="form-section">
          <h2>Notlar ve Şartlar</h2>
          <div className="form-group">
            <label>Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Fatura ile ilgili özel notlar"
            />
          </div>
          <div className="form-group">
            <label>Şartlar</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        {/* Form Butonları */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading || formData.lines.length === 0}
            className="btn-primary"
          >
            {loading ? 'Oluşturuluyor...' : 'Fatura Oluştur'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InvoiceForm 