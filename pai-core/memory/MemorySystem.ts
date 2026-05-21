/**
 * Memory System - Platform Agnostic
 * 
 * Provides a universal memory system that works across all platforms.
 * Memory is stored as files in a structured directory hierarchy.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { SemanticMemory, SemanticSearchResult } from './SemanticMemory';

export { SemanticSearchResult };

export type MemoryType =
  | 'WORK'           // Active work and ISAs
  | 'KNOWLEDGE'      // Typed graph: People, Companies, Ideas, Research
  | 'LEARNING'       // Meta-patterns and learnings
  | 'RELATIONSHIP'   // DA-Principal relationship notes
  | 'OBSERVABILITY'  // Tool calls, hooks, satisfaction signals
  | 'REFERENCE'      // Reference materials
  | 'RESEARCH'       // Research notes
  | 'WISDOM'         // Accumulated wisdom
  | 'VERIFICATION'   // Verification results
  | 'SKILLS';        // Skill-specific memory

export interface Memory {
  path: string;
  type: MemoryType;
  content: string;
  metadata: MemoryMetadata;
}

export interface MemoryMetadata {
  created: Date;
  updated: Date;
  tags?: string[];
  category?: string;
  [key: string]: any;
}

export class MemorySystem {
  private rootPath: string;
  private semanticMemory: SemanticMemory;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.semanticMemory = new SemanticMemory(rootPath);
  }

  /**
   * Initialize memory directory structure
   */
  async initialize(): Promise<void> {
    const directories = [
      'WORK',
      'KNOWLEDGE/People',
      'KNOWLEDGE/Companies',
      'KNOWLEDGE/Ideas',
      'KNOWLEDGE/Research',
      'KNOWLEDGE/Blogs',
      'LEARNING',
      'RELATIONSHIP',
      'OBSERVABILITY',
      'REFERENCE',
      'RESEARCH',
      'WISDOM',
      'VERIFICATION',
      'SKILLS',
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.rootPath, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Read memory from path
   */
  async read(memoryPath: string): Promise<Memory | null> {
    try {
      const fullPath = path.join(this.rootPath, memoryPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      
      const type = this.getMemoryType(memoryPath);
      
      return {
        path: memoryPath,
        type,
        content,
        metadata: {
          created: stats.birthtime,
          updated: stats.mtime,
        },
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Write memory to path
   */
  async write(memory: Memory): Promise<void> {
    const fullPath = path.join(this.rootPath, memory.path);
    const dir = path.dirname(fullPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, memory.content, 'utf-8');
  }

  /**
   * Query memories by type
   */
  async query(type: MemoryType, options?: {
    tags?: string[];
    limit?: number;
  }): Promise<Memory[]> {
    const typePath = path.join(this.rootPath, type);
    const memories: Memory[] = [];

    try {
      const files = await this.getAllFiles(typePath);
      
      for (const file of files) {
        const relativePath = path.relative(this.rootPath, file);
        const memory = await this.read(relativePath);
        
        if (memory) {
          // Filter by tags if specified
          if (options?.tags && memory.metadata.tags) {
            const hasTag = options.tags.some(tag => 
              memory.metadata.tags?.includes(tag)
            );
            if (!hasTag) continue;
          }
          
          memories.push(memory);
        }
        
        if (options?.limit && memories.length >= options.limit) {
          break;
        }
      }
    } catch (error) {
      // Directory doesn't exist or other error
    }

    return memories;
  }

  /**
   * Delete memory
   */
  async delete(memoryPath: string): Promise<void> {
    const fullPath = path.join(this.rootPath, memoryPath);
    await fs.unlink(fullPath);
  }

  /**
   * List all memories of a type
   */
  async list(type: MemoryType): Promise<string[]> {
    const typePath = path.join(this.rootPath, type);
    const files = await this.getAllFiles(typePath);
    
    return files.map(file => path.relative(this.rootPath, file));
  }

  /**
   * Get memory type from path
   */
  private getMemoryType(memoryPath: string): MemoryType {
    const parts = memoryPath.split(path.sep);
    const type = parts[0] as MemoryType;
    
    return type;
  }

  /**
   * Recursively get all files in directory
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
    
    return files;
  }

  /**
   * Search memories semantically using Vector Search/TF-IDF
   */
  async searchSemantic(query: string, limit: number = 5, types?: MemoryType[]): Promise<SemanticSearchResult[]> {
    const typesToSearch = types || [
      'WORK', 'KNOWLEDGE', 'LEARNING', 'RELATIONSHIP', 'RESEARCH', 'WISDOM', 'REFERENCE'
    ];

    const allMemories: Memory[] = [];

    for (const type of typesToSearch) {
      const memories = await this.query(type);
      allMemories.push(...memories);
    }

    return this.semanticMemory.search(query, allMemories, limit);
  }
}
