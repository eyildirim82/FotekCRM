import axios from 'axios';
import { ContactType, ContactStatus } from '../backend/src/entities/contact.entity';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api`;

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123!'
};

const testCompany = {
  name: 'Test Şirketi Integration',
  taxNumber: '1234567890',
  industry: 'technology',
  status: 'active'
};

const testContact = {
  firstName: 'Integration',
  lastName: 'Test User',
  email: 'integration@test.com',
  phone: '+90 212 555 0123',
  mobile: '+90 532 555 0123',
  jobTitle: 'Test Engineer',
  department: 'QA',
  contactType: ContactType.EMPLOYEE,
  status: ContactStatus.ACTIVE,
  isPrimary: false,
  isActive: true,
  linkedInUrl: 'https://linkedin.com/in/integrationtest',
  address: 'Test Address, Istanbul, Turkey',
  notes: 'Integration test contact'
};

describe('Contact Management Integration Tests', () => {
  let authToken: string;
  let companyId: string;
  let contactId: string;

  beforeAll(async () => {
    try {
      // Register test user
      await axios.post(`${API_URL}/auth/register`, {
        ...testUser,
        firstName: 'Test',
        lastName: 'User'
      });
    } catch (error) {
      // User might already exist
    }

    // Login to get auth token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    authToken = loginResponse.data.access_token;

    // Create test company
    const companyResponse = await axios.post(`${API_URL}/companies`, testCompany, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    companyId = companyResponse.data.data.id;
  });

  afterAll(async () => {
    try {
      // Cleanup: Delete test contact
      if (contactId) {
        await axios.delete(`${API_URL}/contacts/${contactId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }

      // Cleanup: Delete test company
      if (companyId) {
        await axios.delete(`${API_URL}/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
    } catch (error: any) {
      console.log('Cleanup error:', error.message);
    }
  });

  describe('Contact CRUD Operations', () => {
    it('should create a new contact', async () => {
      const contactData = {
        ...testContact,
        companyId
      };

      const response = await axios.post(`${API_URL}/contacts`, contactData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Kişi başarıyla oluşturuldu');
      expect(response.data.data).toMatchObject({
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone,
        contactType: contactData.contactType,
        status: contactData.status,
        companyId: companyId
      });

      contactId = response.data.data.id;
    });

    it('should fetch contacts list with pagination', async () => {
      const response = await axios.get(`${API_URL}/contacts?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveProperty('contacts');
      expect(response.data.data).toHaveProperty('pagination');
      expect(Array.isArray(response.data.data.contacts)).toBe(true);
      expect(response.data.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        pages: expect.any(Number)
      });
    });

    it('should search contacts by name', async () => {
      const response = await axios.get(`${API_URL}/contacts?search=Integration`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const foundContact = response.data.data.contacts.find(
        (contact: any) => contact.id === contactId
      );
      expect(foundContact).toBeDefined();
      expect(foundContact.firstName).toBe('Integration');
    });

    it('should filter contacts by type', async () => {
      const response = await axios.get(`${API_URL}/contacts?contactType=${ContactType.EMPLOYEE}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const contacts = response.data.data.contacts;
      contacts.forEach((contact: any) => {
        expect(contact.contactType).toBe(ContactType.EMPLOYEE);
      });
    });

    it('should filter contacts by status', async () => {
      const response = await axios.get(`${API_URL}/contacts?status=${ContactStatus.ACTIVE}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const contacts = response.data.data.contacts;
      contacts.forEach((contact: any) => {
        expect(contact.status).toBe(ContactStatus.ACTIVE);
      });
    });

    it('should get single contact by id', async () => {
      const response = await axios.get(`${API_URL}/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toMatchObject({
        id: contactId,
        firstName: 'Integration',
        lastName: 'Test User',
        email: 'integration@test.com',
        contactType: ContactType.EMPLOYEE,
        status: ContactStatus.ACTIVE
      });
      
      // Check relations
      expect(response.data.data.company).toBeDefined();
      expect(response.data.data.company.id).toBe(companyId);
      expect(response.data.data.createdBy).toBeDefined();
    });

    it('should update contact information', async () => {
      const updateData = {
        firstName: 'Updated Integration',
        jobTitle: 'Senior Test Engineer',
        contactType: ContactType.MANAGER,
        notes: 'Updated integration test contact'
      };

      const response = await axios.patch(`${API_URL}/contacts/${contactId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Kişi başarıyla güncellendi');
      expect(response.data.data).toMatchObject(updateData);
    });

    it('should get contacts by company', async () => {
      const response = await axios.get(`${API_URL}/contacts/company/${companyId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      
      const ourContact = response.data.data.find((contact: any) => contact.id === contactId);
      expect(ourContact).toBeDefined();
    });

    it('should soft delete contact', async () => {
      const response = await axios.delete(`${API_URL}/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.message).toBe('Kişi başarıyla silindi');

      // Verify contact is no longer in active list
      const listResponse = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const deletedContact = listResponse.data.data.contacts.find(
        (contact: any) => contact.id === contactId
      );
      expect(deletedContact).toBeUndefined();
    });
  });

  describe('Contact Statistics', () => {
    beforeAll(async () => {
      // Create some test contacts for statistics
      const contactData = {
        ...testContact,
        companyId
      };

      // Create employee contact
      await axios.post(`${API_URL}/contacts`, {
        ...contactData,
        firstName: 'Stats Employee',
        email: 'stats.employee@test.com',
        contactType: ContactType.EMPLOYEE
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Create manager contact
      await axios.post(`${API_URL}/contacts`, {
        ...contactData,
        firstName: 'Stats Manager',
        email: 'stats.manager@test.com',
        contactType: ContactType.MANAGER
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Create decision maker contact
      await axios.post(`${API_URL}/contacts`, {
        ...contactData,
        firstName: 'Stats Decision Maker',
        email: 'stats.decision@test.com',
        contactType: ContactType.DECISION_MAKER
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    });

    it('should get general contact statistics', async () => {
      const response = await axios.get(`${API_URL}/contacts/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toMatchObject({
        total: expect.any(Number),
        employees: expect.any(Number),
        managers: expect.any(Number),
        decisionMakers: expect.any(Number),
        active: expect.any(Number),
        inactive: expect.any(Number)
      });

      // Check that totals make sense
      const stats = response.data.data;
      expect(stats.total).toBeGreaterThanOrEqual(3); // At least our 3 test contacts
      expect(stats.active + stats.inactive).toBe(stats.total);
    });

    it('should get company-specific contact statistics', async () => {
      const response = await axios.get(`${API_URL}/contacts/stats?companyId=${companyId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      
      const stats = response.data.data;
      expect(stats.total).toBeGreaterThanOrEqual(3); // Our test contacts
      expect(stats.employees).toBeGreaterThanOrEqual(1);
      expect(stats.managers).toBeGreaterThanOrEqual(1);
      expect(stats.decisionMakers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all contact endpoints', async () => {
      const endpoints = [
        { method: 'get', url: `${API_URL}/contacts` },
        { method: 'post', url: `${API_URL}/contacts`, data: testContact },
        { method: 'get', url: `${API_URL}/contacts/stats` },
        { method: 'get', url: `${API_URL}/contacts/company/${companyId}` }
      ];

      for (const endpoint of endpoints) {
        try {
          await (axios as any)[endpoint.method](endpoint.url, endpoint.data);
          fail(`Expected 401 for ${endpoint.method.toUpperCase()} ${endpoint.url}`);
        } catch (error: any) {
          expect(error.response.status).toBe(401);
        }
      }
    });

    it('should reject invalid tokens', async () => {
      try {
        await axios.get(`${API_URL}/contacts`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        fail('Expected 401 for invalid token');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate required fields for contact creation', async () => {
      const invalidContact = {
        email: 'invalid-email', // Invalid email
        companyId: 'non-existent-company' // Non-existent company
      };

      try {
        await axios.post(`${API_URL}/contacts`, invalidContact, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        fail('Expected validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle non-existent contact gracefully', async () => {
      try {
        await axios.get(`${API_URL}/contacts/non-existent-id`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        fail('Expected 404 for non-existent contact');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Kişi bulunamadı');
      }
    });

    it('should prevent duplicate email addresses', async () => {
      const contactData = {
        ...testContact,
        companyId,
        email: 'duplicate@test.com'
      };

      // Create first contact
      await axios.post(`${API_URL}/contacts`, contactData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Try to create duplicate
      try {
        await axios.post(`${API_URL}/contacts`, contactData, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        fail('Expected conflict error for duplicate email');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });
  });

  describe('Performance and Limits', () => {
    it('should handle pagination limits correctly', async () => {
      const response = await axios.get(`${API_URL}/contacts?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      expect(response.data.data.contacts.length).toBeLessThanOrEqual(5);
      expect(response.data.data.pagination.limit).toBe(5);
    });

    it('should handle large search queries', async () => {
      const longSearchTerm = 'a'.repeat(1000);
      
      const response = await axios.get(`${API_URL}/contacts?search=${longSearchTerm}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      // Should not crash, even with long search term
    });
  });
}); 