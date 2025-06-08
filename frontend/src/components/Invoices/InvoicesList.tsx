import React, { useState, useEffect } from 'react'
import { invoicesApi, Invoice } from '../../services/invoicesApi'
import './Invoices.css'

interface InvoicesListProps {
  onCreateNew: () => void
}

const InvoicesList: React.FC<InvoicesListProps> = ({ onCreateNew }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    total: 0,
    draft: 0,
    paid: 0,
    totalAmount: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPDFModal, setShowPDFModal] = useState(false)

  useEffect(() => {
    loadInvoices()
    loadStatistics()
  }, [])

  const loadInvoices = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await invoicesApi.getInvoices(page, 50)
      if (response.success) {
        setInvoices(response.data.invoices)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Fatura listesi yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await invoicesApi.getInvoiceStatistics()
      if (response.success) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await invoicesApi.updateInvoiceStatus(id, status)
      if (response.success) {
        loadInvoices(pagination.page)
        loadStatistics()
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu faturayı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await invoicesApi.deleteInvoice(id)
        if (response.success) {
          loadInvoices(pagination.page)
          loadStatistics()
        }
      } catch (error) {
        console.error('Fatura silinirken hata:', error)
      }
    }
  }

  const handlePDFPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPDFModal(true)
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: 'invoice-status-draft',
      sent: 'invoice-status-sent',
      paid: 'invoice-status-paid',
      cancelled: 'invoice-status-cancelled'
    }
    
    const statusTexts = {
      draft: 'Taslak',
      sent: 'Gönderildi',
      paid: 'Ödendi',
      cancelled: 'İptal'
    }

    return (
      <span className={`invoice-status ${statusClasses[status as keyof typeof statusClasses] || ''}`}>
        {statusTexts[status as keyof typeof statusTexts] || status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  if (loading) {
    return <div className="loading">Faturalar yükleniyor...</div>
  }

  return (
    <div className="invoices-container">
      <h1>Faturalar</h1>

      {/* İstatistik Kartları */}
      <div className="statistics-grid">
        <div className="stat-card">
          <h3>Toplam Fatura</h3>
          <div className="stat-value">{statistics.total}</div>
        </div>
        <div className="stat-card">
          <h3>Taslak</h3>
          <div className="stat-value draft">{statistics.draft}</div>
        </div>
        <div className="stat-card">
          <h3>Ödenen</h3>
          <div className="stat-value paid">{statistics.paid}</div>
        </div>
        <div className="stat-card">
          <h3>Toplam Tutar</h3>
          <div className="stat-value">{formatCurrency(statistics.totalAmount)}</div>
        </div>
      </div>

      {/* Fatura Listesi */}
      <div className="invoices-table-container">
        <div className="table-header">
          <button className="btn-primary" onClick={onCreateNew}>
            Yeni Fatura
          </button>
        </div>

        <table className="invoices-table">
          <thead>
            <tr>
              <th>Fatura No</th>
              <th>Müşteri</th>
              <th>Tarih</th>
              <th>Vade</th>
              <th>Durum</th>
              <th>Tutar</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="invoice-number">{invoice.invoiceNumber}</td>
                <td>{invoice.customerName || 'Belirtilmemiş'}</td>
                <td>{formatDate(invoice.invoiceDate)}</td>
                <td>{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                <td>{getStatusBadge(invoice.status || 'draft')}</td>
                <td className="amount">{formatCurrency(invoice.total || 0)}</td>
                <td className="actions">
                  <button 
                    className="btn-view"
                    onClick={() => window.location.href = `/invoices/${invoice.id}`}
                  >
                    Görüntüle
                  </button>
                  <button 
                    className="btn-pdf"
                    onClick={() => handlePDFPreview(invoice)}
                  >
                    PDF
                  </button>
                  <select 
                    value={invoice.status || 'draft'}
                    onChange={(e) => handleStatusUpdate(invoice.id!, e.target.value)}
                    className="status-select"
                  >
                    <option value="draft">Taslak</option>
                    <option value="sent">Gönderildi</option>
                    <option value="paid">Ödendi</option>
                    <option value="cancelled">İptal</option>
                  </select>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(invoice.id!)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="no-data">
            Henüz fatura oluşturulmamış.
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                onClick={() => loadInvoices(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPDFModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowPDFModal(false)}>
          <div className="modal-content pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Fatura PDF Önizleme</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPDFModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={`/api/invoices/${selectedInvoice.id}/pdf`}
                width="100%"
                height="600"
                title={`Fatura ${selectedInvoice.invoiceNumber} PDF`}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowPDFModal(false)}
              >
                Kapat
              </button>
              <a 
                href={`/api/invoices/${selectedInvoice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                PDF İndir
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoicesList 