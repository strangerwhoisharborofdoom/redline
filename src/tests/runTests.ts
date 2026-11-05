import { runAllRedlineTests } from '../utils/testSuite';

// Mock localStorage for node runner if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] || null,
    length: store.size,
  } as any;
}

console.log('Running Redline Diagnostic Test Suite...');
const results = runAllRedlineTests();

let allPassed = true;
results.forEach((r) => {
  const icon = r.passed ? '✓' : '✗';
  console.log(`[${icon}] ${r.category.padEnd(16)} | ${r.name} (${r.durationMs}ms)`);
  if (!r.passed) {
    allPassed = false;
    console.error(`    Error: ${r.message}`);
  }
});

const total = results.length;
const passed = results.filter((r) => r.passed).length;
console.log(`\nSummary: ${passed}/${total} tests passed.`);

if (!allPassed) {
  process.exit(1);
} else {
  console.log('All tests passed cleanly!');
}
