import { defineConfig } from '@playwright/test';
// Remove the direct import since we'll reference the built module by path
// import { FailureRateMonitor, type FailureRateMonitorOptions } from './src/failure-rate-monitor';

// Type-only import for configuration typing
import type { FailureRateMonitorOptions } from './src/failure-rate-monitor';

// Example configuration using environment variables
const failureRateConfig: FailureRateMonitorOptions = {
  maxFailureRate: Number(process.env.MAX_FAILURE_RATE || '0.1'),
  minTestsBeforeEvaluation: Number(process.env.MIN_TESTS_BEFORE_EVALUATION || '10'),
  failureRateCheckInterval: Number(process.env.FAILURE_RATE_CHECK_INTERVAL || '5'),
  enabled: process.env.ENABLE_FAILURE_RATE_MONITOR !== 'false',
};

export default defineConfig({
  // Test configuration
  testDir: './tests',
  timeout: 30000,
  retries: 2,

  // Reporter configuration
  reporter: [
    // Standard reporters - these will now generate reports even if execution is terminated early
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    
    // Failure rate monitor - reference the built module by path
    ['./dist/index.js', failureRateConfig],
  ],

  use: {
    // Global test options
    actionTimeout: 10000,
    navigationTimeout: 10000,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
});

// Alternative: Direct configuration without environment variables
export const directConfig = defineConfig({
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['./dist/index.js', {
      maxFailureRate: 0.6,           // 60% failure rate threshold
      minTestsBeforeEvaluation: 15,  // Wait for 15 tests before checking
      failureRateCheckInterval: 3,   // Check every 3 tests
      enabled: true,                 // Enable monitoring
    }],
  ],
  // ... rest of config
}); 