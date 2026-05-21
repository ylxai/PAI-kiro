#!/usr/bin/env bun

/**
 * PAI-Kiro Installer
 * 
 * Universal installer for PAI on Kiro IDE
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { KiroAdapter } from '../adapters/KiroAdapter';
import { PAICore } from '../core/PAICore';

const program = new Command();

program
  .name('pai-kiro-install')
  .description('Install PAI on Kiro IDE')
  .version('0.1.0')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--skip-backup', 'Skip backing up existing config')
  .parse(process.argv);

const options = program.opts();

interface InstallConfig {
  backupExisting: boolean;
  migrateSkills: boolean;
  migrateTelos: boolean;
  setupHooks: boolean;
  paiSourcePath?: string;
}

async function main() {
  console.log(chalk.cyan.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   PAI-Kiro Installation Wizard        ║'));
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

  // Step 4: Initialize Kiro adapter
  console.log(chalk.yellow('\n🔧 Initializing Kiro adapter...\n'));
  const adapter = new KiroAdapter();
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

  // Step 8: Create welcome message
  await createWelcomeMessage(adapter);

  console.log(chalk.green.bold('\n✅ Installation complete!\n'));
  printNextSteps();
}

async function checkPrerequisites(): Promise<void> {
  const checks = [
    { name: 'Bun runtime', check: checkBun },
    { name: 'Kiro IDE', check: checkKiro },
    { name: 'Git', check: checkGit },
  ];

  for (const { name, check } of checks) {
    const result = await check();
    if (result) {
      console.log(chalk.green(`✅ ${name}`));
    } else {
      console.log(chalk.red(`❌ ${name} - Not found`));
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

async function checkKiro(): Promise<boolean> {
  try {
    const kiroDir = path.join(os.homedir(), '.kiro');
    await fs.access(kiroDir);
    return true;
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
      message: 'Migrate PAI skills to Kiro?',
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

async function migrateSkills(sourcePath: string, adapter: KiroAdapter): Promise<void> {
  console.log(chalk.yellow('\n🎯 Migrating skills...\n'));

  const sourceSkillsDir = path.join(sourcePath, 'skills');
  const targetSkillsDir = adapter.getSkillsDir();

  try {
    const skills = await fs.readdir(sourceSkillsDir);
    let migrated = 0;

    for (const skill of skills) {
      const sourcePath = path.join(sourceSkillsDir, skill);
      const targetPath = path.join(targetSkillsDir, skill);

      // Check if it's a directory with SKILL.md
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

async function migrateTelos(sourcePath: string, adapter: KiroAdapter): Promise<void> {
  console.log(chalk.yellow('\n📖 Migrating TELOS...\n'));

  const sourceTelosDir = path.join(sourcePath, 'PAI', 'USER', 'TELOS');
  const targetConfigDir = adapter.getConfigDir();
  const targetTelosDir = path.join(targetConfigDir, 'USER', 'TELOS');

  try {
    await fs.mkdir(targetTelosDir, { recursive: true });
    await fs.cp(sourceTelosDir, targetTelosDir, { recursive: true });
    console.log(chalk.green('✅ TELOS migrated\n'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  No TELOS found to migrate\n'));
  }
}

async function setupCoreHooks(adapter: KiroAdapter): Promise<void> {
  console.log(chalk.yellow('\n🪝 Setting up core hooks...\n'));

  const hooks = [
    {
      type: 'UserPromptSubmit' as const,
      name: 'PAI-PromptProcessing',
      description: 'Classify prompt mode (MINIMAL/NATIVE/ALGORITHM)',
      handler: async () => {},
    },
    {
      type: 'PostToolUse' as const,
      name: 'PAI-ToolActivityTracker',
      description: 'Track tool usage for observability',
      handler: async () => {},
    },
    {
      type: 'Stop' as const,
      name: 'PAI-WorkCompletionLearning',
      description: 'Capture learnings when work completes',
      handler: async () => {},
    },
  ];

  for (const hook of hooks) {
    await adapter.registerHook(hook);
    console.log(chalk.green(`  ✅ ${hook.name}`));
  }

  console.log('');
}

async function createWelcomeMessage(adapter: KiroAdapter): Promise<void> {
  const welcomeContent = `# Welcome to PAI on Kiro! 🎉

PAI (Personal AI Infrastructure) is now running on your Kiro IDE.

## What's Available

✅ **Skills System** - 45+ specialized skills ready to use
✅ **Hook System** - Automated workflows on events
✅ **Memory System** - Persistent knowledge and learning
✅ **Algorithm v6.3.0** - 7-phase problem-solving loop
✅ **TELOS** - Your goals and mission guide every decision

## Next Steps

1. **Run the interview** - Define your TELOS (goals, mission, beliefs)
   \`\`\`
   /interview
   \`\`\`

2. **Explore skills** - Check available skills in \`.kiro/skills/\`

3. **Review hooks** - See automated workflows in \`.kiro/hooks/\`

4. **Check steering** - Global context in \`~/.kiro/steering/\`

## Quick Commands

- \`/interview\` - Setup your TELOS
- \`/skills\` - List available skills
- \`/hooks\` - List active hooks
- \`/memory\` - Access your knowledge graph

## Documentation

- Architecture: [KIRO_ADAPTATION.md](../KIRO_ADAPTATION.md)
- Original PAI: [Releases/v5.0.0/README.md](../Releases/v5.0.0/README.md)
- Kiro Docs: https://kiro.dev/docs

## Support

- Issues: https://github.com/ylxai/PAI-kiro/issues
- Discussions: https://github.com/ylxai/PAI-kiro/discussions

---

**Your DA is ready to help you achieve your ideal state!** 🚀
`;

  const welcomePath = path.join(adapter.getConfigDir(), 'WELCOME.md');
  await fs.writeFile(welcomePath, welcomeContent);
}

function printNextSteps(): void {
  console.log(chalk.cyan('📚 Next Steps:\n'));
  console.log(chalk.white('1. Open Kiro IDE'));
  console.log(chalk.white('2. Read the welcome message:'));
  console.log(chalk.gray(`   cat ~/.kiro/pai/WELCOME.md\n`));
  console.log(chalk.white('3. Run the interview to setup your TELOS:'));
  console.log(chalk.gray(`   /interview\n`));
  console.log(chalk.white('4. Start using PAI skills and hooks!\n'));
  
  console.log(chalk.cyan('📖 Documentation:\n'));
  console.log(chalk.gray(`   Architecture: ${path.join(process.cwd(), 'KIRO_ADAPTATION.md')}`));
  console.log(chalk.gray(`   Original PAI: ${path.join(process.cwd(), 'Releases/v5.0.0/README.md')}\n`));
}

// Run installer
main().catch((error) => {
  console.error(chalk.red('\n❌ Installation failed:'), error);
  process.exit(1);
});
