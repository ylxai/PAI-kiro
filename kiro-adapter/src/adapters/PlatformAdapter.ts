/**
 * Platform Adapter Interface
 * 
 * This interface defines the contract that all platform adapters must implement
 * to support PAI on different AI coding environments (Claude Code, Kiro, OpenCode, etc.)
 */

export interface PlatformConfig {
  name: 'claude-code' | 'kiro' | 'kiro-cli' | 'opencode';
  version: string;
  configDir: string;
  steeringDir?: string;
  skillsDir: string;
  hooksDir: string;
  memoryDir: string;
}

export interface HookEvent {
  type: HookType;
  name: string;
  description: string;
  handler: HookHandler;
  options?: HookOptions;
}

export type HookType =
  | 'SessionStart'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact'
  | 'SessionEnd'
  | 'FileCreate'
  | 'FileSave'
  | 'FileDelete'
  | 'PreTaskExecution'
  | 'PostTaskExecution'
  | 'ManualTrigger';

export type HookHandler = (context: HookContext) => Promise<void> | void;

export interface HookContext {
  event: HookType;
  data: any;
  platform: string;
  timestamp: Date;
}

export interface HookOptions {
  filePattern?: string;
  toolName?: string;
  timeout?: number;
  enabled?: boolean;
}

export interface ContextInjection {
  type: 'global' | 'session' | 'file';
  content: string;
  priority?: 'high' | 'medium' | 'low';
  mode?: 'always' | 'auto' | 'manual' | 'fileMatch';
  fileMatchPattern?: string;
}

export interface SpecData {
  type: 'feature' | 'bugfix';
  title: string;
  requirements?: string;
  design?: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dependencies?: string[];
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
   * Get the main configuration directory
   */
  getConfigDir(): string;

  /**
   * Get the steering/context directory
   */
  getSteeringDir(): string;

  /**
   * Get the skills directory
   */
  getSkillsDir(): string;

  /**
   * Get the hooks directory
   */
  getHooksDir(): string;

  /**
   * Get the memory directory
   */
  getMemoryDir(): string;

  /**
   * Register a hook with the platform
   */
  registerHook(event: HookEvent): Promise<void>;

  /**
   * Unregister a hook
   */
  unregisterHook(hookName: string): Promise<void>;

  /**
   * List all registered hooks
   */
  listHooks(): Promise<HookEvent[]>;

  /**
   * Inject context into the platform
   */
  injectContext(injection: ContextInjection): Promise<void>;

  /**
   * Execute a tool/command
   */
  executeTool(tool: string, params: any): Promise<any>;

  /**
   * Create a spec/ISA
   */
  createSpec(spec: SpecData): Promise<string>;

  /**
   * Update a spec/ISA
   */
  updateSpec(specId: string, updates: Partial<SpecData>): Promise<void>;

  /**
   * Get a spec/ISA
   */
  getSpec(specId: string): Promise<SpecData | null>;

  /**
   * Delete a spec/ISA
   */
  deleteSpec(specId: string): Promise<void>;

  /**
   * Check if the platform is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get platform-specific capabilities
   */
  getCapabilities(): PlatformCapabilities;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}

export interface PlatformCapabilities {
  supportsHooks: boolean;
  supportsSpecs: boolean;
  supportsSteering: boolean;
  supportsSkills: boolean;
  supportsMCP: boolean;
  supportsVoice: boolean;
  supportsDashboard: boolean;
  hookTypes: HookType[];
  contextModes: string[];
}

/**
 * Base adapter class with common functionality
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract config: PlatformConfig;

  async initialize(): Promise<void> {
    // Default implementation - can be overridden
    console.log(`Initializing ${this.config.name} adapter...`);
  }

  abstract getConfigDir(): string;
  abstract getSteeringDir(): string;
  abstract getSkillsDir(): string;
  abstract getHooksDir(): string;
  abstract getMemoryDir(): string;
  abstract registerHook(event: HookEvent): Promise<void>;
  abstract unregisterHook(hookName: string): Promise<void>;
  abstract listHooks(): Promise<HookEvent[]>;
  abstract injectContext(injection: ContextInjection): Promise<void>;
  abstract executeTool(tool: string, params: any): Promise<any>;
  abstract createSpec(spec: SpecData): Promise<string>;
  abstract updateSpec(specId: string, updates: Partial<SpecData>): Promise<void>;
  abstract getSpec(specId: string): Promise<SpecData | null>;
  abstract deleteSpec(specId: string): Promise<void>;
  abstract isAvailable(): Promise<boolean>;
  abstract getCapabilities(): PlatformCapabilities;

  async cleanup(): Promise<void> {
    // Default cleanup - can be overridden
    console.log(`Cleaning up ${this.config.name} adapter...`);
  }
}
