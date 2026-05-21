# PAI-Kiro Migration Guide

**Version:** 0.1.0  
**Last Updated:** 2026-05-21

---

## Overview

This guide helps you migrate from PAI on Claude Code to PAI on Kiro IDE, or set up PAI on Kiro from scratch.

## Prerequisites

Before starting, ensure you have:

- ✅ **Kiro IDE** installed ([kiro.dev](https://kiro.dev))
- ✅ **Bun runtime** (v1.0.0+)
- ✅ **Git** for version control
- ✅ (Optional) Existing PAI installation at `~/.claude/`

## Installation Methods

### Method 1: Fresh Installation (No Existing PAI)

```bash
cd /home/ubuntu/PAI-kiro/kiro-adapter
bun install
bun run install:kiro
```

The installer will:
1. Check prerequisites
2. Initialize Kiro adapter
3. Setup directory structure
4. Create core hooks
5. Generate welcome message

### Method 2: Migration from Claude Code PAI

```bash
cd /home/ubuntu/PAI-kiro/kiro-adapter
bun install
bun run install:kiro
```

When prompted:
- ✅ Select "Yes" to migrate from existing PAI
- 📁 Enter path to PAI: `~/.claude/`
- ✅ Select "Yes" to migrate skills
- ✅ Select "Yes" to migrate TELOS

The installer will:
1. Backup existing Kiro config
2. Copy PAI skills to `.kiro/skills/`
3. Copy TELOS to `~/.kiro/pai/USER/TELOS/`
4. Convert hooks to Kiro format
5. Setup steering files

## Directory Structure After Installation

```
~/.kiro/
├── pai/                          # PAI configuration
│   ├── MEMORY/                   # Memory system
│   │   ├── WORK/                 # Active tasks
│   │   ├── KNOWLEDGE/            # Knowledge graph
│   │   ├── LEARNING/             # Meta-patterns
│   │   ├── RELATIONSHIP/         # DA-Principal notes
│   │   ├── OBSERVABILITY/        # Tool logs
│   │   └── STATE/                # Session registry
│   ├── USER/                     # User context
│   │   ├── TELOS/                # Goals, mission, beliefs
│   │   ├── DA_IDENTITY.md        # Digital Assistant identity
│   │   └── PRINCIPAL_IDENTITY.md # Your identity
│   └── WELCOME.md                # Getting started guide
│
├── steering/                     # Global steering files
│   ├── pai-system.md             # System prompt
│   ├── pai-algorithm.md          # Algorithm context
│   └── pai-telos.md              # TELOS context
│
└── skills/                       # Global skills (optional)

.kiro/                            # Workspace-specific
├── skills/                       # Workspace skills
├── hooks/                        # Workspace hooks
└── steering/                     # Workspace steering
```

## Feature Mapping: Claude Code → Kiro

### 1. Context System

| Claude Code | Kiro | Location |
|-------------|------|----------|
| `CLAUDE.md` | Global steering (always) | `~/.kiro/steering/pai-system.md` |
| `PAI_SYSTEM_PROMPT.md` | Global steering (always) | `~/.kiro/steering/pai-system.md` |
| Session context | Workspace steering | `.kiro/steering/` |

**Migration:**
```bash
# Automatic during installation
# Or manually:
cp ~/.claude/CLAUDE.md ~/.kiro/steering/pai-system.md
```

### 2. Skills System

| Claude Code | Kiro | Compatibility |
|-------------|------|---------------|
| `~/.claude/skills/` | `~/.kiro/skills/` (global) | ✅ 100% |
| Project skills | `.kiro/skills/` (workspace) | ✅ 100% |

**Migration:**
```bash
# Automatic during installation
# Or manually:
cp -r ~/.claude/skills/* ~/.kiro/skills/
```

**Note:** PAI skills already follow the Agent Skills standard, so they work directly in Kiro!

### 3. Hook System

| PAI Hook | Kiro Hook | Status |
|----------|-----------|--------|
| `SessionStart` | Manual Trigger | ⚠️ Workaround |
| `UserPromptSubmit` | `PromptSubmit` | ✅ Direct |
| `PreToolUse` | `PreToolUse` | ✅ Direct |
| `PostToolUse` | `PostToolUse` | ✅ Direct |
| `Stop` | `AgentStop` | ✅ Direct |
| `SubagentStop` | Custom | ⚠️ Workaround |
| `PreCompact` | N/A | ❌ Not needed |
| `SessionEnd` | Manual Trigger | ⚠️ Workaround |

**Migration:**
Hooks are automatically converted during installation. Check `.kiro/hooks/` for converted hooks.

**Manual hook creation:**
```json
{
  "title": "PAI-PromptProcessing",
  "description": "Classify prompt mode (MINIMAL/NATIVE/ALGORITHM)",
  "event": "PromptSubmit",
  "action": "ask-kiro",
  "instructions": "Analyze the prompt and classify as MINIMAL, NATIVE, or ALGORITHM mode..."
}
```

### 4. ISA ↔ Specs

| PAI | Kiro | Conversion |
|-----|------|------------|
| `ISA.md` (12 sections) | `requirements.md` + `design.md` + `tasks.md` | ✅ Bidirectional |
| ISC criteria | Acceptance criteria | ✅ Mapped |
| Verification | Task completion | ✅ Synced |

**Usage:**
```typescript
import { SpecConverter } from '@pai/kiro-adapter';

const converter = new SpecConverter();

// ISA → Kiro Spec
await converter.syncISAWithSpec(
  '/path/to/ISA.md',
  '.kiro/specs/my-feature'
);

// Kiro Spec → ISA
await converter.syncSpecWithISA(
  '.kiro/specs/my-feature',
  '/path/to/ISA.md'
);
```

### 5. Memory System

| Component | Location | Compatibility |
|-----------|----------|---------------|
| WORK | `~/.kiro/pai/MEMORY/WORK/` | ✅ 100% |
| KNOWLEDGE | `~/.kiro/pai/MEMORY/KNOWLEDGE/` | ✅ 100% |
| LEARNING | `~/.kiro/pai/MEMORY/LEARNING/` | ✅ 100% |
| OBSERVABILITY | `~/.kiro/pai/MEMORY/OBSERVABILITY/` | ✅ 100% |

**Migration:**
```bash
# Automatic during installation
# Or manually:
cp -r ~/.claude/PAI/MEMORY/* ~/.kiro/pai/MEMORY/
```

## Post-Installation Setup

### 1. Run the Interview

Define your TELOS (goals, mission, beliefs):

```
/interview
```

This will guide you through:
- Mission statement
- Life goals
- Core beliefs
- Wisdom and mental models
- Challenges and narratives

### 2. Verify Installation

Check that everything is set up correctly:

```bash
# Check steering files
ls -la ~/.kiro/steering/

# Check skills
ls -la ~/.kiro/skills/

# Check hooks
ls -la .kiro/hooks/

# Check memory structure
ls -la ~/.kiro/pai/MEMORY/
```

### 3. Test Core Functionality

Create a test spec to verify ISA conversion:

```typescript
import { KiroAdapter, PAICore, SpecConverter } from '@pai/kiro-adapter';

// Initialize
const adapter = new KiroAdapter();
await adapter.initialize();

const pai = new PAICore({ adapter });
await pai.initialize();

// Test spec creation
const specId = await adapter.createSpec({
  type: 'feature',
  title: 'Test Feature',
  requirements: '# Requirements\n\nTest requirements',
  design: '# Design\n\nTest design',
  tasks: [],
});

console.log('Spec created:', specId);
```

## Known Limitations

### Cannot Be Migrated

1. ❌ **Pulse Daemon** - Kiro doesn't have equivalent
   - **Workaround:** Standalone daemon (future release)
   - **Impact:** No voice notifications, no Life Dashboard

2. ❌ **Context Compaction** - Kiro has own system
   - **Workaround:** Use Kiro's native context management
   - **Impact:** Different context handling

3. ❌ **Subagent System** - Different architecture
   - **Workaround:** Use Kiro's agent teams
   - **Impact:** Different agent coordination

### Workarounds Required

1. ⚠️ **SessionStart/SessionEnd Hooks**
   - **Solution:** Use Manual Trigger hooks
   - **Setup:** Create init/cleanup scripts

2. ⚠️ **Voice Notifications**
   - **Solution:** Use system notifications
   - **Setup:** Configure OS notifications

3. ⚠️ **Life Dashboard**
   - **Solution:** Standalone web app (future)
   - **Current:** Use Kiro's native UI

## Troubleshooting

### Issue: Skills Not Loading

**Symptoms:** Skills don't appear in Kiro

**Solution:**
```bash
# Check skill format
cat ~/.kiro/skills/Research/SKILL.md

# Verify frontmatter
head -n 10 ~/.kiro/skills/Research/SKILL.md

# Should see:
# ---
# name: research
# description: Research topics using multiple sources
# ---
```

### Issue: Hooks Not Firing

**Symptoms:** Hooks don't execute on events

**Solution:**
```bash
# Check hook files
ls -la .kiro/hooks/

# Verify hook format
cat .kiro/hooks/PAI-PromptProcessing.json

# Check Kiro logs
# In Kiro: View → Output → Kiro - MCP Logs
```

### Issue: TELOS Not Loading

**Symptoms:** DA doesn't know your goals

**Solution:**
```bash
# Check TELOS location
ls -la ~/.kiro/pai/USER/TELOS/

# Verify steering file
cat ~/.kiro/steering/pai-telos.md

# Re-run interview
/interview
```

### Issue: Memory Not Persisting

**Symptoms:** Knowledge doesn't carry over

**Solution:**
```bash
# Check memory directory
ls -la ~/.kiro/pai/MEMORY/

# Verify write permissions
touch ~/.kiro/pai/MEMORY/test.txt
rm ~/.kiro/pai/MEMORY/test.txt

# Check observability logs
tail -f ~/.kiro/pai/MEMORY/OBSERVABILITY/tool-activity.jsonl
```

## Advanced Configuration

### Custom Steering Files

Create project-specific context:

```bash
# Create workspace steering
mkdir -p .kiro/steering

# Create steering file
cat > .kiro/steering/project-context.md << 'EOF'
---
inclusion: always
---

# Project Context

This project uses:
- TypeScript with Bun runtime
- PAI for AI infrastructure
- Kiro IDE for development

## Conventions

- Use async/await for all async operations
- Follow PAI naming conventions
- Document all public APIs
EOF
```

### Custom Hooks

Create project-specific automation:

```json
{
  "title": "Auto-Format-On-Save",
  "description": "Format TypeScript files on save",
  "event": "FileSave",
  "filePattern": "*.ts",
  "action": "run-command",
  "command": "bun run format"
}
```

### Custom Skills

Create project-specific skills:

```bash
mkdir -p .kiro/skills/MySkill

cat > .kiro/skills/MySkill/SKILL.md << 'EOF'
---
name: my-skill
description: Custom skill for my project
---

# My Skill

This skill does X, Y, Z.

## Usage

Invoke with: /my-skill
EOF
```

## Performance Optimization

### Reduce Context Size

Use conditional steering:

```markdown
---
inclusion: fileMatch
fileMatchPattern: "src/**/*.ts"
---

# TypeScript Context

Only loaded when working with TypeScript files.
```

### Optimize Hook Execution

Use specific tool filters:

```json
{
  "event": "PreToolUse",
  "toolName": "write",
  "action": "ask-kiro"
}
```

### Memory Cleanup

Periodically archive old memory:

```bash
# Archive old work
mv ~/.kiro/pai/MEMORY/WORK/old-project \
   ~/.kiro/pai/MEMORY/ARCHIVE/

# Compress observability logs
gzip ~/.kiro/pai/MEMORY/OBSERVABILITY/*.jsonl
```

## Next Steps

1. ✅ Complete installation
2. ✅ Run `/interview` to setup TELOS
3. ✅ Test core functionality
4. 📖 Read [KIRO_ADAPTATION.md](./KIRO_ADAPTATION.md) for architecture
5. 🚀 Start using PAI on Kiro!

## Support

- **Issues:** https://github.com/ylxai/PAI-kiro/issues
- **Discussions:** https://github.com/ylxai/PAI-kiro/discussions
- **Original PAI:** https://github.com/danielmiessler/Personal_AI_Infrastructure
- **Kiro Docs:** https://kiro.dev/docs

---

**Welcome to PAI on Kiro!** 🎉
