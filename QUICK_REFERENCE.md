# PAI-Kiro Quick Reference

**Version:** 0.1.0  
**Last Updated:** 2026-05-21

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/ylxai/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependencies
bun install

# Run installer
bun run install:kiro

# Open Kiro and run interview
/interview
```

---

## 📁 Directory Structure

```
~/.kiro/
├── pai/                    # PAI configuration
│   ├── MEMORY/            # Memory system
│   ├── USER/              # User context
│   └── WELCOME.md         # Getting started
├── steering/              # Global context
└── skills/                # Global skills

.kiro/                     # Workspace
├── skills/                # Workspace skills
├── hooks/                 # Workspace hooks
├── steering/              # Workspace context
└── specs/                 # Kiro specs
```

---

## 🎯 Core Commands

### Installation
```bash
bun run install:kiro        # Install PAI on Kiro
bun run build               # Build TypeScript
bun run dev                 # Development mode
bun test                    # Run tests
```

### In Kiro IDE
```
/interview                  # Setup TELOS
/skills                     # List skills
/hooks                      # List hooks
/memory                     # Access memory
```

---

## 🔧 Configuration Files

### package.json
```json
{
  "name": "@pai/kiro-adapter",
  "version": "0.1.0",
  "scripts": {
    "install:kiro": "bun run src/cli/install.ts"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `src/adapters/PlatformAdapter.ts` | Universal interface |
| `src/adapters/KiroAdapter.ts` | Kiro implementation |
| `src/core/PAICore.ts` | Platform-agnostic core |
| `src/kiro/SpecConverter.ts` | ISA ↔ Spec converter |
| `src/cli/install.ts` | Installation CLI |

---

## 🪝 Hook Mapping

| PAI Hook | Kiro Hook | Status |
|----------|-----------|--------|
| `UserPromptSubmit` | `PromptSubmit` | ✅ |
| `PreToolUse` | `PreToolUse` | ✅ |
| `PostToolUse` | `PostToolUse` | ✅ |
| `Stop` | `AgentStop` | ✅ |
| `SessionStart` | `ManualTrigger` | ⚠️ |
| `SessionEnd` | `ManualTrigger` | ⚠️ |

---

## 🎯 Skills System

### Skills Location
- Global: `~/.kiro/skills/`
- Workspace: `.kiro/skills/`

### Skill Format (Agent Skills Standard)
```markdown
---
name: skill-name
description: When to use this skill
---

# Skill Name

Instructions here...
```

### Example Skills
- Research
- Council
- RedTeam
- FirstPrinciples
- ISA
- Knowledge
- (42 more...)

---

## 🧠 Memory System

### Memory Structure
```
~/.kiro/pai/MEMORY/
├── WORK/              # Active tasks
├── KNOWLEDGE/         # Knowledge graph
│   ├── People/
│   ├── Companies/
│   ├── Ideas/
│   ├── Research/
│   └── Blogs/
├── LEARNING/          # Meta-patterns
├── RELATIONSHIP/      # DA-Principal notes
├── OBSERVABILITY/     # Tool logs
└── STATE/             # Session registry
```

---

## 📋 ISA ↔ Spec Conversion

### ISA to Kiro Spec
```typescript
import { SpecConverter } from '@pai/kiro-adapter';

const converter = new SpecConverter();
await converter.syncISAWithSpec(
  '/path/to/ISA.md',
  '.kiro/specs/my-feature'
);
```

### Kiro Spec to ISA
```typescript
await converter.syncSpecWithISA(
  '.kiro/specs/my-feature',
  '/path/to/ISA.md'
);
```

---

## 🎨 Steering Files

### Global Steering (Always Loaded)
```markdown
---
inclusion: always
---

# System Context

Your global context here...
```

### Conditional Steering (File Match)
```markdown
---
inclusion: fileMatch
fileMatchPattern: "src/**/*.ts"
---

# TypeScript Context

Only loaded for TypeScript files...
```

### Auto Steering (Smart Activation)
```markdown
---
inclusion: auto
name: api-design
description: REST API design patterns
---

# API Design

Loaded when working on APIs...
```

---

## 🔍 Troubleshooting

### Skills Not Loading
```bash
# Check skill format
cat ~/.kiro/skills/Research/SKILL.md

# Verify frontmatter
head -n 10 ~/.kiro/skills/Research/SKILL.md
```

### Hooks Not Firing
```bash
# Check hook files
ls -la .kiro/hooks/

# View hook content
cat .kiro/hooks/PAI-PromptProcessing.json
```

### Memory Not Persisting
```bash
# Check memory directory
ls -la ~/.kiro/pai/MEMORY/

# Test write permissions
touch ~/.kiro/pai/MEMORY/test.txt
rm ~/.kiro/pai/MEMORY/test.txt
```

---

## 📊 Compatibility Matrix

| Feature | Compatibility |
|---------|---------------|
| Skills | 100% ✅ |
| Memory | 100% ✅ |
| MCP | 100% ✅ |
| TELOS | 100% ✅ |
| Hooks | 80% ✅ |
| Context | 90% ✅ |
| ISA ↔ Specs | 70% ✅ |

---

## 🐛 Common Issues

### Issue: Bun not found
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

### Issue: Kiro not detected
```bash
# Check Kiro installation
ls -la ~/.kiro/
```

### Issue: TypeScript errors
```bash
# Rebuild
bun run build
```

---

## 📚 Documentation Links

- [Architecture](./KIRO_ADAPTATION.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Development Summary](./DEVELOPMENT_SUMMARY.md)
- [Next Steps](./NEXT_STEPS.md)
- [Original PAI](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- [Kiro Docs](https://kiro.dev/docs)

---

## 🤝 Getting Help

- **GitHub Issues:** https://github.com/ylxai/PAI-kiro/issues
- **Discussions:** https://github.com/ylxai/PAI-kiro/discussions
- **PAI Discord:** https://danielmiessler.com/upgrade

---

## 📈 Project Status

- **Phase 1:** ✅ Complete (Foundation)
- **Phase 2:** ⏳ Next (Skills & Hooks)
- **Phase 3:** 📅 Planned (ISA & Algorithm)
- **Phase 4:** 💭 Future (Pulse & Dashboard)

---

## 🎯 Quick Tips

1. **Always run `/interview` first** - Sets up your TELOS
2. **Use global steering for system context** - `~/.kiro/steering/`
3. **Use workspace steering for project context** - `.kiro/steering/`
4. **Skills are auto-activated** - Just describe what you need
5. **Hooks fire automatically** - Check `.kiro/hooks/` for active hooks
6. **Memory compounds over time** - The more you use it, the smarter it gets

---

## 🚀 Performance Tips

1. **Use conditional steering** - Only load context when needed
2. **Optimize hook execution** - Use specific tool filters
3. **Archive old memory** - Keep memory directory clean
4. **Use workspace skills** - Faster than global skills

---

## 🔐 Security Notes

1. **Never commit secrets** - Use `.gitignore`
2. **Review hooks before enabling** - Understand what they do
3. **Use protected paths** - Prevent accidental overwrites
4. **Backup regularly** - `cp -r ~/.kiro ~/.kiro.backup`

---

## 📝 Version History

- **v0.1.0** (2026-05-21) - Initial release
  - Platform adapter interface
  - Kiro adapter implementation
  - PAI Core
  - ISA ↔ Spec converter
  - Installation CLI
  - Documentation

---

## 🎉 Success Checklist

- [ ] Installation completed
- [ ] `/interview` run
- [ ] TELOS defined
- [ ] Skills loading
- [ ] Hooks firing
- [ ] Memory persisting
- [ ] First task completed

---

**Quick Reference v0.1.0**  
**Last Updated:** 2026-05-21  
**Status:** Phase 1 Complete ✅
