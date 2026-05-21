import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { Memory, MemoryType } from './MemorySystem';

// Stop words for both English and Indonesian to filter out noise
const STOP_WORDS = new Set([
  // English
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt',
  'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself',
  'lets',
  'me', 'more', 'most', 'mustnt', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt',
  'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves',
  // Indonesian
  'ada', 'adalah', 'adanya', 'adapun', 'akan', 'akibat', 'akibatnya', 'aku', 'anda', 'antara', 'apa', 'apabila', 'apakah', 'apalagi', 'arti', 'artinya',
  'bagai', 'bagaikan', 'bagaimana', 'bagi', 'bahkan', 'bahwa', 'baik', 'banyak', 'baru', 'beberapa', 'belum', 'belaka', 'benar', 'berada', 'berbagai', 'beri', 'besar', 'bisa', 'boleh', 'bukan',
  'cara', 'cukup',
  'dalam', 'dan', 'dapat', 'dari', 'daripada', 'dekat', 'demi', 'demikian', 'dengan', 'depan', 'di', 'dia', 'dirinya', 'disini', 'disitu', 'dua',
  'hal', 'hampir', 'hanya', 'harus', 'hingga',
  'ia', 'ingin', 'ini', 'itu',
  'jika', 'juga',
  'karena', 'kami', 'kamu', 'kan', 'kapan', 'ke', 'kecil', 'kembali', 'kemudian', 'kepada', 'kepadanya', 'kita', 'kurang',
  'lagi', 'lain', 'lalu', 'langsung', 'lebih',
  'maka', 'mampu', 'manakala', 'masih', 'masing', 'mau', 'melainkan', 'melalui', 'memang', 'mengapa', 'mengenai', 'menjadi', 'menurut', 'mereka', 'merupakan', 'minta', 'misal', 'misalnya', 'mulai', 'mungkin',
  'namun', 'nanti',
  'oleh',
  'pada', 'padahal', 'para', 'pasti', 'pula',
  'saja', 'saling', 'sama', 'sambil', 'sampai', 'sana', 'sangat', 'saya', 'sebab', 'sebagai', 'sebelum', 'sebelumnya', 'sebenarnya', 'secara', 'sedang', 'sedikit', 'sehingga', 'sejak', 'sekitar', 'selain', 'selalu', 'selama', 'seluruh', 'sementara', 'semua', 'semula', 'sendiri', 'seorang', 'sepanjang', 'seperti', 'serta', 'sesuai', 'sesuatu', 'sesudah', 'setelah', 'setiap', 'siapa', 'sudah',
  'tanpa', 'tapi', 'telah', 'tentang', 'tentu', 'terhadap', 'terjadi', 'tersebut', 'terus', 'tetapi', 'tiap', 'tidak',
  'untuk',
  'yaitu', 'yang'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u017F]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

export interface EmbeddingCacheEntry {
  hash: string;
  embedding: number[];
}

export interface SemanticSearchResult extends Memory {
  score: number;
}

export class SemanticMemory {
  private cachePath: string;
  private cache: Record<string, EmbeddingCacheEntry> = {};
  private cacheLoaded: boolean = false;

  constructor(memoryRootPath: string) {
    this.cachePath = path.join(memoryRootPath, 'STATE', 'embeddings_cache.json');
  }

  /**
   * Load cache from disk
   */
  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) return;
    try {
      const content = await fs.readFile(this.cachePath, 'utf-8');
      this.cache = JSON.parse(content);
    } catch {
      this.cache = {};
    }
    this.cacheLoaded = true;
  }

  /**
   * Save cache to disk
   */
  private async saveCache(): Promise<void> {
    try {
      const dir = path.dirname(this.cachePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.cachePath, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (error) {
      console.warn('Failed to save embedding cache:', error);
    }
  }

  /**
   * Compute hash of text content
   */
  private computeHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Get embedding vector for a piece of text (Ollama or OpenAI if configured, otherwise returns empty array)
   */
  private async getEmbedding(text: string, pathKey: string): Promise<number[] | null> {
    const hash = this.computeHash(text);
    await this.loadCache();

    // Check cache
    if (this.cache[pathKey] && this.cache[pathKey].hash === hash) {
      return this.cache[pathKey].embedding;
    }

    const provider = (process.env.PAI_EMBEDDING_PROVIDER || '').toLowerCase();
    let embedding: number[] | null = null;

    if (provider === 'ollama') {
      embedding = await this.getOllamaEmbedding(text);
    } else if (provider === 'openai' || process.env.OPENAI_API_KEY) {
      embedding = await this.getOpenAIEmbedding(text);
    }

    if (embedding) {
      this.cache[pathKey] = { hash, embedding };
      await this.saveCache();
    }

    return embedding;
  }

  private async getOllamaEmbedding(text: string): Promise<number[] | null> {
    const url = process.env.PAI_OLLAMA_URL || 'http://127.0.0.1:11434';
    const model = process.env.PAI_OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

    try {
      const response = await fetch(`${url}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: text }),
      });

      if (!response.ok) return null;
      const data = await response.json() as { embedding: number[] };
      return data.embedding;
    } catch {
      return null;
    }
  }

  private async getOpenAIEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const model = process.env.PAI_OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, input: text }),
      });

      if (!response.ok) return null;
      const data = await response.json() as { data: { embedding: number[] }[] };
      return data.data[0]?.embedding || null;
    } catch {
      return null;
    }
  }

  /**
   * Local TF-IDF search implementation
   */
  private searchLocalTFIDF(query: string, memories: Memory[], limit: number): SemanticSearchResult[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return memories.slice(0, limit).map(m => ({ ...m, score: 0 }));
    }

    const docTokens = memories.map(m => tokenize(m.content));
    
    // Calculate Document Frequency (DF) for each term in vocab
    const df: Record<string, number> = {};
    for (const tokens of docTokens) {
      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        df[t] = (df[t] || 0) + 1;
      }
    }

    const N = memories.length;
    // Calculate Inverse Document Frequency (IDF) for vocabulary
    const idf: Record<string, number> = {};
    for (const term in df) {
      idf[term] = Math.log(1 + (N / (1 + df[term])));
    }

    // Helper to compute TF-IDF vector for a set of tokens
    const getTFIDFVector = (tokens: string[]): Record<string, number> => {
      const counts: Record<string, number> = {};
      for (const t of tokens) {
        counts[t] = (counts[t] || 0) + 1;
      }
      
      const vec: Record<string, number> = {};
      const total = tokens.length;
      for (const t in counts) {
        const tf = counts[t] / total;
        vec[t] = tf * (idf[t] || 0);
      }
      return vec;
    };

    const queryVec = getTFIDFVector(queryTokens);

    // Compute Cosine Similarity between query vector and each document vector
    const results: SemanticSearchResult[] = memories.map((mem, idx) => {
      const tokens = docTokens[idx];
      if (tokens.length === 0) return { ...mem, score: 0 };

      const docVec = getTFIDFVector(tokens);

      // Dot product
      let dotProduct = 0;
      for (const term in queryVec) {
        if (docVec[term]) {
          dotProduct += queryVec[term] * docVec[term];
        }
      }

      // Norm query
      let normQuery = 0;
      for (const term in queryVec) {
        normQuery += queryVec[term] * queryVec[term];
      }
      normQuery = Math.sqrt(normQuery);

      // Norm doc
      let normDoc = 0;
      for (const term in docVec) {
        normDoc += docVec[term] * docVec[term];
      }
      normDoc = Math.sqrt(normDoc);

      const score = normQuery && normDoc ? dotProduct / (normQuery * normDoc) : 0;

      return {
        ...mem,
        score,
      };
    });

    // Sort by score descending and return limited results
    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Main entry point to perform semantic/vector search on memories
   */
  async search(query: string, memories: Memory[], limit: number = 5): Promise<SemanticSearchResult[]> {
    if (memories.length === 0) return [];

    // Try computing embedding for the query
    const queryEmbedding = await this.getEmbedding(query, '__query__');

    if (queryEmbedding) {
      // Neural embedding search (Cosine Similarity on high-dim vectors)
      const results: SemanticSearchResult[] = [];

      for (const mem of memories) {
        const memEmbedding = await this.getEmbedding(mem.content, mem.path);
        if (memEmbedding && memEmbedding.length === queryEmbedding.length) {
          // Compute cosine similarity
          let dotProduct = 0;
          let normA = 0;
          let normB = 0;

          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * memEmbedding[i];
            normA += queryEmbedding[i] * queryEmbedding[i];
            normB += memEmbedding[i] * memEmbedding[i];
          }

          const score = (normA && normB) ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
          results.push({ ...mem, score });
        } else {
          results.push({ ...mem, score: 0 });
        }
      }

      return results
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Fallback: Local TF-IDF search
    return this.searchLocalTFIDF(query, memories, limit);
  }
}
