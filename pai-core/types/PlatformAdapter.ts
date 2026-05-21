/**
 * PAI Core - Platform Adapter Interface
 * 
 * This interface defines the contract that all platform adapters must implement
 * to support PAI on different AI coding platforms.
 */

export interface PlatformConfig {
  name: string;
  version: string;
  platform: 'claude-code' | 'kiro-cli' | 'opencode' | string;
  paths: {
    root: string;           // Platform root directory (e.g., ~/.claude, ~/.kiro)
    config: string;         // Configuration directory
    context: string;        // Context/steering directory
    skills: string;         // Skills directory
    hooks: string;          // Hooks directory
    memory: string;         // Memory directory
    user: string;           // User data directory
  };
}

export interface Context {
  systemPrompt?: string;
  userContext?: string;
  telos?: TelosData;
  identity?: IdentityData;
  [key: string]: any;
}

export interface TelosData {
  mission?: string;
  goals?: string[];
  beliefs?: string[];
  wisdom?: string[];
  challenges?: string[];
  books?: string[];
  narratives?: string[];
  strategies?: string[];
  problems?: string[];
}

export interface IdentityData {
  principal?: {
    name: string;
    role?: string;
    preferences?: Record<string, any>;
  };
  da?: {
    name: string;
    personality?: string;
    voice?: string;
  };
}

export interface Hook {
  name: string;
  event: HookEvent;
  handler: HookHandler;
  options?: HookOptions;
}

export type HookEvent =
  | 'SessionStart'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact'
  | 'SessionEnd';

export type HookHandler = (context: HookContext) => Promise<HookResult>;

export interface HookContext {
  event: HookEvent;
  data: any;
  platform: string;
  timestamp: Date;
  sessionId?: string;
}

export interface HookResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface HookOptions {
  timeout?: number;
  enabled?: boolean;
  toolMatcher?: string;
  [key: string]: any;
}

export interface Skill {
  name: string;
  description: string;
  workflows: Workflow[];
  metadata?: SkillMetadata;
}

export interface Workflow {
  name: string;
  description: string;
  execute: (params: any) => Promise<any>;
}

export interface SkillMetadata {
  category?: string;
  tags?: string[];
  version?: string;
  author?: string;
}

export interface Memory {
  path: string;
  type: MemoryType;
  content: any;
  metadata?: MemoryMetadata;
}

export type MemoryType =
  | 'WORK'
  | 'KNOWLEDGE'
  | 'LEARNING'
  | 'RELATIONSHIP'
  | 'OBSERVABILITY'
  | 'REFERENCE'
  | 'RESEARCH';

export interface MemoryMetadata {
  created: Date;
  updated: Date;
  tags?: string[];
  [key: string]: any;
}

/**
 * Platform Adapter Interface
 * 
 * All platform adapters must implement this interface to provide
 * a consistent API for PAI core functionality.
 */
export interface PlatformAdapter {
  /**
   * Platform configuration
   */
  readonly config: PlatformConfig;

  /**
   * Initialize the adapter
   */
  initialize(): Promise<void>;

  /**
   * Context Management
   */
  loadContext(): Promise<Context>;
  saveContext(context: Context): Promise<void>;
  injectContext(content: string, options?: any): Promise<void>;

  /**
   * Hook System
   */
  registerHook(hook: Hook): Promise<void>;
  unregisterHook(hookName: string): Promise<void>;
  listHooks(): Promise<Hook[]>;
  executeHook(event: HookEvent, data: any): Promise<HookResult>;

  /**
   * Skills System
   */
  loadSkills(): Promise<Skill[]>;
  executeSkill(skillName: string, workflow: string, params: any): Promise<any>;
  registerSkill(skill: Skill): Promise<void>;

  /**
   * Memory System
   */
  readMemory(path: string): Promise<Memory | null>;
  writeMemory(memory: Memory): Promise<void>;
  queryMemory(type: MemoryType, query?: any): Promise<Memory[]>;

  /**
   * Configuration
   */
  getConfig(): PlatformConfig;
  updateConfig(updates: Partial<PlatformConfig>): Promise<void>;

  /**
   * Platform Detection
   */
  isAvailable(): Promise<boolean>;
  getCapabilities(): PlatformCapabilities;

  /**
   * Cleanup
   */
  cleanup(): Promise<void>;
}

export interface PlatformCapabilities {
  supportsHooks: boolean;
  supportsSkills: boolean;
  supportsMemory: boolean;
  supportsContext: boolean;
  supportsMCP: boolean;
  supportsCustomAgents: boolean;
  hookTypes: HookEvent[];
  [key: string]: any;
}

/**
 * Base Platform Adapter
 * 
 * Provides common functionality that can be shared across adapters
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract config: PlatformConfig;

  async initialize(): Promise<void> {
    console.log(`Initializing ${this.config.platform} adapter...`);
  }

  abstract loadContext(): Promise<Context>;
  abstract saveContext(context: Context): Promise<void>;
  abstract injectContext(content: string, options?: any): Promise<void>;
  
  abstract registerHook(hook: Hook): Promise<void>;
  abstract unregisterHook(hookName: string): Promise<void>;
  abstract listHooks(): Promise<Hook[]>;
  abstract executeHook(event: HookEvent, data: any): Promise<HookResult>;
  
  abstract loadSkills(): Promise<Skill[]>;
  abstract executeSkill(skillName: string, workflow: string, params: any): Promise<any>;
  abstract registerSkill(skill: Skill): Promise<void>;
  
  abstract readMemory(path: string): Promise<Memory | null>;
  abstract writeMemory(memory: Memory): Promise<void>;
  abstract queryMemory(type: MemoryType, query?: any): Promise<Memory[]>;
  
  abstract getConfig(): PlatformConfig;
  abstract updateConfig(updates: Partial<PlatformConfig>): Promise<void>;
  
  abstract isAvailable(): Promise<boolean>;
  abstract getCapabilities(): PlatformCapabilities;

  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.config.platform} adapter...`);
  }
}
