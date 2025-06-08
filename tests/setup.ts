import axios from 'axios';
import 'jest';

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
  if (process.env.SKIP_SERVICE_CHECK === 'true') {
    console.log('⚠️  SKIP_SERVICE_CHECK is enabled. Skipping service availability check.');
    return;
  }

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

  console.warn('⚠️  Services are not ready after maximum retries');
}

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3000';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// Setup global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
afterEach(async () => {
  // Add any global cleanup here if needed
  jest.clearAllMocks();
}); 
