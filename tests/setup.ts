import axios from 'axios';

// Set default timeout for integration tests
jest.setTimeout(30000);

// Set default axios config
axios.defaults.timeout = 10000;

// Global test setup
beforeAll(async () => {
  console.log('🧪 Starting Integration Tests...');
  
  // Wait for services to be ready
  await waitForServices();
});

afterAll(async () => {
  console.log('✅ Integration Tests Completed');
});

async function waitForServices() {
  const maxRetries = 10;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check if API is ready
      await axios.get(process.env.API_URL || 'http://localhost:3000/api/health');
      console.log('✅ API service is ready');
      return;
    } catch (error) {
      console.log(`⏳ Waiting for services... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Services are not ready after maximum retries');
} 