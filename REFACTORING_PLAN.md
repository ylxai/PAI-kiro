# PAI-Kiro Refactoring Plan

**Date:** 2026-05-21  
**Goal:** Optimize PAI-kiro untuk full support dengan Kiro CLI  
**Status:** Planning Phase

---

## 🎯 Tujuan Refactoring

1. **Simplifikasi Arsitektur** - Fokus ke Kiro CLI, kurangi kompleksitas Kiro IDE
2. **Native Kiro CLI Integration** - Maksimalkan fitur native Kiro CLI
3. **Improve Developer Experience** - Instalasi lebih mudah, dokumentasi lebih jelas
4. **Better Hook System** - Mapping yang lebih akurat antara PAI hooks dan Kiro CLI hooks
5. **Remove Bun Dependency** - Gunakan Node.js atau alternatif yang lebih umum

---

## 🔍 Analisis Masalah Saat Ini

### 1. Dependency Issues
- ❌ **Bun Required** - Tidak semua user punya Bun installed
- ⚠️ **TypeScript Compilation** - Perlu build step sebelum run
- ⚠️ **Complex Setup** - Terlalu banyak langkah instalasi

### 2. Architecture Issues
- ⚠️ **Dual Platform Support** - Kiro IDE + CLI membuat kompleks
- ⚠️ **Over-Engineering** - Terlalu banyak abstraction untuk use case sederhana
- ❌ **Spec Converter** - Tidak digunakan di Kiro CLI

### 3. Hook System Issues
- ⚠️ **Hook Mapping** - Beberapa PAI hooks tidak ada di Kiro CLI
- ⚠️ **Hook Scripts** - Perlu generate shell scripts untuk setiap hook
- ❌ **SessionStart/SessionEnd** - Tidak ada equivalent di Kiro CLI

### 4. Documentation Issues
- ⚠️ **Mixed Focus** - Dokumentasi campur antara CLI dan IDE
- ⚠️ **Installation Steps** - Terlalu kompleks untuk pemula
- ⚠️ **Missing Examples** - Kurang contoh praktis

---

## 🏗️ Refactoring Strategy

### Phase 1: Simplify Dependencies ✅ (Priority: HIGH)

**Goal:** Remove Bun dependency, use Node.js/npm

**Changes:**
1. Convert TypeScript to JavaScript (atau keep TS tapi compile dulu)
2. Replace Bun-specific APIs dengan Node.js standard
3. Use npm/npx untuk installation
4. Create simple bash installer script

**Files to Modify:**
- `kiro-adapter/package.json` - Change scripts, remove Bun requirement
- `kiro-adapter/src/cli/install-cli.ts` - Convert to Node.js compatible
- `kiro-adapter/src/adapters/KiroCLIAdapter.ts` - Replace Bun.spawn with child_process

**New Files:**
- `install.sh` - Simple bash installer (no Bun required)
- `kiro-adapter/dist/` - Pre-compiled JavaScript files

### Phase 2: Focus on Kiro CLI Only ✅ (Priority: HIGH)

**Goal:** Remove Kiro IDE support, focus 100% on CLI

**Changes:**
1. Remove `KiroAdapter.ts` (IDE adapter)
2. Remove `SpecConverter.ts` (tidak digunakan di CLI)
3. Rename `KiroCLIAdapter.ts` → `KiroAdapter.ts`
4. Update all imports and references
5. Remove IDE-specific documentation

**Files to Remove:**
- `kiro-adapter/src/adapters/KiroAdapter.ts`
- `kiro-adapter/src/kiro/SpecConverter.ts`
- `kiro-adapter/src/cli/install.ts` (IDE installer)

**Files to Rename:**
- `KiroCLIAdapter.ts` → `KiroAdapter.ts`

**Files to Update:**
- `README.md` - Remove IDE references
- `KIRO_ADAPTATION.md` - Focus on CLI only
- All documentation files

### Phase 3: Improve Hook System ✅ (Priority: HIGH)

**Goal:** Better hook mapping dan implementation

**Changes:**
1. Create hook template generator
2. Pre-generate common hook scripts
3. Better error handling untuk missing hooks
4. Add hook testing utilities

**New Files:**
- `kiro-adapter/templates/hooks/` - Hook script templates
- `kiro-adapter/src/hooks/HookGenerator.ts` - Generate hook scripts
- `kiro-adapter/src/hooks/HookTester.ts` - Test hook execution

**Hook Templates to Create:**
```bash
# agentSpawn.sh - Initialize PAI context
# userPromptSubmit.sh - Process prompts
# preToolUse.sh - Validate tool usage
# postToolUse.sh - Track tool activity
# stop.sh - Capture learnings
```

### Phase 4: Simplify Installation ✅ (Priority: HIGH)

**Goal:** One-command installation

**Changes:**
1. Create `install.sh` script yang bisa di-curl
2. Auto-detect prerequisites
3. Auto-install missing dependencies
4. Interactive prompts dengan defaults
5. Rollback on failure

**New Installation Flow:**
```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/ylxai/PAI-kiro/main/install.sh | bash

# Or manual
git clone https://github.com/ylxai/PAI-kiro.git
cd PAI-kiro
./install.sh
```

**Install Script Features:**
- ✅ Check kiro-cli installed
- ✅ Check Node.js installed
- ✅ Create directory structure
- ✅ Copy steering files
- ✅ Generate hook scripts
- ✅ Create PAI agent config
- ✅ Migrate existing PAI (optional)
- ✅ Test installation
- ✅ Print next steps

### Phase 5: Better Steering Files ✅ (Priority: MEDIUM)

**Goal:** Optimize steering files untuk Kiro CLI

**Changes:**
1. Split large steering files into focused files
2. Add conditional loading based on context
3. Optimize token usage
4. Better organization

**New Steering Structure:**
```
~/.kiro/steering/
├── pai-core.md           # Core PAI concepts (always loaded)
├── pai-algorithm.md      # Algorithm v6.3.0
├── pai-telos.md          # User TELOS (generated from interview)
├── pai-skills.md         # Skills overview
└── pai-memory.md         # Memory system guide
```

### Phase 6: Improve Agent Configuration ✅ (Priority: MEDIUM)

**Goal:** Better PAI agent config untuk Kiro CLI

**Changes:**
1. Optimize agent resources
2. Better tool permissions
3. Pre-configure common hooks
4. Add agent variants (minimal, standard, full)

**Agent Variants:**
```json
// pai-minimal.json - Quick tasks
{
  "name": "pai-minimal",
  "resources": ["file://.kiro/steering/pai-core.md"],
  "tools": ["read", "write", "shell"],
  "hooks": []
}

// pai-standard.json - Normal usage
{
  "name": "pai",
  "resources": ["file://.kiro/steering/**/*.md"],
  "tools": ["*"],
  "hooks": [...]
}

// pai-full.json - All features
{
  "name": "pai-full",
  "resources": ["file://.kiro/steering/**/*.md"],
  "tools": ["*"],
  "hooks": [...],
  "mcpServers": {...}
}
```

### Phase 7: Add Testing & Validation ✅ (Priority: MEDIUM)

**Goal:** Ensure everything works

**Changes:**
1. Add installation tests
2. Add hook execution tests
3. Add steering file validation
4. Add agent config validation

**New Files:**
- `tests/install.test.sh` - Test installation
- `tests/hooks.test.sh` - Test hooks
- `tests/steering.test.sh` - Test steering files
- `tests/agent.test.sh` - Test agent config

### Phase 8: Improve Documentation ✅ (Priority: MEDIUM)

**Goal:** Clear, focused documentation

**Changes:**
1. Rewrite README for CLI only
2. Create step-by-step tutorial
3. Add troubleshooting guide
4. Add video walkthrough
5. Create FAQ

**Documentation Structure:**
```
docs/
├── README.md              # Overview
├── INSTALLATION.md        # Installation guide
├── QUICK_START.md         # Quick start tutorial
├── CONFIGURATION.md       # Configuration guide
├── HOOKS.md              # Hook system guide
├── STEERING.md           # Steering files guide
├── SKILLS.md             # Skills system guide
├── TROUBLESHOOTING.md    # Common issues
└── FAQ.md                # Frequently asked questions
```

---

## 📋 Implementation Checklist

### Week 1: Core Refactoring
- [ ] Remove Bun dependency
- [ ] Convert to Node.js compatible code
- [ ] Remove Kiro IDE support
- [ ] Simplify directory structure
- [ ] Create bash installer script

### Week 2: Hook System
- [ ] Create hook templates
- [ ] Implement hook generator
- [ ] Pre-generate common hooks
- [ ] Add hook testing
- [ ] Document hook system

### Week 3: Installation & Testing
- [ ] Create one-line installer
- [ ] Add installation tests
- [ ] Add validation tests
- [ ] Test on clean system
- [ ] Fix bugs found

### Week 4: Documentation & Polish
- [ ] Rewrite all documentation
- [ ] Create tutorial
- [ ] Add examples
- [ ] Create video walkthrough
- [ ] Update README

---

## 🎯 Success Criteria

### Technical Success
- ✅ No Bun dependency required
- ✅ One-command installation works
- ✅ All hooks execute correctly
- ✅ Steering files load properly
- ✅ Agent config works
- ✅ Tests pass

### User Success
- ✅ Installation takes < 2 minutes
- ✅ Documentation is clear
- ✅ Examples work out of box
- ✅ Troubleshooting guide helps
- ✅ Users can customize easily

---

## 🚀 Quick Wins (Do First)

1. **Create install.sh** - Simple bash script untuk instalasi
2. **Pre-compile TypeScript** - Commit compiled JS files
3. **Remove IDE references** - Clean up documentation
4. **Add examples/** - Practical examples
5. **Create TROUBLESHOOTING.md** - Common issues

---

## 📊 Impact Analysis

### High Impact Changes
1. ✅ Remove Bun dependency → Easier installation
2. ✅ One-line installer → Better UX
3. ✅ Focus on CLI only → Simpler codebase
4. ✅ Better documentation → Easier adoption

### Medium Impact Changes
1. ⚠️ Hook templates → Better hook system
2. ⚠️ Agent variants → More flexibility
3. ⚠️ Testing suite → More reliable

### Low Impact Changes
1. ℹ️ Directory reorganization → Cleaner structure
2. ℹ️ Code comments → Better maintainability

---

## 🔄 Migration Path

### For Existing Users
1. Backup current installation
2. Run new installer
3. Migrate TELOS if needed
4. Test basic functionality
5. Report issues

### For New Users
1. Run one-line installer
2. Follow quick start guide
3. Complete TELOS interview
4. Start using PAI

---

## 📝 Notes

### Keep
- ✅ Platform adapter pattern (good abstraction)
- ✅ PAI Core (platform agnostic)
- ✅ Memory system structure
- ✅ TELOS integration
- ✅ Hook system concept

### Remove
- ❌ Kiro IDE support
- ❌ Spec converter
- ❌ Bun dependency
- ❌ Complex installation
- ❌ IDE-specific code

### Improve
- ⚠️ Hook implementation
- ⚠️ Installation process
- ⚠️ Documentation
- ⚠️ Testing
- ⚠️ Error handling

---

## 🎉 Expected Outcomes

After refactoring:
1. **Easier Installation** - One command, no prerequisites
2. **Better Performance** - Less overhead, faster startup
3. **Clearer Focus** - Kiro CLI only, no confusion
4. **Better Documentation** - Clear, focused, practical
5. **More Reliable** - Tests ensure everything works
6. **Easier Maintenance** - Simpler codebase
7. **Better Adoption** - Lower barrier to entry

---

**Next Step:** Start with Quick Wins, then proceed with Week 1 tasks.
