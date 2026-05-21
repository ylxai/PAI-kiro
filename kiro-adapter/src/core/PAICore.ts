/**
 * PAI Core - Platform Agnostic
 * 
 * This is the heart of PAI that works across all platforms.
 * It orchestrates the Algorithm, Memory, Skills, and TELOS systems.
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { PlatformAdapter, HookEvent, ContextInjection } from '../adapters/PlatformAdapter';

export interface PAICoreConfig {
  adapter: PlatformAdapter;
  enableVoice?: boolean;
  enableDashboard?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export interface TelosData {
  mission?: string;
  goals?: string[];
  beliefs?: string[];
  wisdom?: string[];
  challenges?: string[];
  books?: string[];
  mentalModels?: string[];
  narratives?: string[];
  problems?: string[];
  strategies?: string[];
}

export class PAICore {
  private adapter: PlatformAdapter;
  private config: PAICoreConfig;
  private initialized: boolean = false;

  constructor(config: PAICoreConfig) {
    this.adapter = config.adapter;
    this.config = config;
  }

  /**
   * Initialize PAI Core
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  PAI Core already initialized');
      return;
    }

    console.log(`\n🚀 Initializing PAI Core on ${this.adapter.config.name}...\n`);

    // Step 1: Initialize platform adapter
    await this.adapter.initialize();

    // Step 2: Load TELOS
    await this.loadTelos();

    // Step 3: Initialize Memory system
    await this.initializeMemory();

    // Step 4: Register core hooks
    await this.registerCoreHooks();

    // Step 5: Load skills
    await this.loadSkills();

    // Step 6: Load Algorithm
    await this.loadAlgorithm();

    this.initialized = true;
    console.log('\n✅ PAI Core initialized successfully!\n');
  }

  /**
   * Load TELOS (user's goals, mission, beliefs)
   */
  private async loadTelos(): Promise<void> {
    console.log('📖 Loading TELOS...');

    const telosPath = path.join(
      this.adapter.getConfigDir(),
      'USER',
      'TELOS'
    );

    try {
      // Check if TELOS directory exists
      await fs.access(telosPath);

      // Read all TELOS files
      const telos = await this.readTelosFiles(telosPath);

      // Inject as global context
      const telosContext = this.formatTelosForContext(telos);
      
      await this.adapter.injectContext({
        type: 'global',
        content: telosContext,
        priority: 'high',
        mode: 'always',
      });

      console.log('✅ TELOS loaded');
    } catch (error) {
      console.log('⚠️  TELOS not found - will need to run /interview');
    }
  }

  private async readTelosFiles(telosPath: string): Promise<TelosData> {
    const telos: TelosData = {};

    try {
      const files = await fs.readdir(telosPath);

      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(telosPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Parse based on filename
          const key = file.replace('.md', '').toLowerCase();
          
          if (key === 'mission') {
            telos.mission = content;
          } else if (key === 'goals') {
            telos.goals = this.parseListFromMarkdown(content);
          } else if (key === 'beliefs') {
            telos.beliefs = this.parseListFromMarkdown(content);
          } else if (key === 'wisdom') {
            telos.wisdom = this.parseListFromMarkdown(content);
          } else if (key === 'challenges') {
            telos.challenges = this.parseListFromMarkdown(content);
          } else if (key === 'books') {
            telos.books = this.parseListFromMarkdown(content);
          } else if (key === 'models') {
            telos.mentalModels = this.parseListFromMarkdown(content);
          } else if (key === 'narratives') {
            telos.narratives = this.parseListFromMarkdown(content);
          } else if (key === 'problems') {
            telos.problems = this.parseListFromMarkdown(content);
          } else if (key === 'strategies') {
            telos.strategies = this.parseListFromMarkdown(content);
          }
        }
      }
    } catch (error) {
      console.warn('Could not read TELOS files:', error);
    }

    return telos;
  }

  private parseListFromMarkdown(content: string): string[] {
    const lines = content.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        items.push(match[1]);
      }
    }

    return items;
  }

  private formatTelosForContext(telos: TelosData): string {
    let context = '# TELOS - Your Life Operating System\n\n';

    if (telos.mission) {
      context += `## Mission\n\n${telos.mission}\n\n`;
    }

    const renderList = (title: string, list?: string[]) => {
      if (list && list.length > 0) {
        let section = `## ${title}\n\n`;
        for (const item of list) {
          section += `- ${item}\n`;
        }
        section += '\n';
        return section;
      }
      return '';
    };

    context += renderList('Goals', telos.goals);
    context += renderList('Beliefs', telos.beliefs);
    context += renderList('Problems', telos.problems);
    context += renderList('Strategies', telos.strategies);
    context += renderList('Challenges', telos.challenges);
    context += renderList('Wisdom', telos.wisdom);
    context += renderList('Mental Models', telos.mentalModels);
    context += renderList('Narratives', telos.narratives);
    context += renderList('Favorite Books', telos.books);

    return context;
  }

  /**
   * Initialize Memory system
   */
  private async initializeMemory(): Promise<void> {
    console.log('🧠 Initializing Memory system...');

    const memoryDir = this.adapter.getMemoryDir();

    // Create memory structure
    const memoryDirs = [
      'WORK',
      'KNOWLEDGE/People',
      'KNOWLEDGE/Companies',
      'KNOWLEDGE/Ideas',
      'KNOWLEDGE/Research',
      'KNOWLEDGE/Blogs',
      'LEARNING',
      'RELATIONSHIP',
      'OBSERVABILITY',
      'STATE',
    ];

    for (const dir of memoryDirs) {
      const fullPath = path.join(memoryDir, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }

    console.log('✅ Memory system initialized');
  }

  /**
   * Register core PAI hooks
   */
  private async registerCoreHooks(): Promise<void> {
    console.log('🪝 Registering core hooks...');

    const capabilities = this.adapter.getCapabilities();

    // Only register hooks that the platform supports
    const hooks: HookEvent[] = [];

    if (capabilities.hookTypes.includes('SessionStart')) {
      hooks.push({
        type: 'SessionStart',
        name: 'PAI-Init',
        description: 'Initialize PAI context on agent spawn',
        handler: async (context) => {
          console.log('🚀 Initializing PAI context...');
        },
      });
    }

    if (capabilities.hookTypes.includes('UserPromptSubmit')) {
      hooks.push({
        type: 'UserPromptSubmit',
        name: 'PromptProcessing',
        description: 'Mode classifier for Algorithm (MINIMAL/NATIVE/ALGORITHM)',
        handler: async (context) => {
          // Placeholder - would implement mode classification
          console.log('🔍 Classifying prompt mode...');
        },
      });
    }

    if (capabilities.hookTypes.includes('PostToolUse')) {
      hooks.push({
        type: 'PostToolUse',
        name: 'ToolActivityTracker',
        description: 'Track tool usage for observability',
        handler: async (context) => {
          // Log tool activity to MEMORY/OBSERVABILITY
          const logPath = path.join(
            this.adapter.getMemoryDir(),
            'OBSERVABILITY',
            'tool-activity.jsonl'
          );
          
          const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            tool: context.data?.tool,
            params: context.data?.params,
          }) + '\n';

          await fs.appendFile(logPath, logEntry);
        },
      });
    }

    if (capabilities.hookTypes.includes('Stop')) {
      hooks.push({
        type: 'Stop',
        name: 'WorkCompletionLearning',
        description: 'Capture learnings when agent stops',
        handler: async (context) => {
          console.log('📝 Capturing learnings...');
        },
      });
    }

    // Register all hooks
    for (const hook of hooks) {
      await this.adapter.registerHook(hook);
    }

    console.log(`✅ Registered ${hooks.length} core hooks`);
  }

  /**
   * Load skills
   */
  private async loadSkills(): Promise<void> {
    console.log('🎯 Loading skills...');

    const skillsDir = this.adapter.getSkillsDir();

    try {
      const skills = await fs.readdir(skillsDir);
      console.log(`✅ Found ${skills.length} skills`);
    } catch (error) {
      console.log('⚠️  No skills found - will need to migrate from PAI');
    }
  }

  /**
   * Load Algorithm
   */
  private async loadAlgorithm(): Promise<void> {
    console.log('⚙️  Loading Algorithm v6.3.0...');

    // Inject Algorithm context
    const algorithmContext = `# The Algorithm v6.3.0

## Seven-Phase Loop

1. **OBSERVE** - Understand current state
2. **THINK** - Analyze and reason
3. **PLAN** - Design approach
4. **BUILD** - Implement solution
5. **EXECUTE** - Run and test
6. **VERIFY** - Validate results
7. **LEARN** - Capture insights

## Execution Modes

- **MINIMAL** - Quick tasks (<90s)
- **NATIVE** - Standard tasks (90s-5min)
- **ALGORITHM** - Complex tasks (>5min, uses full 7-phase loop)

## Effort Tiers

- **E1** - Trivial (<90s)
- **E2** - Simple (90s-5min)
- **E3** - Moderate (5-15min)
- **E4** - Complex (15-60min)
- **E5** - Major (>60min)
`;

    await this.adapter.injectContext({
      type: 'global',
      content: algorithmContext,
      priority: 'high',
      mode: 'always',
    });

    console.log('✅ Algorithm loaded');
  }

  /**
   * Execute the Algorithm on a task
   */
  async executeAlgorithm(task: string, tier: string = 'E2'): Promise<void> {
    console.log(`\n🔄 Executing Algorithm (${tier})...\n`);

    const phases = [
      'OBSERVE',
      'THINK',
      'PLAN',
      'BUILD',
      'EXECUTE',
      'VERIFY',
      'LEARN',
    ];

    for (const phase of phases) {
      console.log(`📍 Phase: ${phase}`);
      // Actual implementation would execute each phase
      await this.sleep(500);
    }

    console.log('\n✅ Algorithm execution complete\n');
  }

  /**
   * Get platform adapter
   */
  getAdapter(): PlatformAdapter {
    return this.adapter;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up PAI Core...');
    await this.adapter.cleanup();
    this.initialized = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
