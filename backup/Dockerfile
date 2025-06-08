FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    software-properties-common \
    cron \
    p7zip-full \
    && rm -rf /var/lib/apt/lists/*

# Install Microsoft SQL Server tools
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y mssql-tools18 unixodbc-dev \
    && echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc

# Install Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash

# Install Azure Storage Explorer
RUN apt-get install -y azure-storage-explorer

# Install Azure Storage Emulator
RUN apt-get install -y azure-storage-emulator

# Install Azure Storage Emulator
RUN apt-get install -y azure-storage-emulator

# Install Azure Storage Emulator
RUN apt-get install -y azure-storage-emulator

# Install Azure Storage Emulator
RUN apt-get install -y azure-storage-emulator

# Install Azure Storage Emulator
RUN apt-get install -y azure-storage-emulator
    
# Set PATH for sqlcmd
ENV PATH="$PATH:/opt/mssql-tools18/bin"

# Create backup directory
RUN mkdir -p /backup /scripts

# Copy backup scripts
COPY backup-script.sh /scripts/backup-script.sh
COPY cleanup-script.sh /scripts/cleanup-script.sh
COPY test-backup.sh /scripts/test-backup.sh

# Make scripts executable
RUN chmod +x /scripts/backup-script.sh /scripts/cleanup-script.sh /scripts/test-backup.sh

# Setup cron job - daily at 02:00 AM
RUN echo "0 2 * * * /scripts/backup-script.sh >> /var/log/backup.log 2>&1" > /etc/cron.d/backup-cron
RUN echo "0 3 * * 0 /scripts/cleanup-script.sh >> /var/log/cleanup.log 2>&1" > /etc/cron.d/cleanup-cron

# Give execution rights on the cron jobs
RUN chmod 0644 /etc/cron.d/backup-cron /etc/cron.d/cleanup-cron

# Apply cron jobs
RUN crontab /etc/cron.d/backup-cron
RUN crontab /etc/cron.d/cleanup-cron

# Create log files
RUN touch /var/log/backup.log /var/log/cleanup.log

# Start cron and keep container running
CMD ["sh", "-c", "cron && tail -f /var/log/backup.log /var/log/cleanup.log"] 