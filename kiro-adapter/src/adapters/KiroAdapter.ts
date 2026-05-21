/**
 * Kiro Platform Adapter
 * 
 * Adapts PAI to work with Kiro IDE by mapping PAI concepts to Kiro's
 * native features: hooks, steering, skills, and specs.
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

export class KiroAdapter extends BasePlatformAdapter {
  config: PlatformConfig;

  constructor() {
    super();
    this.config = {
      name: 'kiro',
      version: '0.1.0',
      configDir: path.join(os.homedir(), '.kiro', 'pai'),
      steeringDir: path.join(os.homedir(), '.kiro', 'steering'),
      skillsDir: path.join(process.cwd(), '.kiro', 'skills'),
      hooksDir: path.join(process.cwd(), '.kiro', 'hooks'),
      memoryDir: path.join(os.homedir(), '.kiro', 'pai', 'MEMORY'),
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Create necessary directories
    await this.ensureDirectories();
    
    // Verify Kiro is available
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Kiro IDE not detected. Please install Kiro first.');
    }
    
    console.log('✅ Kiro adapter initialized successfully');
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.config.configDir,
      this.config.steeringDir!,
      this.config.skillsDir,
      this.config.hooksDir,
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
    return this.config.hooksDir;
  }

  getMemoryDir(): string {
    return this.config.memoryDir;
  }

  /**
   * Register a PAI hook by converting it to Kiro hook format
   */
  async registerHook(event: HookEvent): Promise<void> {
    const kiroHook = this.convertToKiroHook(event);
    const hookPath = path.join(this.config.hooksDir, `${event.name}.json`);
    
    await fs.writeFile(hookPath, JSON.stringify(kiroHook, null, 2));
    console.log(`✅ Registered hook: ${event.name}`);
  }

  /**
   * Convert PAI hook to Kiro hook format
   */
  private convertToKiroHook(event: HookEvent): any {
    // Map PAI hook types to Kiro hook types
    const hookTypeMapping: Record<string, string> = {
      'UserPromptSubmit': 'PromptSubmit',
      'PreToolUse': 'PreToolUse',
      'PostToolUse': 'PostToolUse',
      'Stop': 'AgentStop',
      'FileCreate': 'FileCreate',
      'FileSave': 'FileSave',
      'FileDelete': 'FileDelete',
      'PreTaskExecution': 'PreTaskExecution',
      'PostTaskExecution': 'PostTaskExecution',
      'ManualTrigger': 'ManualTrigger',
    };

    const kiroEventType = hookTypeMapping[event.type] || 'ManualTrigger';

    const kiroHook: any = {
      title: event.name,
      description: event.description,
      event: kiroEventType,
      action: 'ask-kiro', // Default to agent prompt action
      instructions: this.generateHookInstructions(event),
    };

    // Add optional fields
    if (event.options?.filePattern) {
      kiroHook.filePattern = event.options.filePattern;
    }

    if (event.options?.toolName) {
      kiroHook.toolName = event.options.toolName;
    }

    if (event.options?.timeout) {
      kiroHook.timeout = event.options.timeout;
    }

    return kiroHook;
  }

  /**
   * Generate instructions for Kiro hook from PAI handler
   */
  private generateHookInstructions(event: HookEvent): string {
    // For now, convert handler to string
    // In production, this would be more sophisticated
    return `# ${event.name}\n\n${event.description}\n\n## Handler\n\`\`\`typescript\n${event.handler.toString()}\n\`\`\``;
  }

  async unregisterHook(hookName: string): Promise<void> {
    const hookPath = path.join(this.config.hooksDir, `${hookName}.json`);
    
    try {
      await fs.unlink(hookPath);
      console.log(`✅ Unregistered hook: ${hookName}`);
    } catch (error) {
      console.warn(`⚠️  Hook not found: ${hookName}`);
    }
  }

  async listHooks(): Promise<HookEvent[]> {
    const files = await fs.readdir(this.config.hooksDir);
    const hooks: HookEvent[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const hookPath = path.join(this.config.hooksDir, file);
        const content = await fs.readFile(hookPath, 'utf-8');
        const kiroHook = JSON.parse(content);
        
        // Convert back to PAI format
        hooks.push(this.convertFromKiroHook(kiroHook));
      }
    }

    return hooks;
  }

  private convertFromKiroHook(kiroHook: any): HookEvent {
    const reverseMapping: Record<string, HookType> = {
      'PromptSubmit': 'UserPromptSubmit',
      'PreToolUse': 'PreToolUse',
      'PostToolUse': 'PostToolUse',
      'AgentStop': 'Stop',
      'FileCreate': 'FileCreate',
      'FileSave': 'FileSave',
      'FileDelete': 'FileDelete',
      'PreTaskExecution': 'PreTaskExecution',
      'PostTaskExecution': 'PostTaskExecution',
      'ManualTrigger': 'ManualTrigger',
    };

    return {
      type: reverseMapping[kiroHook.event] || 'ManualTrigger',
      name: kiroHook.title,
      description: kiroHook.description,
      handler: async (context: HookContext) => {
        // Placeholder handler
        console.log(`Hook ${kiroHook.title} triggered`);
      },
      options: {
        filePattern: kiroHook.filePattern,
        toolName: kiroHook.toolName,
        timeout: kiroHook.timeout,
      },
    };
  }

  /**
   * Inject context as Kiro steering file
   */
  async injectContext(injection: ContextInjection): Promise<void> {
    const steeringDir = injection.type === 'global' 
      ? this.config.steeringDir!
      : path.join(process.cwd(), '.kiro', 'steering');

    await fs.mkdir(steeringDir, { recursive: true });

    // Generate filename from content hash or timestamp
    const filename = `pai-${injection.type}-${Date.now()}.md`;
    const filePath = path.join(steeringDir, filename);

    // Create frontmatter based on injection mode
    const frontmatter = this.generateSteeringFrontmatter(injection);
    const content = `${frontmatter}\n\n${injection.content}`;

    await fs.writeFile(filePath, content);
    console.log(`✅ Injected ${injection.type} context: ${filename}`);
  }

  private generateSteeringFrontmatter(injection: ContextInjection): string {
    const mode = injection.mode || 'always';
    
    let frontmatter = `---\ninclusion: ${mode}`;

    if (mode === 'fileMatch' && injection.fileMatchPattern) {
      frontmatter += `\nfileMatchPattern: "${injection.fileMatchPattern}"`;
    }

    if (mode === 'auto') {
      frontmatter += `\nname: pai-context`;
      frontmatter += `\ndescription: PAI system context and configuration`;
    }

    frontmatter += `\n---`;

    return frontmatter;
  }

  async executeTool(tool: string, params: any): Promise<any> {
    // Kiro tool execution would go through Kiro's API
    // For now, this is a placeholder
    console.log(`Executing tool: ${tool}`, params);
    return { success: true };
  }

  /**
   * Create a Kiro spec from PAI ISA
   */
  async createSpec(spec: SpecData): Promise<string> {
    const specId = `spec-${Date.now()}`;
    const specDir = path.join(process.cwd(), '.kiro', 'specs', specId);
    
    await fs.mkdir(specDir, { recursive: true });

    // Create requirements.md or bugfix.md
    const requirementsFile = spec.type === 'feature' ? 'requirements.md' : 'bugfix.md';
    const requirementsPath = path.join(specDir, requirementsFile);
    await fs.writeFile(requirementsPath, spec.requirements || '# Requirements\n\nTBD');

    // Create design.md
    const designPath = path.join(specDir, 'design.md');
    await fs.writeFile(designPath, spec.design || '# Design\n\nTBD');

    // Create tasks.md
    const tasksPath = path.join(specDir, 'tasks.md');
    const tasksContent = this.generateTasksMarkdown(spec.tasks || []);
    await fs.writeFile(tasksPath, tasksContent);

    console.log(`✅ Created spec: ${specId}`);
    return specId;
  }

  private generateTasksMarkdown(tasks: any[]): string {
    let content = '# Tasks\n\n';
    
    for (const task of tasks) {
      const status = task.status === 'completed' ? '[x]' : '[ ]';
      content += `- ${status} ${task.description}\n`;
    }

    return content;
  }

  async updateSpec(specId: string, updates: Partial<SpecData>): Promise<void> {
    const specDir = path.join(process.cwd(), '.kiro', 'specs', specId);
    
    if (updates.requirements) {
      const requirementsPath = path.join(specDir, 'requirements.md');
      await fs.writeFile(requirementsPath, updates.requirements);
    }

    if (updates.design) {
      const designPath = path.join(specDir, 'design.md');
      await fs.writeFile(designPath, updates.design);
    }

    if (updates.tasks) {
      const tasksPath = path.join(specDir, 'tasks.md');
      const tasksContent = this.generateTasksMarkdown(updates.tasks);
      await fs.writeFile(tasksPath, tasksContent);
    }

    console.log(`✅ Updated spec: ${specId}`);
  }

  async getSpec(specId: string): Promise<SpecData | null> {
    const specDir = path.join(process.cwd(), '.kiro', 'specs', specId);
    
    try {
      const requirementsPath = path.join(specDir, 'requirements.md');
      const designPath = path.join(specDir, 'design.md');
      const tasksPath = path.join(specDir, 'tasks.md');

      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      const design = await fs.readFile(designPath, 'utf-8');
      const tasksContent = await fs.readFile(tasksPath, 'utf-8');

      return {
        type: 'feature',
        title: specId,
        requirements,
        design,
        tasks: this.parseTasksMarkdown(tasksContent),
      };
    } catch (error) {
      return null;
    }
  }

  private parseTasksMarkdown(content: string): any[] {
    const tasks: any[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^- \[([ x])\] (.+)$/);
      if (match) {
        tasks.push({
          id: `task-${tasks.length + 1}`,
          description: match[2],
          status: match[1] === 'x' ? 'completed' : 'pending',
        });
      }
    }

    return tasks;
  }

  async deleteSpec(specId: string): Promise<void> {
    const specDir = path.join(process.cwd(), '.kiro', 'specs', specId);
    await fs.rm(specDir, { recursive: true, force: true });
    console.log(`✅ Deleted spec: ${specId}`);
  }

  async isAvailable(): Promise<boolean> {
    // Check if Kiro config directory exists
    try {
      const kiroDir = path.join(os.homedir(), '.kiro');
      await fs.access(kiroDir);
      return true;
    } catch {
      return false;
    }
  }

  getCapabilities(): PlatformCapabilities {
    return {
      supportsHooks: true,
      supportsSpecs: true,
      supportsSteering: true,
      supportsSkills: true,
      supportsMCP: true,
      supportsVoice: false, // Kiro doesn't have native voice
      supportsDashboard: false, // Would need standalone Pulse
      hookTypes: [
        'UserPromptSubmit',
        'PreToolUse',
        'PostToolUse',
        'Stop',
        'FileCreate',
        'FileSave',
        'FileDelete',
        'PreTaskExecution',
        'PostTaskExecution',
        'ManualTrigger',
      ],
      contextModes: ['always', 'auto', 'manual', 'fileMatch'],
    };
  }
}
