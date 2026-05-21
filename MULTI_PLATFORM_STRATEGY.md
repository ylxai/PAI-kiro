# PAI Multi-Platform Strategy

**Date:** 2026-05-21  
**Goal:** Extend PAI (Personal AI Infrastructure) to support multiple platforms  
**Current State:** PAI v5.0.0 only supports Claude Code  
**Target Platforms:** Kiro CLI, OpenCode, and future platforms

---

## 🎯 Vision

Transform PAI from a **Claude Code-only** system into a **universal AI infrastructure** that works across multiple AI coding platforms while maintaining the core Life OS philosophy.

---

## 📊 Current State Analysis

### PAI v5.0.0 (Claude Code Only)

**Core Components:**
- ✅ **Pulse** - Life Dashboard (port 31337)
- ✅ **The DA** - Digital Assistant identity
- ✅ **Algorithm v6.3.0** - 7-phase problem-solving loop
- ✅ **ISA** - Ideal State Artifact primitive
- ✅ **Memory System** - WORK, KNOWLEDGE, LEARNING, etc.
- ✅ **45 Skills** - Specialized capabilities
- ✅ **37 Hooks** - Lifecycle automation
- ✅ **171 Workflows** - Task automation

**Platform Dependencies:**
- ❌ **Claude Code Specific** - Hooks, context system, file structure
- ❌ **TypeScript/Bun** - Implementation language
- ❌ **~/.claude/** - Hardcoded directory structure
- ❌ **CLAUDE.md** - Context file format

---

## 🏗️ Multi-Platform Architecture

### Layer 1: PAI Core (Platform Agnostic)
```
PAI-Core/
├── Algorithm/           # Universal problem-solving system
├── Memory/             # Platform-agnostic memory system
├── Skills/             # Core skill definitions
├── ISA/                # Ideal State Artifact system
├── TELOS/              # User goals and mission
└── DA/                 # Digital Assistant identity
```

### Layer 2: Platform Adapters
```
Adapters/
├── ClaudeCodeAdapter/  # Original implementation
├── KiroCLIAdapter/     # Kiro CLI support
├── OpenCodeAdapter/    # OpenCode support
└── UniversalAdapter/   # Base adapter interface
```

### Layer 3: Platform-Specific Implementations
```
Platforms/
├── claude-code/
│   ├── hooks/          # Claude Code hooks
│   ├── .claude/        # Claude Code structure
│   └── CLAUDE.md       # Claude Code context
│
├── kiro-cli/
│   ├── hooks/          # Kiro CLI hooks (shell scripts)
│   ├── .kiro/          # Kiro CLI structure
│   └── steering/       # Kiro CLI context
│
└── opencode/
    ├── hooks/          # OpenCode hooks
    ├── .opencode/      # OpenCode structure
    └── context/        # OpenCode context
```

---

## 🔄 Platform Comparison Matrix

| Feature | Claude Code | Kiro CLI | OpenCode | Universal |
|---------|-------------|----------|----------|-----------|
| **Context System** | CLAUDE.md | Steering files | TBD | Abstracted |
| **Hook System** | 8 types (TS) | 5 types (Shell) | TBD | Mapped |
| **Skills Format** | Custom | Agent Skills | TBD | Standardized |
| **Directory** | ~/.claude/ | ~/.kiro/ | ~/.opencode/ | Configurable |
| **Config Format** | JSON | JSON/YAML | TBD | Unified |
| **MCP Support** | ✅ Yes | ✅ Yes | TBD | Yes |
| **Custom Agents** | Limited | ✅ Native | TBD | Supported |

---

## 🚀 Implementation Strategy

### Phase 1: Extract PAI Core (Week 1-2)
**Goal:** Separate platform-agnostic logic from Claude Code specifics

**Tasks:**
1. Create PAI-Core package
   - Extract Algorithm (platform agnostic)
   - Extract Memory system (file-based, universal)
   - Extract ISA system (universal format)
   - Extract TELOS system (universal)
   - Extract DA identity (universal)

2. Define Platform Adapter Interface
   ```typescript
   interface PlatformAdapter {
     // Context Management
     loadContext(): Promise<Context>
     saveContext(context: Context): Promise<void>
     
     // Hook System
     registerHook(hook: Hook): Promise<void>
     executeHook(event: HookEvent): Promise<void>
     
     // Skills System
     loadSkills(): Promise<Skill[]>
     executeSkill(skill: Skill, params: any): Promise<any>
     
     // Memory System
     readMemory(path: string): Promise<any>
     writeMemory(path: string, data: any): Promise<void>
     
     // Configuration
     getConfig(): PlatformConfig
     setConfig(config: PlatformConfig): Promise<void>
   }
   ```

3. Create ClaudeCodeAdapter (refactor existing)
   - Wrap existing Claude Code implementation
   - Implement PlatformAdapter interface
   - Maintain backward compatibility

**Deliverables:**
- PAI-Core package (platform agnostic)
- PlatformAdapter interface
- ClaudeCodeAdapter (existing code wrapped)
- Documentation

### Phase 2: Kiro CLI Adapter (Week 3-4)
**Goal:** Implement full Kiro CLI support

**Tasks:**
1. Create KiroCLIAdapter
   - Implement PlatformAdapter interface
   - Map hooks (TypeScript → Shell)
   - Map context (CLAUDE.md → Steering)
   - Map directory structure

2. Hook Conversion System
   - Convert 37 PAI hooks to Kiro CLI format
   - Handle JSON I/O in shell scripts
   - Map exit codes correctly

3. Skills Migration
   - Convert 45 skills to Kiro CLI format
   - Use Agent Skills standard
   - Test activation

4. Testing & Validation
   - Test on clean Kiro CLI installation
   - Validate all features work
   - Performance testing

**Deliverables:**
- KiroCLIAdapter fully functional
- 37 hooks converted
- 45 skills working
- Test suite
- Documentation

### Phase 3: OpenCode Adapter (Week 5-6)
**Goal:** Implement OpenCode support

**Tasks:**
1. Research OpenCode architecture
   - Study OpenCode documentation
   - Understand hook system
   - Understand context system
   - Understand skills system

2. Create OpenCodeAdapter
   - Implement PlatformAdapter interface
   - Map PAI features to OpenCode
   - Handle platform differences

3. Testing & Validation
   - Test on OpenCode
   - Validate features
   - Fix issues

**Deliverables:**
- OpenCodeAdapter functional
- Documentation
- Test suite

### Phase 4: Universal Installer (Week 7-8)
**Goal:** One installer for all platforms

**Tasks:**
1. Create Universal Installer
   ```bash
   curl -sSL https://pai.ai/install.sh | bash
   
   # Detects platform automatically:
   # - Claude Code
   # - Kiro CLI
   # - OpenCode
   # - Or prompts user to choose
   ```

2. Platform Detection
   - Auto-detect installed platforms
   - Allow manual selection
   - Support multiple platforms simultaneously

3. Migration Tools
   - Migrate between platforms
   - Export/import PAI data
   - Preserve user data

**Deliverables:**
- Universal installer
- Migration tools
- Documentation

---

## 📁 New Repository Structure

```
Personal_AI_Infrastructure/
├── core/                       # Platform-agnostic PAI core
│   ├── algorithm/              # Algorithm v6.3.0
│   ├── memory/                 # Memory system
│   ├── isa/                    # ISA system
│   ├── telos/                  # TELOS system
│   ├── da/                     # DA identity
│   └── skills/                 # Core skill definitions
│
├── adapters/                   # Platform adapters
│   ├── base/                   # Base adapter interface
│   ├── claude-code/            # Claude Code adapter
│   ├── kiro-cli/               # Kiro CLI adapter
│   └── opencode/               # OpenCode adapter
│
├── platforms/                  # Platform-specific implementations
│   ├── claude-code/
│   │   ├── hooks/
│   │   ├── skills/
│   │   └── config/
│   ├── kiro-cli/
│   │   ├── hooks/
│   │   ├── skills/
│   │   └── config/
│   └── opencode/
│       ├── hooks/
│       ├── skills/
│       └── config/
│
├── tools/                      # Universal tools
│   ├── installer/              # Universal installer
│   ├── migrator/               # Platform migration
│   └── validator/              # Validation tools
│
├── docs/                       # Documentation
│   ├── architecture/           # Architecture docs
│   ├── platforms/              # Platform-specific docs
│   └── guides/                 # User guides
│
└── Releases/                   # Releases (existing)
    └── v5.0.0/                 # Current release (Claude Code)
```

---

## 🎯 Success Criteria

### Technical Success
- ✅ PAI Core is 100% platform agnostic
- ✅ All platforms implement PlatformAdapter interface
- ✅ Skills work across all platforms
- ✅ Memory system is universal
- ✅ One installer for all platforms
- ✅ Migration between platforms works

### User Success
- ✅ Users can choose their preferred platform
- ✅ Switching platforms preserves data
- ✅ Installation is simple (one command)
- ✅ Documentation is clear
- ✅ Community adoption grows

---

## 📊 Compatibility Goals

| Component | Target Compatibility |
|-----------|---------------------|
| Algorithm | 100% (universal) |
| Memory | 100% (file-based) |
| ISA | 100% (universal format) |
| TELOS | 100% (universal) |
| DA Identity | 100% (universal) |
| Skills | 90%+ (platform-specific adaptations) |
| Hooks | 80%+ (platform differences) |
| Pulse | 70%+ (may need platform variants) |

---

## 🔮 Future Platforms

After proving the multi-platform architecture with Kiro CLI and OpenCode:

1. **Cursor** - Popular VS Code fork
2. **Windsurf** - AI-powered IDE
3. **Aider** - Terminal-based AI coding
4. **Continue** - VS Code extension
5. **Cody** - Sourcegraph's AI assistant

---

## 💡 Key Principles

1. **Core First** - PAI Core must be 100% platform agnostic
2. **Adapter Pattern** - Each platform gets a clean adapter
3. **User Data Sacred** - User data (TELOS, Memory) is universal
4. **One Installer** - Single entry point for all platforms
5. **Community Driven** - Open for community platform adapters
6. **Backward Compatible** - Existing Claude Code users unaffected

---

## 📝 Next Steps

1. **Create new branch**: `multi-platform-support`
2. **Extract PAI Core** from Claude Code implementation
3. **Define PlatformAdapter interface**
4. **Implement ClaudeCodeAdapter** (wrap existing)
5. **Implement KiroCLIAdapter** (new)
6. **Test both platforms**
7. **Create universal installer**
8. **Update documentation**
9. **Community feedback**
10. **Iterate and improve**

---

**This is a much bigger and more impactful project than just adapting PAI to Kiro CLI. We're making PAI truly universal!** 🚀
