FROM node:18-alpine

# Curl'ü health check için yükle
RUN apk add --no-cache curl

# Çalışma dizini oluştur
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodunu kopyala
COPY . .

# Uygulamayı build et
RUN npm run build

# Port aç
EXPOSE 3000

# Health check ekle
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Uygulamayı çalıştır
CMD ["npm", "run", "start:prod"] 