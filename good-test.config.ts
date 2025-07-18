import { defineConfig } from '@playwright/test';
import type { FailureRateMonitorOptions } from './src/failure-rate-monitor';

// Configuration with higher threshold to test successful completion
const failureRateConfig: FailureRateMonitorOptions = {
  maxFailureRate: 0.8,              // 80% failure rate threshold (high - should not trigger)
  minTestsBeforeEvaluation: 3,      // Start checking after just 3 tests
  failureRateCheckInterval: 2,      // Check every 2 tests
  enabled: true,
};

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  retries: 1,

  reporter: [
    ['list'],
    ['./dist/index.js', failureRateConfig],
  ],

  use: {
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...require('@playwright/test').devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],
}); 