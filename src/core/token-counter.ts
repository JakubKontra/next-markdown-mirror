/**
 * Heuristic token count estimation.
 * Approximates OpenAI/Claude tokenization: ~1.33 tokens per word + code block overhead.
 */
export function countTokens(text: string): number {
  // Count words (split on whitespace)
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count code blocks (they tend to tokenize less efficiently)
  const codeBlockMatches = text.match(/```[\s\S]*?```/g);
  const codeBlockOverhead = codeBlockMatches
    ? codeBlockMatches.reduce((sum, block) => {
        // Code blocks have ~50% more tokens due to special characters
        const blockWords = block.split(/\s+/).length;
        return sum + Math.ceil(blockWords * 0.3);
      }, 0)
    : 0;

  return Math.ceil(wordCount * 1.33 + codeBlockOverhead);
}
