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
import { KiroAdapter } from '../adapters/KiroAdapter';
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

  // Step 4: Initialize Kiro adapter
  console.log(chalk.yellow('\n🔧 Initializing Kiro adapter...\n'));
  const adapter = new KiroAdapter();
  await adapter.initialize();

  // Step 5: Create PAI agent config FIRST so PAICore can inject into it
  if (config.createCustomAgent) {
    await createPAIAgent(adapter);
  }

  // Step 5.5: Copy default PAI resources and transform paths in existing skills
  await setupPAIDefaults(adapter);
  await transformExistingSkills(adapter);

  // Step 6: Initialize PAI Core (injects Algorithm context, registers hooks)
  console.log(chalk.yellow('\n🚀 Initializing PAI Core...\n'));
  const pai = new PAICore({ adapter });
  await pai.initialize();

  // Step 7: Migrate from existing PAI (if requested)
  if (config.migrateSkills && config.paiSourcePath) {
    await migrateSkills(config.paiSourcePath, adapter);
  }

  if (config.migrateTelos && config.paiSourcePath) {
    await migrateTelos(config.paiSourcePath, adapter);
  }

  // Step 7.8: Register global prompts for Kiro CLI (shortcuts for skills)
  await createGlobalPrompts(adapter);

  // Step 8: Create welcome message
  await createWelcomeMessage(adapter);

  console.log(chalk.green.bold('\n✅ Installation complete!\n'));
  printNextSteps();
}

// Helper to replace all occurrences of .claude paths with .kiro paths
function replacePaths(content: string): string {
  let updated = content;
  // Replace .claude/PAI with .kiro/pai
  updated = updated.replace(/\.claude\/PAI/g, '.kiro/pai');
  // Replace .claude/skills with .kiro/skills
  updated = updated.replace(/\.claude\/skills/g, '.kiro/skills');
  // Replace .claude/hooks with .kiro/hooks
  updated = updated.replace(/\.claude\/hooks/g, '.kiro/hooks');
  // Replace remaining .claude with .kiro
  updated = updated.replace(/\.claude/g, '.kiro');
  // Replace remaining PAI references in JSON/configs/paths (case-sensitive where appropriate)
  updated = updated.replace(/"PAI"/g, '"pai"');
  updated = updated.replace(/'PAI'/g, "'pai'");
  updated = updated.replace(/\/PAI\//g, '/pai/');
  updated = updated.replace(/\/PAI$/gm, '/pai');
  return updated;
}

// Check if a file is a text file that should be transformed
function isTextFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.ts', '.md', '.sh', '.json', '.yaml', '.yml', '.txt', '.js'].includes(ext);
}

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Find PAI-Kiro project root directory
async function findProjectRoot(): Promise<string> {
  let current = __dirname;
  while (current !== path.dirname(current)) {
    if (await fileExists(path.join(current, 'Releases', 'v5.0.0'))) {
      return current;
    }
    current = path.dirname(current);
  }
  return path.join(__dirname, '..', '..', '..');
}

// Copy file and transform paths if it's a text file
async function copyFileAndTransform(src: string, dest: string): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  if (isTextFile(src)) {
    try {
      const content = await fs.readFile(src, 'utf-8');
      const transformed = replacePaths(content);
      await fs.writeFile(dest, transformed, 'utf-8');
    } catch (err) {
      await fs.copyFile(src, dest);
    }
  } else {
    await fs.copyFile(src, dest);
  }
}

// Recursively copy and transform directory
async function copyDirAndTransform(srcDir: string, destDir: string): Promise<void> {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  await fs.mkdir(destDir, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirAndTransform(srcPath, destPath);
    } else {
      await copyFileAndTransform(srcPath, destPath);
    }
  }
}

// Recursively scan and transform paths in an existing directory (like ~/.kiro/skills)
async function transformPathsInDirectory(dirPath: string): Promise<void> {
  if (!(await fileExists(dirPath))) return;
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await transformPathsInDirectory(fullPath);
    } else if (entry.isFile() && isTextFile(entry.name)) {
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        const transformed = replacePaths(content);
        if (content !== transformed) {
          await fs.writeFile(fullPath, transformed, 'utf-8');
          console.log(chalk.gray(`  Transformed: ${path.relative(os.homedir(), fullPath)}`));
        }
      } catch (err) {
        // ignore read/write errors
      }
    }
  }
}

async function setupPAIDefaults(adapter: KiroAdapter): Promise<void> {
  const projectRoot = await findProjectRoot();
  const sourcePAIDir = path.join(projectRoot, 'Releases', 'v5.0.0', '.claude', 'PAI');
  const targetPAIDir = adapter.getConfigDir();

  console.log(chalk.yellow('\n📦 Copying and transforming default PAI resources...\n'));
  
  if (await fileExists(sourcePAIDir)) {
    await copyDirAndTransform(sourcePAIDir, targetPAIDir);
    console.log(chalk.green(`✅ Copied and transformed PAI core resources to ${targetPAIDir}`));
  } else {
    console.log(chalk.red(`❌ Source PAI directory not found at ${sourcePAIDir}`));
  }
}

async function normalizeSkillsDirectory(skillsDir: string): Promise<void> {
  if (!(await fileExists(skillsDir))) return;
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const originalName = entry.name;
      const lowerName = originalName.toLowerCase();
      const originalPath = path.join(skillsDir, originalName);
      const lowerPath = path.join(skillsDir, lowerName);

      if (originalName !== lowerName) {
        console.log(chalk.yellow(`  Naming normalization: ${originalName} -> ${lowerName}`));
        try {
          if (await fileExists(lowerPath)) {
            // If the lowercase directory already exists, let's remove the uppercase one to avoid duplicates
            await fs.rm(originalPath, { recursive: true, force: true });
          } else {
            await fs.rename(originalPath, lowerPath);
          }
        } catch (err) {
          console.log(chalk.red(`  ❌ Failed to rename/remove directory ${originalName}:`, err));
        }
      }

      // Now ensure the SKILL.md inside lowerPath is normalized
      const skillFilePath = path.join(lowerPath, 'SKILL.md');
      if (await fileExists(skillFilePath)) {
        try {
          let content = await fs.readFile(skillFilePath, 'utf-8');
          const updatedContent = content.replace(/^(name:\s*)([^\r\n]+)/m, (match, prefix, nameVal) => {
            const lowerNameVal = nameVal.trim().toLowerCase();
            return prefix + lowerNameVal;
          });
          if (content !== updatedContent) {
            await fs.writeFile(skillFilePath, updatedContent, 'utf-8');
            console.log(chalk.green(`  Normalized frontmatter in ${lowerName}/SKILL.md`));
          }
        } catch (err) {
          console.log(chalk.yellow(`  ⚠️  Failed to normalize yaml frontmatter in ${skillFilePath}:`, err));
        }
      }
    }
  }
}

async function transformExistingSkills(adapter: KiroAdapter): Promise<void> {
  const skillsDir = adapter.getSkillsDir();
  console.log(chalk.yellow('\n🔄 Transforming existing skills to match Kiro paths...\n'));
  
  if (await fileExists(skillsDir)) {
    await normalizeSkillsDirectory(skillsDir);
    await transformPathsInDirectory(skillsDir);
    console.log(chalk.green('✅ Transformed all paths in skills directory'));
  } else {
    console.log(chalk.yellow('⚠️  Skills directory not found. Please ensure you have copied the skills.'));
  }
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

async function migrateSkills(sourcePath: string, adapter: KiroAdapter): Promise<void> {
  console.log(chalk.yellow('\n🎯 Migrating skills...\n'));

  const sourceSkillsDir = path.join(sourcePath, 'skills');
  const targetSkillsDir = adapter.getSkillsDir();

  try {
    const skills = await fs.readdir(sourceSkillsDir);
    let migrated = 0;

    for (const skill of skills) {
      const sourcePath = path.join(sourceSkillsDir, skill);
      const targetPath = path.join(targetSkillsDir, skill.toLowerCase());

      const stat = await fs.stat(sourcePath);
      if (stat.isDirectory()) {
        const skillFile = path.join(sourcePath, 'SKILL.md');
        try {
          await fs.access(skillFile);
          await fs.cp(sourcePath, targetPath, { recursive: true });

          // Normalize target SKILL.md YAML frontmatter
          const targetSkillFile = path.join(targetPath, 'SKILL.md');
          try {
            let content = await fs.readFile(targetSkillFile, 'utf-8');
            const updatedContent = content.replace(/^(name:\s*)([^\r\n]+)/m, (match, prefix, nameVal) => {
              const lowerNameVal = nameVal.trim().toLowerCase();
              return prefix + lowerNameVal;
            });
            if (content !== updatedContent) {
              await fs.writeFile(targetSkillFile, updatedContent, 'utf-8');
            }
          } catch (e) {
            // ignore frontmatter normalization issues on individual files
          }

          migrated++;
          console.log(chalk.green(`  ✅ ${skill} -> ${skill.toLowerCase()}`));
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

async function createPAIAgent(adapter: KiroAdapter): Promise<void> {
  console.log(chalk.yellow('\n🤖 Creating PAI custom agent...\n'));

  await adapter.createCustomAgent({
    name: 'pai',
    description: 'Personal AI Infrastructure agent with full PAI capabilities',
    prompt: `You are a Personal AI Infrastructure (PAI) agent. You help users achieve their ideal state by:

1. Understanding their TELOS (goals, mission, beliefs)
2. Using the Algorithm v6.3.0 (OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN)
3. Leveraging 45+ specialized skills
4. Maintaining persistent memory across sessions
5. Continuously learning and improving

Always prioritize the user's ideal state and long-term goals over short-term convenience.`,
    tools: ['*'], // All tools
    resources: [
      "skill://.kiro/skills/**/SKILL.md",
      "skill:///home/ubuntu/.kiro/skills/**/SKILL.md",
      "skill://~/.kiro/skills/**/SKILL.md"
    ]
  });

  console.log(chalk.green('✅ PAI agent created\n'));
}

async function createWelcomeMessage(adapter: KiroAdapter): Promise<void> {
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
kiro-cli chat --agent pai
\`\`\`

### 2. Define Your TELOS
Tell PAI about your goals, mission, and beliefs. This is crucial!

### 3. Use PAI Skills
PAI has 45+ skills available. Just describe what you need and PAI will use the right skill.

## Key Differences from Kiro IDE

- ❌ **No Specs** - Kiro CLI doesn't have specs system
- ❌ **No Steering Directory** - Context is injected via agent prompt field
- ✅ **Custom Agents** - Create specialized agents for different workflows
- ✅ **Terminal-based** - All interaction through CLI
- ✅ **Hooks in Agent Config** - Hooks are defined in agent JSON files

## Configuration Files

- **Agent Config**: \`~/.kiro/agents/pai.json\`
- **Skills**: \`~/.kiro/skills/\` (global)
- **Hooks**: \`~/.kiro/hooks/\` (global)
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

async function createGlobalPrompts(adapter: KiroAdapter): Promise<void> {
  const promptsDir = path.join(os.homedir(), '.kiro', 'prompts');
  console.log(chalk.yellow('\n📝 Creating global prompt shortcuts for skills...\n'));
  
  await fs.mkdir(promptsDir, { recursive: true });
  
  await fs.writeFile(
    path.join(promptsDir, 'interview.md'),
    'start the interview $ARGUMENTS',
    'utf-8'
  );
  
  await fs.writeFile(
    path.join(promptsDir, 'telos.md'),
    'review TELOS $ARGUMENTS',
    'utf-8'
  );
  
  console.log(chalk.green('✅ Registered global prompts: @interview and @telos'));
}

function printNextSteps(): void {
  console.log(chalk.cyan('📚 Next Steps:\n'));
  console.log(chalk.white('1. Start Kiro CLI with PAI agent:'));
  console.log(chalk.gray('   kiro-cli chat --agent pai\n'));
  console.log(chalk.white('2. Use @interview or @telos to trigger the respective workflows!\n'));
  console.log(chalk.white('3. Define your TELOS (goals, mission, beliefs)\n'));
  console.log(chalk.white('4. Start using PAI skills and capabilities!\n'));
  
  console.log(chalk.cyan('📖 Documentation:\n'));
  console.log(chalk.gray(`   Welcome: ~/.kiro/pai/WELCOME.md`));
  console.log(chalk.gray(`   Agent Config: ~/.kiro/agents/pai.json\n`));
}

// Run installer
main().catch((error) => {
  console.error(chalk.red('\n❌ Installation failed:'), error);
  process.exit(1);
});
