import { defineConfig } from '@playwright/test';
import type { FailureRateMonitorOptions } from './src/failure-rate-monitor';

// Configuration specifically to test report generation
const failureRateConfig: FailureRateMonitorOptions = {
  maxFailureRate: 0.3,              // 30% threshold - should trigger early termination
  minTestsBeforeEvaluation: 4,      // Start checking after 4 tests
  failureRateCheckInterval: 2,      // Check every 2 tests
  enabled: true,
};

export default defineConfig({
  testDir: './tests',
  timeout: 10000,
  retries: 1,

  reporter: [
    ['list'],
    // Explicitly specify output paths for reports
    ['html', { 
      open: 'never',
      outputFolder: './playwright-report'
    }],
    ['json', { 
      outputFile: './test-results.json' 
    }],
    ['junit', { 
      outputFile: './test-results.xml' 
    }],
    // Our failure rate monitor
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