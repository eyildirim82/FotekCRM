const { DataSource } = require('typeorm');

async function testConnection() {
  const dataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'FotekCRM2025!',
    database: 'master',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  });

  try {
    console.log('Database bağlantısı test ediliyor...');

    await dataSource.initialize();
    console.log('✅ Database bağlantısı başarılı!');

    // Test user tablosu oluştur
    await dataSource.query(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'fotek_crm')
      BEGIN
        CREATE DATABASE fotek_crm;
      END
    `);

    console.log('✅ fotek_crm database oluşturuldu/kontrol edildi');

    await dataSource.destroy();
    console.log('✅ Database bağlantısı kapatıldı');
    
  } catch (error) {
    console.error('❌ Database bağlantı hatası:', error.message);
    process.exit(1);
  }
}

testConnection(); 
