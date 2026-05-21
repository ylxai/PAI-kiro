# PAI-Kiro Adaptation Plan

**Version:** 0.1.0  
**Date:** 2026-05-21  
**Status:** Planning Phase

---

## 🎯 Project Goal

Adapt Personal AI Infrastructure (PAI) v5.0.0 to support multiple platforms, starting with Kiro IDE, while maintaining full backward compatibility with Claude Code.

## 📊 Architecture Overview

```
PAI-Universal Architecture
┌─────────────────────────────────────────────────────────────┐
│                        PAI Core                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Algorithm   │  │    Memory    │  │    Skills    │      │
│  │   v6.3.0     │  │   System     │  │   System     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    TELOS     │  │     ISA      │  │    Hooks     │      │
│  │   System     │  │   System     │  │   System     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Platform Adapter      │
              │      Interface          │
              └─────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Claude Code  │    │     Kiro     │    │   OpenCode   │
│   Adapter    │    │   Adapter    │    │   Adapter    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 🔄 Platform Mapping

### Kiro vs Claude Code Feature Comparison

| Feature | Claude Code | Kiro | Compatibility | Notes |
|---------|-------------|------|---------------|-------|
| **Context System** | `CLAUDE.md` | Steering files | ✅ 90% | Direct mapping |
| **Skills** | Custom format | Agent Skills standard | ✅ 100% | Same standard! |
| **Hooks** | 8 lifecycle hooks | 9 trigger types | ✅ 80% | 5/8 direct mapping |
| **Specs/ISA** | ISA.md (12 sections) | requirements/design/tasks | ⚠️ 70% | Needs converter |
| **MCP** | Native support | Native support | ✅ 100% | Compatible |
| **Memory** | File-based | File-based | ✅ 100% | Platform agnostic |
| **Pulse Daemon** | Included | N/A | ⚠️ 50% | Needs standalone |

### Hook System Mapping

| PAI Hook | Kiro Hook | Status | Implementation |
|----------|-----------|--------|----------------|
| `SessionStart` | ❌ None | ⚠️ Workaround | Use Manual Trigger + init script |
| `UserPromptSubmit` | `PromptSubmit` | ✅ Direct | 1:1 mapping |
| `PreToolUse` | `PreToolUse` | ✅ Direct | 1:1 mapping with tool filters |
| `PostToolUse` | `PostToolUse` | ✅ Direct | 1:1 mapping with tool filters |
| `Stop` | `AgentStop` | ✅ Direct | 1:1 mapping |
| `SubagentStop` | ❌ None | ⚠️ Custom | Implement via agent teams |
| `PreCompact` | ❌ None | ❌ Skip | Not needed in Kiro |
| `SessionEnd` | ❌ None | ⚠️ Workaround | Use Manual Trigger + cleanup |

**Kiro Additional Hooks (Bonus):**
- ✅ `FileCreate` - New capability
- ✅ `FileSave` - New capability
- ✅ `FileDelete` - New capability
- ✅ `PreTaskExecution` - Spec integration
- ✅ `PostTaskExecution` - Spec integration

## 📁 Directory Structure

```
PAI-kiro/
├── Releases/v5.0.0/.claude/          # Original PAI (Claude Code)
│   ├── PAI/                          # Core PAI system
│   ├── skills/                       # PAI skills
│   ├── hooks/                        # Claude Code hooks
│   └── CLAUDE.md                     # Claude Code context
│
├── kiro-adapter/                     # NEW: Kiro adaptation layer
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── PlatformAdapter.ts    # Interface
│   │   │   ├── ClaudeCodeAdapter.ts  # Existing
│   │   │   └── KiroAdapter.ts        # NEW
│   │   ├── core/
│   │   │   ├── PAICore.ts            # Platform-agnostic
│   │   │   ├── Algorithm.ts          # Algorithm v6.3.0
│   │   │   ├── Memory.ts             # Memory system
│   │   │   └── Skills.ts             # Skills loader
│   │   ├── kiro/
│   │   │   ├── SpecConverter.ts      # ISA ↔ Specs
│   │   │   ├── HookConverter.ts      # Hook mapping
│   │   │   └── SteeringGenerator.ts  # Context injection
│   │   └── cli/
│   │       └── install.ts            # Universal installer
│   ├── package.json
│   └── tsconfig.json
│
├── kiro-config/                      # NEW: Kiro-specific configs
│   ├── steering/                     # Global steering files
│   │   ├── pai-system.md             # System prompt
│   │   ├── pai-telos.md              # User TELOS
│   │   └── pai-algorithm.md          # Algorithm context
│   ├── skills/                       # Converted PAI skills
│   └── hooks/                        # Converted PAI hooks
│
├── docs/
│   ├── ARCHITECTURE.md               # System architecture
│   ├── KIRO_MIGRATION.md             # Migration guide
│   └── API.md                        # Adapter API docs
│
└── scripts/
    ├── convert-skills.sh             # Skill converter
    ├── convert-hooks.sh              # Hook converter
    └── install-kiro.sh               # Kiro installer
```

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal:** Create abstraction layer and basic Kiro adapter

**Tasks:**
- [ ] Create `PlatformAdapter` interface
- [ ] Implement `KiroAdapter` basic structure
- [ ] Setup TypeScript project structure
- [ ] Create directory mapping system
- [ ] Implement basic context injection

**Deliverables:**
- Working TypeScript project
- Basic adapter that can read PAI config
- Documentation of adapter interface

### Phase 2: Hook System (Week 2-3)
**Goal:** Convert PAI hooks to Kiro format

**Tasks:**
- [ ] Implement hook converter utility
- [ ] Map 5 core hooks (PromptSubmit, PreToolUse, PostToolUse, Stop)
- [ ] Create workarounds for SessionStart/SessionEnd
- [ ] Test hook execution in Kiro
- [ ] Document hook limitations

**Deliverables:**
- Hook conversion script
- 5 working Kiro hooks
- Hook compatibility matrix

### Phase 3: Skills Migration (Week 3-4)
**Goal:** Migrate PAI skills to Kiro Agent Skills format

**Tasks:**
- [ ] Audit all 45 PAI skills
- [ ] Convert SKILL.md to Agent Skills standard
- [ ] Test skill activation in Kiro
- [ ] Create skill import script
- [ ] Validate skill compatibility

**Deliverables:**
- 45 converted skills
- Skill migration script
- Compatibility report

### Phase 4: Context System (Week 4-5)
**Goal:** Map PAI context to Kiro steering

**Tasks:**
- [ ] Convert `CLAUDE.md` to steering files
- [ ] Convert `PAI_SYSTEM_PROMPT.md` to global steering
- [ ] Implement TELOS → steering converter
- [ ] Setup DA_IDENTITY in steering
- [ ] Test context injection

**Deliverables:**
- Steering file generator
- TELOS converter
- Context validation tests

### Phase 5: ISA ↔ Specs (Week 5-6)
**Goal:** Bidirectional conversion between ISA and Kiro Specs

**Tasks:**
- [ ] Implement ISA → Specs converter
- [ ] Implement Specs → ISA converter
- [ ] Map ISC to acceptance criteria
- [ ] Sync Algorithm phases with Spec tasks
- [ ] Test round-trip conversion

**Deliverables:**
- Spec converter utility
- ISA/Spec sync system
- Conversion examples

### Phase 6: Memory System (Week 6-7)
**Goal:** Ensure Memory system works on Kiro

**Tasks:**
- [ ] Test file-based memory on Kiro
- [ ] Implement memory path resolver
- [ ] Test WORK/KNOWLEDGE/LEARNING structure
- [ ] Validate observability logging
- [ ] Test memory retrieval

**Deliverables:**
- Memory system tests
- Path configuration
- Observability integration

### Phase 7: Pulse Standalone (Week 7-8)
**Goal:** Create standalone Pulse daemon for Kiro

**Tasks:**
- [ ] Extract Pulse from Claude Code dependency
- [ ] Create standalone daemon
- [ ] Implement voice notifications
- [ ] Setup Life Dashboard
- [ ] Test daemon lifecycle

**Deliverables:**
- Standalone Pulse daemon
- Installation script
- Dashboard integration

### Phase 8: Testing & Documentation (Week 8-9)
**Goal:** Comprehensive testing and documentation

**Tasks:**
- [ ] End-to-end testing on Kiro
- [ ] Write migration guide
- [ ] Create video tutorials
- [ ] Document known limitations
- [ ] Prepare release notes

**Deliverables:**
- Test suite
- Migration guide
- User documentation
- Release v0.1.0

## 🎯 Success Criteria

### Minimum Viable Adapter (MVA)
- ✅ Skills work in Kiro (45 skills functional)
- ✅ 5 core hooks operational
- ✅ TELOS loaded as global steering
- ✅ Memory system functional
- ✅ Basic Algorithm execution

### Full Feature Parity
- ✅ All hooks converted (with workarounds)
- ✅ ISA ↔ Specs bidirectional conversion
- ✅ Pulse daemon standalone
- ✅ Life Dashboard accessible
- ✅ 90%+ feature compatibility

## 🔧 Technical Decisions

### Language & Runtime
- **TypeScript** for adapter layer (type safety)
- **Bun** as runtime (same as PAI)
- **Node.js** compatibility maintained

### File Structure
- Keep original PAI in `Releases/v5.0.0/.claude/`
- New adapter code in `kiro-adapter/`
- Kiro configs in `kiro-config/`
- No modification to original PAI files

### Configuration Strategy
- Use Kiro's native config locations
- Global steering: `~/.kiro/steering/`
- Workspace skills: `.kiro/skills/`
- Workspace hooks: `.kiro/hooks/`

### Backward Compatibility
- Original PAI must still work on Claude Code
- No breaking changes to PAI core
- Adapter is additive, not destructive

## 📝 Known Limitations

### Cannot Be Adapted
1. ❌ Context compaction (Kiro has own system)
2. ❌ Subagent system (Kiro uses agent teams)
3. ❌ `--append-system-prompt-file` (use steering)

### Workarounds Required
1. ⚠️ SessionStart/SessionEnd hooks (manual triggers)
2. ⚠️ Pulse daemon (standalone implementation)
3. ⚠️ ISA format (conversion layer)

### Platform Differences
1. Kiro uses Specs instead of ISA
2. Kiro has file-based hooks (Create/Save/Delete)
3. Kiro steering has inclusion modes

## 🤝 Contributing

This is an open-source adaptation project. Contributions welcome!

**Priority Areas:**
1. Hook converter improvements
2. ISA ↔ Specs converter
3. Skill compatibility testing
4. Documentation improvements
5. Bug reports and fixes

## 📚 References

- [PAI v5.0.0 Documentation](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- [Kiro Documentation](https://kiro.dev/docs)
- [Agent Skills Standard](https://agentskills.io)
- [MCP Protocol](https://modelcontextprotocol.io)

---

**Next Steps:**
1. Review this plan
2. Setup development environment
3. Start Phase 1: Foundation
4. Create first working prototype

**Questions? Issues?**
- GitHub Issues: https://github.com/ylxai/PAI-kiro/issues
- Discussions: https://github.com/ylxai/PAI-kiro/discussions
