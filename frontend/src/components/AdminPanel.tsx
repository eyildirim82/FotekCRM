import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, message, Tag, Avatar, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import authService from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  users: {
    total: number;
    admin: number;
    active: number;
    inactive: number;
  };
  entities: {
    companies: number;
    contacts: number;
    products: number;
  };
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users`,
        { headers: getAuthHeaders() }
      );
      setUsers(response.data.users || []);
      message.success('Kullanıcılar yüklendi');
    } catch (error: any) {
      console.error('Kullanıcı yükleme hatası:', error);
      if (error.response?.status === 403) {
        message.error('Bu işlem için admin yetkisi gerekli');
      } else if (error.response?.status === 401) {
        message.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
      } else {
        message.error('Kullanıcılar yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/stats`,
        { headers: getAuthHeaders() }
      );
      setStats(response.data);
    } catch (error: any) {
      console.error('İstatistik yükleme hatası:', error);
      if (error.response?.status !== 403) {
        message.error('Sistem istatistikleri yüklenemedi');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users/${userId}`,
        { headers: getAuthHeaders() }
      );
      message.success('Kullanıcı silindi');
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Kullanıcı silme hatası:', error);
      message.error('Kullanıcı silinemedi');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return '#ff4d4f';
      case 'manager':
        return '#faad14';
      case 'user':
      default:
        return '#52c41a';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'ADMİN';
      case 'manager':
        return 'MANAGER';
      case 'user':
      default:
        return 'USER';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Kullanıcı',
      dataIndex: 'firstName',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: '#1890ff' }}
            icon={<UserOutlined />}
          >
            {record.firstName[0]}{record.lastName[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => message.info('Düzenleme özelliği yakında eklenecek')}
            />
          </Tooltip>
          <Popconfirm
            title="Kullanıcıyı silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>🛠️ Admin Paneli</h2>
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => message.info('Kullanıcı ekleme özelliği yakında eklenecek')}
            >
              Yeni Kullanıcı
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                loadUsers();
                loadStats();
              }}
              loading={loading}
            >
              Yenile
            </Button>
          </Space>
        </div>
      </Card>

      {/* Sistem İstatistikleri */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card size="small" title="👥 Kullanıcılar">
            <div>
              <p><strong>Toplam:</strong> {stats.users.total}</p>
              <p><strong>Admin:</strong> {stats.users.admin}</p>
              <p><strong>Aktif:</strong> {stats.users.active}</p>
              <p><strong>Pasif:</strong> {stats.users.inactive}</p>
            </div>
          </Card>
          <Card size="small" title="🏢 Şirketler">
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {stats.entities.companies}
            </div>
          </Card>
          <Card size="small" title="👥 Kişiler">
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {stats.entities.contacts}
            </div>
          </Card>
          <Card size="small" title="📦 Ürünler">
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {stats.entities.products}
            </div>
          </Card>
        </div>
      )}

      {/* Kullanıcı Tablosu */}
      <Card title="Kullanıcı Yönetimi">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Toplam ${total} kullanıcı`,
          }}
        />
      </Card>
    </div>
  );
};

export default AdminPanel;
