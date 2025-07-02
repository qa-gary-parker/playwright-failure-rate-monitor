# Playwright Failure Rate Monitor

A Playwright reporter that monitors test failure rates in real-time and terminates execution if the failure rate exceeds a configurable threshold. This helps prevent long test executions when the environment is down or experiencing issues.

## Features

- 🔍 **Real-time monitoring** - Tracks test failure rates as tests execute
- ⚡ **Smart termination** - Stops execution when failure rates exceed thresholds
- 🎯 **Accurate statistics** - Only counts final test results, ignores intermediate retry attempts
- ⚙️ **Highly configurable** - Customize thresholds, intervals, and minimum test counts
- 💾 **Resource efficient** - Prevents wasted compute resources on failing environments
- 📊 **Clear logging** - Provides detailed feedback about failure rates and decisions

## Installation

```bash
npm install playwright-failure-rate-monitor
```

## Usage

### Basic Usage

Add the reporter to your Playwright configuration:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['playwright-failure-rate-monitor', {
      maxFailureRate: 0.5,
      minTestsBeforeEvaluation: 10,
      failureRateCheckInterval: 5,
      enabled: true
    }]
  ],
  // ... other config
});
```

### Environment Variable Configuration

You can also control the monitor using environment variables:

```bash
# Enable/disable monitoring
ENABLE_FAILURE_RATE_MONITOR=true

# Set failure rate threshold (0.0-1.0)
MAX_FAILURE_RATE=0.5

# Minimum tests before evaluation starts
MIN_TESTS_BEFORE_EVALUATION=10

# How often to check (every N tests)
FAILURE_RATE_CHECK_INTERVAL=5

# Run your tests
npx playwright test
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxFailureRate` | `number` | `0.5` | Maximum failure rate (0.0-1.0) before termination |
| `minTestsBeforeEvaluation` | `number` | `10` | Minimum tests to run before evaluating failure rate |
| `failureRateCheckInterval` | `number` | `5` | How often to check failure rate (every N tests) |
| `enabled` | `boolean` | `true` | Whether to enable failure rate monitoring |

## Example Output

```
🔍 Failure rate monitor enabled - will terminate if failure rate exceeds 50% after 10 tests
⏭️  Skipping retry 1/3 for test: Login should work with valid credentials
❌ Test failed (final): Login should work with valid credentials (1/1)
✅ Test passed: Dashboard should load correctly (1/2)
📊 Failure rate check: 2/10 failed (20%)
📊 Failure rate check: 7/15 failed (47%)
🚨 CRITICAL: Failure rate 60% exceeds threshold 50%
💡 This suggests the environment may be down. Terminating test execution to save time.
📋 Summary: 9 failed out of 15 completed tests
```

## How It Works

1. **Monitoring**: The reporter listens to test completion events
2. **Retry Handling**: Only counts final test results, ignoring intermediate retry attempts
3. **Threshold Checking**: Evaluates failure rate at configurable intervals
4. **Smart Termination**: Stops execution if the failure rate exceeds the threshold
5. **Clear Feedback**: Provides detailed logging about decisions and statistics

## Benefits

- **Time Savings**: Typically saves 50-70% of execution time when environments are down
- **Resource Efficiency**: Prevents wasted compute resources on failing environments
- **Better Debugging**: Clear indication when environment is the problem vs test issues
- **Cost Reduction**: Saves CI/CD pipeline time and costs

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues or have feature requests, please [create an issue](https://github.com/qa-gary-parker/playwright-failure-rate-monitor/issues) on GitHub.
