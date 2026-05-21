import { describe, expect, test } from 'bun:test';
import { tokenize, SemanticMemory } from './SemanticMemory';
import { Memory } from './MemorySystem';

describe('SemanticMemory Tokenizer', () => {
  test('should tokenize text correctly and convert to lowercase', () => {
    const text = 'Hello world! This is a test of PAI integration.';
    const tokens = tokenize(text);
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).toContain('test');
    expect(tokens).toContain('pai');
    expect(tokens).toContain('integration');
  });

  test('should filter out common stop words', () => {
    const text = 'adalah salah satu contoh dengan beberapa kata yang ada';
    const tokens = tokenize(text);
    expect(tokens).not.toContain('adalah');
    expect(tokens).not.toContain('dengan');
    expect(tokens).not.toContain('yang');
    expect(tokens).not.toContain('ada');
    expect(tokens).toContain('salah');
    expect(tokens).toContain('satu');
    expect(tokens).toContain('contoh');
    expect(tokens).toContain('kata');
  });
});

describe('SemanticMemory Search (TF-IDF fallback)', () => {
  test('should rank matching documents correctly', async () => {
    const memoryDir = '/tmp/pai-test-memory';
    const semanticMemory = new SemanticMemory(memoryDir);

    const memories: Memory[] = [
      {
        path: 'KNOWLEDGE/Ideas/telos.md',
        type: 'KNOWLEDGE',
        content: 'TELOS is your personal operating system. It tracks your mission, beliefs, and core goals.',
        metadata: { created: new Date(), updated: new Date() }
      },
      {
        path: 'KNOWLEDGE/Ideas/algorithm.md',
        type: 'KNOWLEDGE',
        content: 'The Algorithm v6.3.0 is a seven-phase loop for solving complex coding tasks: observe, think, plan, build, execute, verify, learn.',
        metadata: { created: new Date(), updated: new Date() }
      },
      {
        path: 'KNOWLEDGE/Ideas/random.md',
        type: 'KNOWLEDGE',
        content: 'Today I learned how to cook a delicious carbonara pasta using eggs, pecorino romano, and guanciale.',
        metadata: { created: new Date(), updated: new Date() }
      }
    ];

    // Search for "operating system" -> should match telos.md
    const resultsOS = await semanticMemory.search('operating system', memories, 2);
    expect(resultsOS.length).toBeGreaterThan(0);
    expect(resultsOS[0].path).toBe('KNOWLEDGE/Ideas/telos.md');

    // Search for "solving complex coding" -> should match algorithm.md
    const resultsAlgo = await semanticMemory.search('solving complex coding', memories, 2);
    expect(resultsAlgo.length).toBeGreaterThan(0);
    expect(resultsAlgo[0].path).toBe('KNOWLEDGE/Ideas/algorithm.md');

    // Search for "pasta cooking recipe" -> should match random.md
    const resultsPasta = await semanticMemory.search('pasta cooking recipe', memories, 2);
    expect(resultsPasta.length).toBeGreaterThan(0);
    expect(resultsPasta[0].path).toBe('KNOWLEDGE/Ideas/random.md');
  });
});
