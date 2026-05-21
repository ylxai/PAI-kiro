# PAI-Kiro: Universal AI Infrastructure

**Personal AI Infrastructure adapted for Kiro (IDE & CLI)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/ylxai/PAI-kiro)
[![Platform](https://img.shields.io/badge/platform-Kiro%20CLI%20%7C%20IDE-green.svg)](https://kiro.dev)

> Bringing the power of PAI's Life Operating System to Kiro CLI and IDE

---

## 🎯 What is PAI-Kiro?

PAI-Kiro is an adaptation layer that enables [Personal AI Infrastructure (PAI)](https://github.com/danielmiessler/Personal_AI_Infrastructure) to run on **Kiro CLI** and **Kiro IDE**. It provides a platform-agnostic core that maps PAI's powerful features to Kiro's native capabilities.

### Key Features

- ✅ **45+ Skills** - Specialized AI capabilities (Research, Council, RedTeam, ISA, etc.)
- ✅ **Hook System** - Automated workflows on events
- ✅ **Memory System** - Persistent knowledge and learning
- ✅ **Algorithm v6.3.0** - 7-phase problem-solving loop
- ✅ **TELOS** - Your goals and mission guide every decision
- ✅ **Custom Agents** - Specialized agents for different workflows (CLI only)

## 🔀 Kiro CLI vs Kiro IDE

PAI-Kiro supports **both** Kiro CLI and Kiro IDE, but they have different features:

| Feature | Kiro CLI | Kiro IDE |
|---------|----------|----------|
| **Type** | Terminal tool | Desktop app |
| **Hooks** | ✅ 5 types | ✅ 9 types |
| **Steering** | ✅ Always loaded | ✅ Conditional modes |
| **Skills** | ✅ Agent Skills | ✅ Agent Skills |
| **Custom Agents** | ✅ Yes | ❌ No |
| **Specs** | ❌ No | ✅ Yes |
| **MCP** | ✅ Yes | ✅ Yes |
| **Installation** | Already installed | Separate install |

**Most users want Kiro CLI** - it's the command-line tool that's actively maintained.

## 🚀 Quick Start (Kiro CLI)

### Prerequisites

- [Kiro CLI](https://kiro.dev/cli) installed
- [Bun](https://bun.sh) runtime (v1.0.0+)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ylxai/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependencies
bun install

# Run the Kiro CLI installer
bun run install:kiro-cli
```

The installer will:
1. Check prerequisites (Kiro CLI, Bun, Git)
2. Setup PAI directories
3. Migrate existing PAI (optional)
4. Create PAI custom agent
5. Setup core hooks

### First Steps

After installation:

```bash
# 1. Navigate to your project
cd your-project

# 2. Start Kiro CLI with PAI agent
kiro-cli --agent pai

# 3. Define your TELOS (goals, mission, beliefs)
# Just tell PAI about your goals in the chat

# 4. Start using PAI!
```

## 📚 Documentation

- **[KIRO_CLI_GUIDE.md](./KIRO_CLI_GUIDE.md)** - Complete Kiro CLI guide
- **[KIRO_ADAPTATION.md](./KIRO_ADAPTATION.md)** - Architecture overview
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration from Claude Code
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick commands

## 🔄 How It Works

PAI-Kiro uses a platform adapter pattern:

```
┌─────────────────────────────────────┐
│          PAI Core                   │
│  (Platform Agnostic)                │
│  - Algorithm v6.3.0                 │
│  - Memory System                    │
│  - Skills System                    │
│  - TELOS                            │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Platform Adapter               │
│      Interface                      │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Kiro CLI    │  │  Kiro IDE    │
│  Adapter     │  │  Adapter     │
└──────────────┘  └──────────────┘
```

## 🗺️ Feature Mapping (Kiro CLI)

| PAI Feature | Kiro CLI | Compatibility |
|-------------|----------|---------------|
| Skills | Agent Skills | ✅ 100% |
| Hooks (5/8) | CLI Hooks | ✅ 80% |
| Context | Steering | ✅ 100% |
| Memory | File-based | ✅ 100% |
| MCP | MCP | ✅ 100% |
| Custom Agents | ✅ Native | ✅ 100% |
| Specs/ISA | ❌ N/A | N/A |

## 📦 Project Structure

```
PAI-kiro/
├── Releases/v5.0.0/          # Original PAI (Claude Code)
│   └── .claude/              # PAI core system
│
├── kiro-adapter/             # Kiro adaptation layer
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── PlatformAdapter.ts      # Universal interface
│   │   │   ├── KiroCLIAdapter.ts       # Kiro CLI (NEW)
│   │   │   └── KiroAdapter.ts          # Kiro IDE (legacy)
│   │   ├── core/
│   │   │   └── PAICore.ts              # Platform-agnostic
│   │   └── cli/
│   │       ├── install-cli.ts          # CLI installer
│   │       └── install.ts              # IDE installer
│   └── package.json
│
├── docs/                     # Documentation
├── KIRO_CLI_GUIDE.md        # CLI-specific guide
└── README.md                # This file
```

## 🎯 Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Platform adapter interface
- [x] Kiro IDE adapter
- [x] Documentation

### Phase 2: CLI Support ✅ (Current)
- [x] Kiro CLI adapter
- [x] Custom agents support
- [x] CLI-specific hooks
- [x] CLI installer

### Phase 3: Testing (Next)
- [ ] Skills migration testing
- [ ] Hook system validation
- [ ] Memory persistence tests
- [ ] Custom agent examples

### Phase 4: Advanced Features
- [ ] Standalone Pulse daemon
- [ ] Voice notifications
- [ ] Multi-platform support

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build
bun run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Daniel Miessler](https://github.com/danielmiessler)** - Creator of [Personal AI Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- **[AWS](https://aws.amazon.com/)** - For Kiro CLI and IDE
- **PAI Community** - For the amazing Life OS vision

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ylxai/PAI-kiro/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ylxai/PAI-kiro/discussions)
- **Original PAI:** [danielmiessler/Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- **Kiro CLI:** [kiro.dev/cli](https://kiro.dev/cli)
- **Kiro IDE:** [kiro.dev](https://kiro.dev)

---

**Built with ❤️ by the PAI-Kiro community**

*Bringing the Life Operating System to Kiro CLI and IDE*
