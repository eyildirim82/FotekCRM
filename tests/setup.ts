import 'jest';
import { execSync } from 'child_process';

// Set default timeout for integration tests
jest.setTimeout(30000);

// Determine if dependent services are available
function servicesAreReady(): boolean {
  if (process.env.SKIP_SERVICE_CHECK === 'true') {
    console.log('⚠️  SKIP_SERVICE_CHECK is enabled. Skipping service availability check.');
    return true;
  }

  const healthUrl = process.env.API_URL || 'http://localhost:3000/api/health';
  try {
    execSync(`curl -sf ${healthUrl} > /dev/null`, { stdio: 'ignore', timeout: 5000 });
    console.log('✅ API service is ready');
    return true;
  } catch {
    console.warn('⚠️  API service not reachable. Integration tests will be skipped.');
    return false;
  }
}

const SERVICES_READY = servicesAreReady();
(global as any).__SERVICES_READY__ = SERVICES_READY;

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3000';

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting Integration Tests...');
  if (!SERVICES_READY) {
    console.log('⚠️  Skipping integration tests because services are not ready.');
  }
});

afterAll(() => {
  if (SERVICES_READY) {
    console.log('✅ Integration Tests Completed');
  }
});

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
