import { describe, it, expect } from 'vitest';
import { countTokens } from '../../src/core/token-counter.js';

describe('countTokens', () => {
  it('estimates tokens for plain text', () => {
    const text = 'Hello world this is a test';
    const tokens = countTokens(text);
    // 6 words * 1.33 ≈ 8
    expect(tokens).toBe(8);
  });

  it('accounts for code block overhead', () => {
    const text = 'Some text\n\n```\nconst x = 42;\nconsole.log(x);\n```';
    const withCode = countTokens(text);

    const plain = 'Some text const x = 42; console.log(x);';
    const withoutCode = countTokens(plain);

    // Code block version should have more tokens due to overhead
    expect(withCode).toBeGreaterThan(withoutCode);
  });

  it('returns 0 for empty text', () => {
    expect(countTokens('')).toBe(0);
  });

  it('handles text with multiple spaces', () => {
    const tokens = countTokens('word1   word2   word3');
    // 3 words * 1.33 ≈ 4
    expect(tokens).toBe(4);
  });
});
