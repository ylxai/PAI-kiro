#!/usr/bin/env bun

/**
 * PAI-Kiro CLI Installer
 * 
 * Universal installer for PAI on Kiro CLI
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { KiroCLIAdapter } from '../adapters/KiroCLIAdapter';
import { PAICore } from '../core/PAICore';

const program = new Command();

program
  .name('pai-kiro-cli-install')
  .description('Install PAI on Kiro CLI')
  .version('0.2.0')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--skip-backup', 'Skip backing up existing config')
  .parse(process.argv);

const options = program.opts();

interface InstallConfig {
  backupExisting: boolean;
  migrateSkills: boolean;
  migrateTelos: boolean;
  setupHooks: boolean;
  createCustomAgent: boolean;
  paiSourcePath?: string;
}

async function main() {
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   PAI-Kiro CLI Installation Wizard    ║'));
  console.log(chalk.cyan.bold('╚════════════════════════════════════════╝\n'));

  // Step 1: Check prerequisites
  console.log(chalk.yellow('📋 Checking prerequisites...\n'));
  await checkPrerequisites();

  // Step 2: Get installation config
  const config = options.yes 
    ? getDefaultConfig() 
    : await promptInstallConfig();

  // Step 3: Backup existing config
  if (config.backupExisting && !options.skipBackup) {
    await backupExistingConfig();
  }

  // Step 4: Initialize Kiro CLI adapter
  console.log(chalk.yellow('\n🔧 Initializing Kiro CLI adapter...\n'));
  const adapter = new KiroCLIAdapter();
  await adapter.initialize();

  // Step 5: Initialize PAI Core
  console.log(chalk.yellow('\n🚀 Initializing PAI Core...\n'));
  const pai = new PAICore({ adapter });
  await pai.initialize();

  // Step 6: Migrate from existing PAI (if requested)
  if (config.migrateSkills && config.paiSourcePath) {
    await migrateSkills(config.paiSourcePath, adapter);
  }

  if (config.migrateTelos && config.paiSourcePath) {
    await migrateTelos(config.paiSourcePath, adapter);
  }

  // Step 7: Setup core hooks
  if (config.setupHooks) {
    await setupCoreHooks(adapter);
  }

  // Step 8: Create custom PAI agent
  if (config.createCustomAgent) {
    await createPAIAgent(adapter);
  }

  // Step 9: Create welcome message
  await createWelcomeMessage(adapter);

  console.log(chalk.green.bold('\n✅ Installation complete!\n'));
  printNextSteps();
}

async function checkPrerequisites(): Promise<void> {
  const checks = [
    { name: 'Bun runtime', check: checkBun },
    { name: 'Kiro CLI', check: checkKiroCLI },
    { name: 'Git', check: checkGit },
  ];

  for (const { name, check } of checks) {
    const result = await check();
    if (result) {
      console.log(chalk.green(`✅ ${name}`));
    } else {
      console.log(chalk.red(`❌ ${name} - Not found`));
      if (name === 'Kiro CLI') {
        console.log(chalk.yellow('\nInstall Kiro CLI with:'));
        console.log(chalk.gray('curl -fsSL https://cli.kiro.dev/install | bash\n'));
      }
      process.exit(1);
    }
  }

  console.log('');
}

async function checkBun(): Promise<boolean> {
  try {
    const result = await Bun.spawn(['bun', '--version']).exited;
    return result === 0;
  } catch {
    return false;
  }
}

async function checkKiroCLI(): Promise<boolean> {
  try {
    const result = await Bun.spawn(['which', 'kiro-cli']).exited;
    return result === 0;
  } catch {
    return false;
  }
}

async function checkGit(): Promise<boolean> {
  try {
    const result = await Bun.spawn(['git', '--version']).exited;
    return result === 0;
  } catch {
    return false;
  }
}

function getDefaultConfig(): InstallConfig {
  return {
    backupExisting: true,
    migrateSkills: false,
    migrateTelos: false,
    setupHooks: true,
    createCustomAgent: true,
  };
}

async function promptInstallConfig(): Promise<InstallConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'backupExisting',
      message: 'Backup existing Kiro config?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'migrateFromPAI',
      message: 'Do you have an existing PAI installation to migrate from?',
      default: false,
    },
    {
      type: 'input',
      name: 'paiSourcePath',
      message: 'Path to existing PAI installation:',
      default: path.join(os.homedir(), '.claude'),
      when: (answers) => answers.migrateFromPAI,
      validate: async (input) => {
        try {
          await fs.access(input);
          return true;
        } catch {
          return 'Path does not exist';
        }
      },
    },
    {
      type: 'confirm',
      name: 'migrateSkills',
      message: 'Migrate PAI skills to Kiro CLI?',
      default: true,
      when: (answers) => answers.migrateFromPAI,
    },
    {
      type: 'confirm',
      name: 'migrateTelos',
      message: 'Migrate TELOS (goals, mission, beliefs)?',
      default: true,
      when: (answers) => answers.migrateFromPAI,
    },
    {
      type: 'confirm',
      name: 'setupHooks',
      message: 'Setup core PAI hooks?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'createCustomAgent',
      message: 'Create PAI custom agent for Kiro CLI?',
      default: true,
    },
  ]);

  return answers as InstallConfig;
}

async function backupExistingConfig(): Promise<void> {
  console.log(chalk.yellow('\n💾 Backing up existing config...\n'));

  const kiroDir = path.join(os.homedir(), '.kiro');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(os.homedir(), `.kiro.backup-${timestamp}`);

  try {
    await fs.cp(kiroDir, backupDir, { recursive: true });
    console.log(chalk.green(`✅ Backup created: ${backupDir}\n`));
  } catch (error) {
    console.log(chalk.yellow('⚠️  No existing config to backup\n'));
  }
}

async function migrateSkills(sourcePath: string, adapter: KiroCLIAdapter): Promise<void> {
  console.log(chalk.yellow('\n🎯 Migrating skills...\n'));

  const sourceSkillsDir = path.join(sourcePath, 'skills');
  const targetSkillsDir = adapter.getSkillsDir();

  try {
    const skills = await fs.readdir(sourceSkillsDir);
    let migrated = 0;

    for (const skill of skills) {
      const sourcePath = path.join(sourceSkillsDir, skill);
      const targetPath = path.join(targetSkillsDir, skill);

      const stat = await fs.stat(sourcePath);
      if (stat.isDirectory()) {
        const skillFile = path.join(sourcePath, 'SKILL.md');
        try {
          await fs.access(skillFile);
          await fs.cp(sourcePath, targetPath, { recursive: true });
          migrated++;
          console.log(chalk.green(`  ✅ ${skill}`));
        } catch {
          console.log(chalk.yellow(`  ⚠️  ${skill} (no SKILL.md)`));
        }
      }
    }

    console.log(chalk.green(`\n✅ Migrated ${migrated} skills\n`));
  } catch (error) {
    console.log(chalk.red('❌ Failed to migrate skills:', error));
  }
}

async function migrateTelos(sourcePath: string, adapter: KiroCLIAdapter): Promise<void> {
  console.log(chalk.yellow('\n📖 Migrating TELOS...\n'));

  const sourceTelosDir = path.join(sourcePath, 'PAI', 'USER', 'TELOS');
  const targetConfigDir = adapter.getConfigDir();
  const targetTelosDir = path.join(targetConfigDir, 'USER', 'TELOS');

  try {
    await fs.mkdir(targetTelosDir, { recursive: true });
    await fs.cp(sourceTelosDir, targetTelosDir, { recursive: true });
    
    // Also create steering file from TELOS
    await createTelosSteering(targetTelosDir, adapter);
    
    console.log(chalk.green('✅ TELOS migrated\n'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  No TELOS found to migrate\n'));
  }
}

async function createTelosSteering(telosDir: string, adapter: KiroCLIAdapter): Promise<void> {
  const steeringPath = path.join(adapter.getSteeringDir(), 'pai-telos.md');
  
  let content = '# PAI TELOS - Your Life Operating System\n\n';
  content += 'This file contains your goals, mission, and beliefs that guide all AI decisions.\n\n';
  
  try {
    const files = await fs.readdir(telosDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(telosDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        content += `## ${file.replace('.md', '')}\n\n${fileContent}\n\n`;
      }
    }
    
    await fs.writeFile(steeringPath, content);
  } catch (error) {
    console.warn('Could not create TELOS steering file');
  }
}

async function setupCoreHooks(adapter: KiroCLIAdapter): Promise<void> {
  console.log(chalk.yellow('\n🪝 Setting up core hooks...\n'));

  const hooks = [
    {
      type: 'SessionStart' as const,
      name: 'PAI-Init',
      description: 'Initialize PAI context on agent spawn',
      handler: async () => {},
    },
    {
      type: 'UserPromptSubmit' as const,
      name: 'PAI-PromptProcessing',
      description: 'Process user prompts with PAI context',
      handler: async () => {},
    },
    {
      type: 'PostToolUse' as const,
      name: 'PAI-ToolActivityTracker',
      description: 'Track tool usage for observability',
      handler: async () => {},
    },
  ];

  for (const hook of hooks) {
    await adapter.registerHook(hook);
    console.log(chalk.green(`  ✅ ${hook.name}`));
  }

  console.log('');
}

async function createPAIAgent(adapter: KiroCLIAdapter): Promise<void> {
  console.log(chalk.yellow('\n🤖 Creating PAI custom agent...\n'));

  await adapter.createCustomAgent({
    name: 'pai',
    description: 'Personal AI Infrastructure agent with full PAI capabilities',
    system_prompt: `You are a Personal AI Infrastructure (PAI) agent. You help users achieve their ideal state by:

1. Understanding their TELOS (goals, mission, beliefs)
2. Using the Algorithm v6.3.0 (OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN)
3. Leveraging 45+ specialized skills
4. Maintaining persistent memory across sessions
5. Continuously learning and improving

Always prioritize the user's ideal state and long-term goals over short-term convenience.`,
    resources: [
      'file://.kiro/steering/**/*.md',
    ],
    tools: ['*'], // All tools
  });

  console.log(chalk.green('✅ PAI agent created\n'));
}

async function createWelcomeMessage(adapter: KiroCLIAdapter): Promise<void> {
  const welcomeContent = `# Welcome to PAI on Kiro CLI! 🎉

PAI (Personal AI Infrastructure) is now running on your Kiro CLI.

## What's Available

✅ **Skills System** - 45+ specialized skills ready to use
✅ **Hook System** - Automated workflows on events
✅ **Memory System** - Persistent knowledge and learning
✅ **Algorithm v6.3.0** - 7-phase problem-solving loop
✅ **TELOS** - Your goals and mission guide every decision
✅ **Custom Agents** - Specialized agents for different workflows

## Quick Start

### 1. Start PAI Agent
\`\`\`bash
cd your-project
kiro-cli --agent pai
\`\`\`

### 2. Define Your TELOS
Tell PAI about your goals, mission, and beliefs. This is crucial!

### 3. Use PAI Skills
PAI has 45+ skills available. Just describe what you need and PAI will use the right skill.

## Key Differences from Kiro IDE

- ❌ **No Specs** - Kiro CLI doesn't have specs system
- ✅ **Custom Agents** - Create specialized agents for different workflows
- ✅ **Terminal-based** - All interaction through CLI
- ✅ **Hooks in Agent Config** - Hooks are defined in agent JSON files

## Configuration Files

- **Agent Config**: \`.kiro/agents/pai-agent.json\`
- **Steering**: \`~/.kiro/steering/\` (global) or \`.kiro/steering/\` (workspace)
- **Skills**: \`~/.kiro/skills/\` (global)
- **Memory**: \`~/.kiro/pai/MEMORY/\`

## Documentation

- Architecture: [KIRO_ADAPTATION.md](../KIRO_ADAPTATION.md)
- Migration: [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)
- Quick Ref: [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)

## Support

- Issues: https://github.com/ylxai/PAI-kiro/issues
- Discussions: https://github.com/ylxai/PAI-kiro/discussions

---

**Your DA is ready to help you achieve your ideal state - on Kiro CLI!** 🚀
`;

  const welcomePath = path.join(adapter.getConfigDir(), 'WELCOME.md');
  await fs.writeFile(welcomePath, welcomeContent);
}

function printNextSteps(): void {
  console.log(chalk.cyan('📚 Next Steps:\n'));
  console.log(chalk.white('1. Start Kiro CLI with PAI agent:'));
  console.log(chalk.gray('   cd your-project'));
  console.log(chalk.gray('   kiro-cli --agent pai\n'));
  console.log(chalk.white('2. Define your TELOS (goals, mission, beliefs)\n'));
  console.log(chalk.white('3. Start using PAI skills and capabilities!\n'));
  
  console.log(chalk.cyan('📖 Documentation:\n'));
  console.log(chalk.gray(`   Welcome: ~/.kiro/pai/WELCOME.md`));
  console.log(chalk.gray(`   Agent Config: .kiro/agents/pai-agent.json\n`));
}

// Run installer
main().catch((error) => {
  console.error(chalk.red('\n❌ Installation failed:'), error);
  process.exit(1);
});
