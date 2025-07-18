import { test, expect } from '@playwright/test';

test.describe('Failing Tests', () => {
  test('intentional failing test 1', async () => {
    expect(1 + 1).toBe(3); // This will fail
  });

  test('intentional failing test 2', async () => {
    expect('hello').toBe('world'); // This will fail
  });

  test('intentional failing test 3', async () => {
    expect(false).toBeTruthy(); // This will fail
  });

  test('intentional failing test 4', async () => {
    const array = [1, 2, 3];
    expect(array).toHaveLength(5); // This will fail
  });

  test('intentional failing test 5', async () => {
    throw new Error('Intentional error for testing'); // This will fail
  });

  test('intentional failing test 6', async () => {
    expect('test').toBe('failure'); // This will fail
  });

  test('intentional failing test 7', async () => {
    expect(42).toBe(24); // This will fail
  });

  test('intentional failing test 8', async () => {
    expect(null).toBeTruthy(); // This will fail
  });
}); 