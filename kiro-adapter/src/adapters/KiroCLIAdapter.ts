/**
 * Kiro CLI Platform Adapter
 * 
 * Adapts PAI to work with Kiro CLI by mapping PAI concepts to Kiro CLI's
 * native features: hooks, steering, skills, and custom agents.
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import {
  BasePlatformAdapter,
  PlatformConfig,
  HookEvent,
  HookType,
  ContextInjection,
  SpecData,
  PlatformCapabilities,
  HookContext,
} from './PlatformAdapter';

export interface KiroCLIAgentConfig {
  name: string;
  description?: string;
  system_prompt?: string;
  resources?: string[];
  tools?: string[];
  hooks?: KiroCLIHook[];
  model?: string;
}

export interface KiroCLIHook {
  event: 'agentSpawn' | 'userPromptSubmit' | 'preToolUse' | 'postToolUse' | 'stop';
  command: string;
  matcher?: string;
  timeout_ms?: number;
  cache_ttl_seconds?: number;
}

export class KiroCLIAdapter extends BasePlatformAdapter {
  config: PlatformConfig;
  private agentConfigPath: string;

  constructor() {
    super();
    this.config = {
      name: 'kiro-cli',
      version: '0.2.0',
      configDir: path.join(os.homedir(), '.kiro', 'pai'),
      steeringDir: path.join(os.homedir(), '.kiro', 'steering'),
      skillsDir: path.join(os.homedir(), '.kiro', 'skills'),
      hooksDir: path.join(process.cwd(), '.kiro', 'agents'), // CLI uses agents dir
      memoryDir: path.join(os.homedir(), '.kiro', 'pai', 'MEMORY'),
    };
    
    this.agentConfigPath = path.join(process.cwd(), '.kiro', 'agents', 'pai-agent.json');
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Create necessary directories
    await this.ensureDirectories();
    
    // Verify Kiro CLI is available
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Kiro CLI not detected. Please install Kiro CLI first: curl -fsSL https://cli.kiro.dev/install | bash');
    }
    
    console.log('✅ Kiro CLI adapter initialized successfully');
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.configDir,
      this.config.steeringDir!,
      this.config.skillsDir,
      path.join(process.cwd(), '.kiro', 'agents'),
      this.config.memoryDir,
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  getConfigDir(): string {
    return this.config.configDir;
  }

  getSteeringDir(): string {
    return this.config.steeringDir!;
  }

  getSkillsDir(): string {
    return this.config.skillsDir;
  }

  getHooksDir(): string {
    return path.join(process.cwd(), '.kiro', 'agents');
  }

  getMemoryDir(): string {
    return this.config.memoryDir;
  }

  /**
   * Register a PAI hook by adding it to the PAI agent configuration
   */
  async registerHook(event: HookEvent): Promise<void> {
    // Load or create agent config
    let agentConfig = await this.loadAgentConfig();
    
    // Convert PAI hook to Kiro CLI hook format
    const kiroHook = this.convertToKiroCLIHook(event);
    
    // Add hook to agent config
    if (!agentConfig.hooks) {
      agentConfig.hooks = [];
    }
    
    // Remove existing hook with same name
    agentConfig.hooks = agentConfig.hooks.filter(h => 
      !h.command.includes(event.name)
    );
    
    agentConfig.hooks.push(kiroHook);
    
    // Save agent config
    await this.saveAgentConfig(agentConfig);
    
    console.log(`✅ Registered hook: ${event.name}`);
  }

  /**
   * Convert PAI hook to Kiro CLI hook format
   */
  private convertToKiroCLIHook(event: HookEvent): KiroCLIHook {
    // Map PAI hook types to Kiro CLI hook types
    const hookTypeMapping: Record<string, KiroCLIHook['event']> = {
      'SessionStart': 'agentSpawn',
      'UserPromptSubmit': 'userPromptSubmit',
      'PreToolUse': 'preToolUse',
      'PostToolUse': 'postToolUse',
      'Stop': 'stop',
    };

    const kiroEventType = hookTypeMapping[event.type] || 'agentSpawn';

    // Create hook script path
    const hookScriptPath = path.join(
      process.cwd(), 
      '.kiro', 
      'agents', 
      'hooks',
      `${event.name}.sh`
    );

    const hook: KiroCLIHook = {
      event: kiroEventType,
      command: hookScriptPath,
      timeout_ms: event.options?.timeout || 30000,
    };

    // Add matcher for tool-specific hooks
    if (event.options?.toolName) {
      hook.matcher = event.options.toolName;
    }

    return hook;
  }

  async unregisterHook(hookName: string): Promise<void> {
    let agentConfig = await this.loadAgentConfig();
    
    if (agentConfig.hooks) {
      agentConfig.hooks = agentConfig.hooks.filter(h => 
        !h.command.includes(hookName)
      );
      await this.saveAgentConfig(agentConfig);
    }
    
    console.log(`✅ Unregistered hook: ${hookName}`);
  }

  async listHooks(): Promise<HookEvent[]> {
    const agentConfig = await this.loadAgentConfig();
    const hooks: HookEvent[] = [];

    if (agentConfig.hooks) {
      for (const kiroHook of agentConfig.hooks) {
        hooks.push(this.convertFromKiroCLIHook(kiroHook));
      }
    }

    return hooks;
  }

  private convertFromKiroCLIHook(kiroHook: KiroCLIHook): HookEvent {
    const reverseMapping: Record<string, HookType> = {
      'agentSpawn': 'SessionStart',
      'userPromptSubmit': 'UserPromptSubmit',
      'preToolUse': 'PreToolUse',
      'postToolUse': 'PostToolUse',
      'stop': 'Stop',
    };

    const hookName = path.basename(kiroHook.command, '.sh');

    return {
      type: reverseMapping[kiroHook.event] || 'SessionStart',
      name: hookName,
      description: `Kiro CLI hook: ${kiroHook.event}`,
      handler: async (context: HookContext) => {
        console.log(`Hook ${hookName} triggered`);
      },
      options: {
        toolName: kiroHook.matcher,
        timeout: kiroHook.timeout_ms,
      },
    };
  }

  /**
   * Inject context as Kiro CLI steering file
   */
  async injectContext(injection: ContextInjection): Promise<void> {
    const steeringDir = injection.type === 'global' 
      ? this.config.steeringDir!
      : path.join(process.cwd(), '.kiro', 'steering');

    await fs.mkdir(steeringDir, { recursive: true });

    // Generate filename
    const filename = `pai-${injection.type}-${Date.now()}.md`;
    const filePath = path.join(steeringDir, filename);

    // Kiro CLI steering files don't need frontmatter - they're always loaded
    const content = injection.content;

    await fs.writeFile(filePath, content);
    console.log(`✅ Injected ${injection.type} context: ${filename}`);
  }

  async executeTool(tool: string, params: any): Promise<any> {
    // Kiro CLI tool execution would go through the CLI
    console.log(`Executing tool: ${tool}`, params);
    return { success: true };
  }

  /**
   * Kiro CLI doesn't have specs - this is a no-op
   */
  async createSpec(spec: SpecData): Promise<string> {
    console.warn('⚠️  Kiro CLI does not support specs. Use custom agents instead.');
    return 'not-supported';
  }

  async updateSpec(specId: string, updates: Partial<SpecData>): Promise<void> {
    console.warn('⚠️  Kiro CLI does not support specs.');
  }

  async getSpec(specId: string): Promise<SpecData | null> {
    console.warn('⚠️  Kiro CLI does not support specs.');
    return null;
  }

  async deleteSpec(specId: string): Promise<void> {
    console.warn('⚠️  Kiro CLI does not support specs.');
  }

  async isAvailable(): Promise<boolean> {
    // Check if Kiro CLI is installed
    try {
      const result = await Bun.spawn(['which', 'kiro-cli']).exited;
      return result === 0;
    } catch {
      return false;
    }
  }

  getCapabilities(): PlatformCapabilities {
    return {
      supportsHooks: true,
      supportsSpecs: false, // Kiro CLI doesn't have specs
      supportsSteering: true,
      supportsSkills: true,
      supportsMCP: true,
      supportsVoice: false,
      supportsDashboard: false,
      hookTypes: [
        'SessionStart', // agentSpawn
        'UserPromptSubmit',
        'PreToolUse',
        'PostToolUse',
        'Stop',
      ],
      contextModes: ['always'], // CLI steering is always loaded
    };
  }

  /**
   * Load PAI agent configuration
   */
  private async loadAgentConfig(): Promise<KiroCLIAgentConfig> {
    try {
      const content = await fs.readFile(this.agentConfigPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Create default agent config
      return {
        name: 'pai',
        description: 'Personal AI Infrastructure agent for Kiro CLI',
        system_prompt: 'You are a helpful AI assistant powered by PAI (Personal AI Infrastructure).',
        resources: [
          'file://.kiro/steering/**/*.md',
        ],
        tools: ['*'], // All tools by default
        hooks: [],
      };
    }
  }

  /**
   * Save PAI agent configuration
   */
  private async saveAgentConfig(config: KiroCLIAgentConfig): Promise<void> {
    const dir = path.dirname(this.agentConfigPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.agentConfigPath, 
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Create a custom agent configuration
   */
  async createCustomAgent(config: Partial<KiroCLIAgentConfig>): Promise<string> {
    const agentName = config.name || 'pai-custom';
    const agentPath = path.join(
      process.cwd(),
      '.kiro',
      'agents',
      `${agentName}.json`
    );

    const fullConfig: KiroCLIAgentConfig = {
      name: agentName,
      description: config.description || 'Custom PAI agent',
      system_prompt: config.system_prompt,
      resources: config.resources || ['file://.kiro/steering/**/*.md'],
      tools: config.tools || ['*'],
      hooks: config.hooks || [],
      model: config.model,
    };

    await fs.writeFile(agentPath, JSON.stringify(fullConfig, null, 2));
    console.log(`✅ Created custom agent: ${agentName}`);
    
    return agentName;
  }
}
