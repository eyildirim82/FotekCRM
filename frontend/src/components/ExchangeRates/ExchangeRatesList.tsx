import React, { useState, useEffect } from 'react';
import { exchangeRatesApi } from '../../services/exchangeRatesApi';
import './ExchangeRates.css';

interface ExchangeRate {
  id: number;
  currency: string;
  buyingRate: number;
  sellingRate: number;
  effectiveBuyingRate?: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ExchangeRateStats {
  totalRates: number;
  currencies: number;
  lastUpdateDate: string;
}

interface ExchangeRatesResponse {
  data: ExchangeRate[];
  total: number;
  page: number;
  limit: number;
}

const ExchangeRatesList: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExchangeRateStats | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchExchangeRates = async (): Promise<void> => {
    try {
      setLoading(true);
      const [ratesData, statsData] = await Promise.all([
        exchangeRatesApi.getExchangeRates() as Promise<ExchangeRatesResponse>,
        exchangeRatesApi.getExchangeRateStats() as Promise<ExchangeRateStats>
      ]);
      
      setExchangeRates(ratesData.data || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Exchange rates fetch error:', err);
      setError('Kur bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRates = async (): Promise<void> => {
    try {
      setSyncing(true);
      await exchangeRatesApi.triggerSync();
      
      // 2 saniye bekleyip yeniden fetch et
      setTimeout(() => {
        fetchExchangeRates();
        setSyncing(false);
      }, 2000);
      
    } catch (err) {
      console.error('Sync error:', err);
      setError('TCMB senkronizasyonu başarısız');
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number): string => {
    return parseFloat(amount.toString()).toFixed(4);
  };

  const getCurrencyIcon = (currency: string): string => {
    const icons: Record<string, string> = {
      'USD': '💵',
      'EUR': '💶',
      'GBP': '💷',
      'TRY': '💰'
    };
    return icons[currency] || '💱';
  };

  if (loading) {
    return (
      <div className="exchange-rates-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Kur bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exchange-rates-container">
      <div className="exchange-rates-header">
        <h2>🏦 Döviz Kurları</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleSyncRates}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <div className="spinner-small"></div>
                TCMB Senkronizasyonu...
              </>
            ) : (
              <>
                🔄 TCMB'den Güncelle
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {stats && (
        <div className="exchange-stats">
          <div className="stat-card">
            <h4>📊 İstatistikler</h4>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Toplam Kayıt:</span>
                <span className="stat-value">{stats.totalRates}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Para Birimi:</span>
                <span className="stat-value">{stats.currencies}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Son Güncelleme:</span>
                <span className="stat-value">{formatDate(stats.lastUpdateDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="exchange-rates-content">
        {exchangeRates.length === 0 ? (
          <div className="no-data">
            <p>📈 Henüz kur bilgisi bulunmuyor</p>
            <button 
              className="btn btn-primary"
              onClick={handleSyncRates}
              disabled={syncing}
            >
              TCMB'den İlk Kurları Çek
            </button>
          </div>
        ) : (
          <div className="exchange-rates-grid">
            {exchangeRates.map((rate) => (
              <div key={rate.id} className="exchange-rate-card">
                <div className="currency-header">
                  <span className="currency-icon">{getCurrencyIcon(rate.currency)}</span>
                  <span className="currency-code">{rate.currency}</span>
                </div>
                
                <div className="rates-info">
                  <div className="rate-item">
                    <span className="rate-label">Alış:</span>
                    <span className="rate-value">{formatCurrency(rate.buyingRate)} ₺</span>
                  </div>
                  <div className="rate-item">
                    <span className="rate-label">Satış:</span>
                    <span className="rate-value">{formatCurrency(rate.sellingRate)} ₺</span>
                  </div>
                  {rate.effectiveBuyingRate && (
                    <div className="rate-item">
                      <span className="rate-label">Efektif Alış:</span>
                      <span className="rate-value">{formatCurrency(rate.effectiveBuyingRate)} ₺</span>
                    </div>
                  )}
                </div>
                
                <div className="rate-footer">
                  <small>📅 {formatDate(rate.date)}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeRatesList; 