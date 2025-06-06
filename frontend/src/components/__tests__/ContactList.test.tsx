import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from 'antd';
import ContactList from '../ContactList';
import contactService, { Contact, ContactType, ContactStatus } from '../../services/contactService';

// Mock the contact service
jest.mock('../../services/contactService');
const mockContactService = contactService as jest.Mocked<typeof contactService>;

// Mock the child components
jest.mock('../ContactForm', () => {
  return function MockContactForm({ onSuccess, onCancel }: any) {
    return (
      <div data-testid="contact-form">
        <button onClick={onSuccess}>Save Contact</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../ContactDetail', () => {
  return function MockContactDetail({ contact, onEdit }: any) {
    return (
      <div data-testid="contact-detail">
        <span>{contact.fullName}</span>
        <button onClick={onEdit}>Edit</button>
      </div>
    );
  };
});

const mockContact: Contact = {
  id: '1',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  email: 'ahmet@test.com',
  phone: '+90 212 123 45 67',
  mobile: '+90 532 123 45 67',
  jobTitle: 'İK Müdürü',
  department: 'İnsan Kaynakları',
  contactType: ContactType.MANAGER,
  status: ContactStatus.ACTIVE,
  isPrimary: true,
  isActive: true,
  linkedInUrl: 'https://linkedin.com/in/ahmet',
  skype: 'ahmet.test',
  address: 'İstanbul, Türkiye',
  birthDate: '1985-01-15',
  notes: 'Test contact',
  companyId: 'company-1',
  createdById: 'user-1',
  createdAt: '2025-01-05T10:00:00Z',
  updatedAt: '2025-01-05T10:00:00Z',
  company: {
    id: 'company-1',
    name: 'Test Şirketi',
    status: 'active'
  },
  createdBy: {
    id: 'user-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com'
  },
  fullName: 'Ahmet Yılmaz',
  displayName: 'Ahmet Yılmaz (İK Müdürü)'
};

const mockContactListResponse = {
  success: true,
  message: 'Success',
  data: {
    contacts: [mockContact],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      pages: 1
    }
  }
};

const mockStatsResponse = {
  success: true,
  message: 'Success',
  data: {
    total: 10,
    employees: 6,
    managers: 3,
    decisionMakers: 1,
    active: 9,
    inactive: 1
  }
};

const renderContactListWithApp = () => {
  return render(
    <App>
      <ContactList />
    </App>
  );
};

describe('ContactList Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockContactService.getContacts.mockResolvedValue(mockContactListResponse);
    mockContactService.getContactStats.mockResolvedValue(mockStatsResponse);
    mockContactService.deleteContact.mockResolvedValue({
      success: true,
      message: 'Kişi başarıyla silindi'
    });
  });

  describe('Initial Render', () => {
    it('should render contact list with statistics', async () => {
      renderContactListWithApp();

      // Check if statistics cards are rendered
      await waitFor(() => {
        expect(screen.getByText('Toplam Kişi')).toBeInTheDocument();
        expect(screen.getByText('Çalışanlar')).toBeInTheDocument();
        expect(screen.getByText('Yöneticiler')).toBeInTheDocument();
        expect(screen.getByText('Karar Vericiler')).toBeInTheDocument();
        expect(screen.getByText('Aktif')).toBeInTheDocument();
        expect(screen.getByText('Pasif')).toBeInTheDocument();
      });

      // Check if the main title is rendered
      expect(screen.getByText('Kişi Listesi')).toBeInTheDocument();
      
      // Check if action buttons are rendered
      expect(screen.getByText('Yeni Kişi')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yenile/i })).toBeInTheDocument();
    });

    it('should load contacts and statistics on mount', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: undefined,
          contactType: undefined,
          status: undefined,
          companyId: undefined
        });
        expect(mockContactService.getContactStats).toHaveBeenCalledWith();
      });
    });

    it('should display contact data in table', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('İK Müdürü - İnsan Kaynakları')).toBeInTheDocument();
        expect(screen.getByText('Test Şirketi')).toBeInTheDocument();
      });

      // Check if contact links are clickable
      const emailLink = screen.getByRole('link', { name: 'ahmet@test.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:ahmet@test.com');

      const phoneLink = screen.getByRole('link', { name: '+90 212 123 45 67' });
      expect(phoneLink).toHaveAttribute('href', 'tel:+90 212 123 45 67');
    });
  });

  describe('Search and Filtering', () => {
    it('should handle search input', async () => {
      renderContactListWithApp();

      const searchInput = screen.getByPlaceholderText('Ad, soyad, email, telefon ile ara...');
      
      fireEvent.change(searchInput, { target: { value: 'Ahmet' } });
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: 'Ahmet',
          contactType: undefined,
          status: undefined,
          companyId: undefined
        });
      });
    });

    it('should handle contact type filter', async () => {
      renderContactListWithApp();

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Kişi Listesi')).toBeInTheDocument();
      });

      // Find and interact with contact type select
      const contactTypeSelect = screen.getByRole('combobox', { name: /kişi tipi/i });
      fireEvent.mouseDown(contactTypeSelect);
      
      // Wait for dropdown options to appear and select one
      await waitFor(() => {
        const managerOption = screen.getByText('Yönetici');
        fireEvent.click(managerOption);
      });

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: '',
          contactType: ContactType.MANAGER,
          status: '',
          companyId: ''
        });
      });
    });

    it('should handle status filter', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Kişi Listesi')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox', { name: /durum filtresi/i });
      fireEvent.mouseDown(statusSelect);
      
      await waitFor(() => {
        const activeOption = screen.getByText('Aktif');
        fireEvent.click(activeOption);
      });

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: '',
          contactType: '',
          status: ContactStatus.ACTIVE,
          companyId: ''
        });
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create contact modal', async () => {
      renderContactListWithApp();

      const newContactButton = screen.getByText('Yeni Kişi');
      fireEvent.click(newContactButton);

      await waitFor(() => {
        expect(screen.getByText('Yeni Kişi')).toBeInTheDocument();
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });
    });

    it('should open edit contact modal', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /düzenle/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Kişi Düzenle')).toBeInTheDocument();
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });
    });

    it('should open contact detail modal', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      });

      const detailButton = screen.getByRole('button', { name: /detay/i });
      fireEvent.click(detailButton);

      await waitFor(() => {
        expect(screen.getByText('Kişi Detayları')).toBeInTheDocument();
        expect(screen.getByTestId('contact-detail')).toBeInTheDocument();
      });
    });

    it('should handle contact deletion with confirmation', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /sil/i });
      fireEvent.click(deleteButton);

      // Confirm deletion in popconfirm
      await waitFor(() => {
        const confirmButton = screen.getByText('Evet');
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockContactService.deleteContact).toHaveBeenCalledWith('1');
      });
    });

    it('should refresh data when refresh button is clicked', async () => {
      renderContactListWithApp();

      const refreshButton = screen.getByRole('button', { name: /yenile/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
        expect(mockContactService.getContactStats).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Statistics Display', () => {
    it('should display correct statistics values', async () => {
      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Total
        expect(screen.getByText('6')).toBeInTheDocument();  // Employees
        expect(screen.getByText('3')).toBeInTheDocument();  // Managers
        expect(screen.getByText('1')).toBeInTheDocument();  // Decision Makers
        expect(screen.getByText('9')).toBeInTheDocument();  // Active
        expect(screen.getByText('1')).toBeInTheDocument();  // Inactive
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should close modal when form is cancelled', async () => {
      renderContactListWithApp();

      // Open create modal
      const newContactButton = screen.getByText('Yeni Kişi');
      fireEvent.click(newContactButton);

      await waitFor(() => {
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });

      // Cancel form
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument();
      });
    });

    it('should refresh data after successful form submission', async () => {
      renderContactListWithApp();

      // Open create modal
      const newContactButton = screen.getByText('Yeni Kişi');
      fireEvent.click(newContactButton);

      await waitFor(() => {
        expect(screen.getByTestId('contact-form')).toBeInTheDocument();
      });

      // Submit form
      const saveButton = screen.getByText('Save Contact');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockContactService.getContacts).toHaveBeenCalledTimes(2); // Initial + refresh
        expect(mockContactService.getContactStats).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockContactService.getContacts.mockRejectedValue(new Error('API Error'));

      renderContactListWithApp();

      // The component should still render without crashing
      expect(screen.getByText('Kişi Listesi')).toBeInTheDocument();
    });

    it('should handle delete errors', async () => {
      mockContactService.deleteContact.mockRejectedValue(new Error('Delete failed'));

      renderContactListWithApp();

      await waitFor(() => {
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /sil/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        const confirmButton = screen.getByText('Evet');
        fireEvent.click(confirmButton);
      });

      // Error should be handled without crashing
      await waitFor(() => {
        expect(mockContactService.deleteContact).toHaveBeenCalled();
      });
    });
  });
}); 