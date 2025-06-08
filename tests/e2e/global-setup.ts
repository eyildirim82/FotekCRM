import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Fotek CRM E2E Test Setup Starting...');
  
  // Wait for services to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Check if API is ready
    console.log('🔍 Checking API health...');
    const apiResponse = await page.goto('http://localhost:3000/api/health');
    if (!apiResponse?.ok()) {
      throw new Error('API health check failed');
    }
    console.log('✅ API is healthy');
    
    // Check if Frontend is ready
    console.log('🔍 Checking Frontend...');
    const frontendResponse = await page.goto('http://localhost:80');
    if (!frontendResponse?.ok()) {
      throw new Error('Frontend health check failed');
    }
    console.log('✅ Frontend is ready');
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    console.log('🎉 Fotek CRM E2E Test Setup Complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup; 