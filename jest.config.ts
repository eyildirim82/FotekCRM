import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'Frontend Tests',
      testMatch: ['<rootDir>/frontend/src/**/*.test.tsx'],
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/frontend/src/$1'
      },
      collectCoverageFrom: [
        'frontend/src/**/*.{ts,tsx}',
        '!frontend/src/**/*.d.ts',
        '!frontend/src/main.tsx',
        '!frontend/src/vite-env.d.ts'
      ]
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
    }
  ],
  collectCoverageFrom: [
    'frontend/src/**/*.{ts,tsx}',
    'backend/src/**/*.{ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};

export default config; 