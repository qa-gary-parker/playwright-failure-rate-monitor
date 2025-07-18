import type { FullConfig, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export interface FailureRateMonitorOptions {
  /**
   * Maximum failure rate threshold (0-1). If exceeded, test execution will be terminated.
   * Default: 0.1 (10%)
   */
  maxFailureRate?: number;

  /**
   * Minimum number of tests to run before evaluating failure rate.
   * Default: 10
   */
  minTestsBeforeEvaluation?: number;

  /**
   * How often to check failure rate (in number of completed tests).
   * Default: 5
   */
  failureRateCheckInterval?: number;

  /**
   * @deprecated Use failureRateCheckInterval instead. Kept for backward compatibility.
   * How often to check failure rate (in number of completed tests).
   * Default: 5
   */
  evaluationInterval?: number;
  /**
   * Whether to enable the failure rate monitoring.
   * Default: true
   */
  enabled?: boolean;
}

export class FailureRateMonitor implements Reporter {
  private config?: FullConfig;

  private options: Required<Omit<FailureRateMonitorOptions, 'evaluationInterval'>>;

  private completedTests = 0;

  private failedTests = 0;

  private shouldTerminate = false;

  private terminationReason?: string;

  // Fixed delay to allow report generation before process termination
  private readonly REPORT_GENERATION_DELAY_MS = 2000;

  constructor(options: FailureRateMonitorOptions = {}) {
    this.options = {
      maxFailureRate: options.maxFailureRate ?? 0.1,
      minTestsBeforeEvaluation: options.minTestsBeforeEvaluation ?? 10,
      // Support both failureRateCheckInterval (preferred) and evaluationInterval (backward compatibility)
      failureRateCheckInterval: options.failureRateCheckInterval ?? options.evaluationInterval ?? 5,
      enabled: options.enabled ?? true,
    };  }

  onBegin(config: FullConfig): void {
    this.config = config;
    if (this.options.enabled) {
      console.log(
        `🔍 Failure rate monitor enabled - will terminate if failure rate exceeds ${Math.round(this.options.maxFailureRate * 100)}% after ${this.options.minTestsBeforeEvaluation} tests`
      );
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.options.enabled || this.shouldTerminate) {
      return;
    }

    // Only count final results, ignore intermediate retries
    // The test is final if it passed, or if this is the last retry attempt
    const maxRetries = this.config?.projects.find((p) => p.name === test.parent.project()?.name)?.retries ?? 0;
    const isFinalResult = result.status === 'passed' || result.retry >= maxRetries;

    if (!isFinalResult) {
      console.log(`⏭️  Skipping retry ${result.retry + 1}/${maxRetries + 1} for test: ${test.title}`);
      return; // Skip counting this result as it's an intermediate retry
    }

    this.completedTests++;

    if (result.status === 'failed' || result.status === 'timedOut') {
      this.failedTests++;
      console.log(`❌ Test failed (final): ${test.title} (${this.failedTests}/${this.completedTests})`);
    } else {
      console.log(`✅ Test passed: ${test.title} (${this.failedTests}/${this.completedTests})`);
    }

    // Check failure rate at intervals
    if (
      this.completedTests >= this.options.minTestsBeforeEvaluation &&
      this.completedTests % this.options.failureRateCheckInterval === 0
    ) {
      this.evaluateFailureRate();
    }
  }

  private evaluateFailureRate(): void {
    const failureRate = this.failedTests / this.completedTests;
    const failurePercent = Math.round(failureRate * 100);

    console.log(`📊 Failure rate check: ${this.failedTests}/${this.completedTests} failed (${failurePercent}%)`);

    if (failureRate > this.options.maxFailureRate) {
      console.log(
        `🚨 CRITICAL: Failure rate ${failurePercent}% exceeds threshold ${Math.round(this.options.maxFailureRate * 100)}%`
      );
      console.log('💡 This suggests the environment may be down. Terminating test execution to save time.');
      console.log(`📋 Summary: ${this.failedTests} failed out of ${this.completedTests} completed tests`);

      this.shouldTerminate = true;
      this.terminationReason = `Failure rate ${failurePercent}% exceeded threshold ${Math.round(this.options.maxFailureRate * 100)}%`;
      
      // Force termination of the test process with configurable delay for report generation
      if (this.REPORT_GENERATION_DELAY_MS > 0) {
        console.log(`⏱️  Allowing ${this.REPORT_GENERATION_DELAY_MS}ms for report generation before terminating...`);
      } else {
        console.log('⏹️  Terminating test execution immediately...');
      }
      
      setTimeout(() => {
        console.log('🔴 Terminating test process now.');
        process.exit(1);
      }, this.REPORT_GENERATION_DELAY_MS);
    }
  }

  onEnd(result: any): Promise<{ status: 'failed' }> | void {
    if (!this.options.enabled || this.completedTests === 0) {
      return;
    }

    if (this.shouldTerminate && this.terminationReason) {
      const finalFailurePercent = Math.round((this.failedTests / this.completedTests) * 100);
      console.log(`🔴 Test execution terminated early: ${this.terminationReason}`);
      console.log(`📊 Final statistics: ${this.failedTests}/${this.completedTests} tests failed (${finalFailurePercent}%)`);
      console.log('📄 Test reports will still be generated from completed tests.');
      
      // Return failure status to indicate the run should be considered failed
      // The process will exit via the setTimeout in evaluateFailureRate
      return Promise.resolve({ status: 'failed' as const });
    }

    const finalFailurePercent = Math.round((this.failedTests / this.completedTests) * 100);
    console.log(
      `✅ Failure rate monitor: Final rate ${finalFailurePercent}% (${this.failedTests}/${this.completedTests}) - within acceptable limits`
    );
  }
}

// Export as default for Playwright reporter usage
export default FailureRateMonitor;

// Export a factory function for easier configuration
export function createFailureRateMonitor(options?: FailureRateMonitorOptions): FailureRateMonitor {
  return new FailureRateMonitor(options);
} 