import axios from 'axios';
import contactService, { ContactType, ContactStatus, CreateContactRequest } from '../contactService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as Location;

describe('ContactService', () => {
  const mockContact = {
    id: '1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet@test.com',
    phone: '+90 212 123 45 67',
    contactType: ContactType.MANAGER,
    status: ContactStatus.ACTIVE,
    companyId: 'company-1',
    isPrimary: true,
    isActive: true,
    fullName: 'Ahmet Yılmaz',
    displayName: 'Ahmet Yılmaz (İK Müdürü)',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  };

  const mockApiResponse = {
    data: {
      success: true,
      message: 'Success',
      data: mockContact
    }
  };

  const mockListResponse = {
    data: {
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
    }
  };

  const mockStatsResponse = {
    data: {
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
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token');
  });

  describe('Authentication', () => {
    it('should add JWT token to requests', async () => {
      mockedAxios.get.mockResolvedValue(mockListResponse);

      await contactService.getContacts();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/contacts'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token'
          })
        })
      );
    });

    it('should redirect to login on 401 error', async () => {
      const error = {
        response: { status: 401 }
      };
      mockedAxios.get.mockRejectedValue(error);

      try {
        await contactService.getContacts();
      } catch (e) {
        // Expected to throw
      }

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('fotek_auth_token');
      expect(window.location.href).toBe('/login');
    });
  });

  describe('getContacts', () => {
    it('should fetch contacts with default parameters', async () => {
      mockedAxios.get.mockResolvedValue(mockListResponse);

      const result = await contactService.getContacts();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/contacts?');
      expect(result).toEqual(mockListResponse.data);
    });

    it('should fetch contacts with search and filters', async () => {
      mockedAxios.get.mockResolvedValue(mockListResponse);

      const params = {
        page: 2,
        limit: 20,
        search: 'Ahmet',
        contactType: ContactType.MANAGER,
        status: ContactStatus.ACTIVE,
        companyId: 'company-1'
      };

      await contactService.getContacts(params);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/contacts?page=2&limit=20&search=Ahmet&contactType=manager&status=active&companyId=company-1'
      );
    });

    it('should handle API errors with custom message', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow('Server error');
    });

    it('should handle network errors with default message', async () => {
      const error = {
        code: 'ECONNREFUSED'
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow(
        'Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.'
      );
    });
  });

  describe('getContact', () => {
    it('should fetch single contact by id', async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await contactService.getContact('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/contacts/1');
      expect(result).toEqual(mockApiResponse.data);
    });

    it('should handle 404 error with custom message', async () => {
      const error = {
        response: { status: 404 }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContact('999')).rejects.toThrow('Aradığınız kişi bulunamadı.');
    });
  });

  describe('createContact', () => {
    const createData: CreateContactRequest = {
      firstName: 'Yeni',
      lastName: 'Kişi',
      email: 'yeni@test.com',
      contactType: ContactType.EMPLOYEE,
      status: ContactStatus.ACTIVE,
      companyId: 'company-1'
    };

    it('should create new contact', async () => {
      mockedAxios.post.mockResolvedValue(mockApiResponse);

      const result = await contactService.createContact(createData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/contacts', createData);
      expect(result).toEqual(mockApiResponse.data);
    });

    it('should handle validation errors', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Email alanı zorunludur' }
        }
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(contactService.createContact(createData)).rejects.toThrow('Email alanı zorunludur');
    });
  });

  describe('updateContact', () => {
    const updateData = {
      firstName: 'Güncel',
      jobTitle: 'Yeni Pozisyon'
    };

    it('should update contact', async () => {
      mockedAxios.patch.mockResolvedValue(mockApiResponse);

      const result = await contactService.updateContact('1', updateData);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/api/contacts/1', updateData);
      expect(result).toEqual(mockApiResponse.data);
    });

    it('should handle update errors', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Bu işlem için yetkiniz bulunmuyor' }
        }
      };
      mockedAxios.patch.mockRejectedValue(error);

      await expect(contactService.updateContact('1', updateData)).rejects.toThrow(
        'Bu işlem için yetkiniz bulunmuyor'
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete contact', async () => {
      const deleteResponse = {
        data: {
          success: true,
          message: 'Kişi başarıyla silindi'
        }
      };
      mockedAxios.delete.mockResolvedValue(deleteResponse);

      const result = await contactService.deleteContact('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/contacts/1');
      expect(result).toEqual(deleteResponse.data);
    });
  });

  describe('getContactStats', () => {
    it('should fetch general statistics', async () => {
      mockedAxios.get.mockResolvedValue(mockStatsResponse);

      const result = await contactService.getContactStats();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/contacts/stats');
      expect(result).toEqual(mockStatsResponse.data);
    });

    it('should fetch company-specific statistics', async () => {
      mockedAxios.get.mockResolvedValue(mockStatsResponse);

      await contactService.getContactStats('company-1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/contacts/stats?companyId=company-1');
    });
  });

  describe('getContactsByCompany', () => {
    it('should fetch contacts by company', async () => {
      const companyContactsResponse = {
        data: {
          data: [mockContact]
        }
      };
      mockedAxios.get.mockResolvedValue(companyContactsResponse);

      const result = await contactService.getContactsByCompany('company-1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/contacts/company/company-1');
      expect(result).toEqual([mockContact]);
    });

    it('should return empty array when no data', async () => {
      const emptyResponse = {
        data: {
          data: null
        }
      };
      mockedAxios.get.mockResolvedValue(emptyResponse);

      const result = await contactService.getContactsByCompany('company-1');

      expect(result).toEqual([]);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct contact type text', () => {
      expect(contactService.getContactTypeText(ContactType.EMPLOYEE)).toBe('Çalışan');
      expect(contactService.getContactTypeText(ContactType.MANAGER)).toBe('Yönetici');
      expect(contactService.getContactTypeText(ContactType.DECISION_MAKER)).toBe('Karar Verici');
      expect(contactService.getContactTypeText(ContactType.TECHNICAL)).toBe('Teknik');
      expect(contactService.getContactTypeText(ContactType.FINANCIAL)).toBe('Mali İşler');
      expect(contactService.getContactTypeText(ContactType.OTHER)).toBe('Diğer');
    });

    it('should return correct contact status text', () => {
      expect(contactService.getContactStatusText(ContactStatus.ACTIVE)).toBe('Aktif');
      expect(contactService.getContactStatusText(ContactStatus.INACTIVE)).toBe('Pasif');
      expect(contactService.getContactStatusText(ContactStatus.LEFT_COMPANY)).toBe('Ayrıldı');
      expect(contactService.getContactStatusText(ContactStatus.NO_CONTACT)).toBe('İletişim Yok');
    });

    it('should return correct contact type colors', () => {
      expect(contactService.getContactTypeColor(ContactType.EMPLOYEE)).toBe('blue');
      expect(contactService.getContactTypeColor(ContactType.MANAGER)).toBe('purple');
      expect(contactService.getContactTypeColor(ContactType.DECISION_MAKER)).toBe('red');
      expect(contactService.getContactTypeColor(ContactType.TECHNICAL)).toBe('cyan');
      expect(contactService.getContactTypeColor(ContactType.FINANCIAL)).toBe('orange');
      expect(contactService.getContactTypeColor(ContactType.OTHER)).toBe('default');
    });

    it('should return correct contact status colors', () => {
      expect(contactService.getContactStatusColor(ContactStatus.ACTIVE)).toBe('green');
      expect(contactService.getContactStatusColor(ContactStatus.INACTIVE)).toBe('default');
      expect(contactService.getContactStatusColor(ContactStatus.LEFT_COMPANY)).toBe('red');
      expect(contactService.getContactStatusColor(ContactStatus.NO_CONTACT)).toBe('orange');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 errors correctly', async () => {
      const error = {
        response: { status: 401 }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow('Yetkiniz bulunmuyor. Lütfen tekrar giriş yapın.');
    });

    it('should handle 403 errors correctly', async () => {
      const error = {
        response: { status: 403 }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow('Bu işlem için yetkiniz bulunmuyor.');
    });

    it('should handle 404 errors correctly', async () => {
      const error = {
        response: { status: 404 }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow('Aradığınız kişi bulunamadı.');
    });

    it('should use default error message for unknown errors', async () => {
      const error = {
        response: { status: 500 }
      };
      mockedAxios.get.mockRejectedValue(error);

      await expect(contactService.getContacts()).rejects.toThrow('Kişiler listelenirken hata oluştu');
    });
  });
}); 