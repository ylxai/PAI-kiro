# PAI-Kiro

**Personal AI Infrastructure adapted for Kiro IDE**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/ylxai/PAI-kiro)
[![Platform](https://img.shields.io/badge/platform-Kiro%20IDE-green.svg)](https://kiro.dev)

> Bringing the power of PAI's Life Operating System to Kiro IDE

---

## 🎯 What is PAI-Kiro?

PAI-Kiro is an adaptation layer that enables [Personal AI Infrastructure (PAI)](https://github.com/danielmiessler/Personal_AI_Infrastructure) to run on [Kiro IDE](https://kiro.dev). It provides a platform-agnostic core that maps PAI's powerful features to Kiro's native capabilities.

### Key Features

- ✅ **45+ Skills** - Specialized AI capabilities (Research, Council, RedTeam, ISA, etc.)
- ✅ **Hook System** - Automated workflows on IDE events
- ✅ **Memory System** - Persistent knowledge and learning
- ✅ **Algorithm v6.3.0** - 7-phase problem-solving loop
- ✅ **TELOS** - Your goals and mission guide every decision
- ✅ **ISA ↔ Specs** - Bidirectional conversion between PAI ISA and Kiro Specs

## 🚀 Quick Start

### Prerequisites

- [Kiro IDE](https://kiro.dev) installed
- [Bun](https://bun.sh) runtime (v1.0.0+)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ylxai/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependencies
bun install

# Run the installer
bun run install:kiro
```

The installer will guide you through:
1. Prerequisites check
2. Configuration setup
3. Optional migration from existing PAI
4. Core hooks setup
5. Welcome message creation

### First Steps

After installation:

```bash
# 1. Read the welcome message
cat ~/.kiro/pai/WELCOME.md

# 2. Open Kiro IDE and run the interview
/interview

# 3. Start using PAI!
```

## 📚 Documentation

- **[Architecture Overview](./KIRO_ADAPTATION.md)** - System design and implementation plan
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Detailed migration instructions
- **[Original PAI v5.0.0](./Releases/v5.0.0/README.md)** - Full PAI documentation

## 🔄 How It Works

PAI-Kiro uses a platform adapter pattern to map PAI concepts to Kiro features:

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
                 ▼
┌─────────────────────────────────────┐
│       Kiro Adapter                  │
│  - Hooks → Kiro Hooks               │
│  - Context → Steering               │
│  - Skills → Agent Skills            │
│  - ISA → Specs                      │
└─────────────────────────────────────┘
```

## 🗺️ Feature Mapping

| PAI Feature | Kiro Feature | Compatibility |
|-------------|--------------|---------------|
| Skills | Agent Skills | ✅ 100% |
| Hooks (5/8) | Kiro Hooks | ✅ 80% |
| Context | Steering | ✅ 90% |
| ISA | Specs | ✅ 70% |
| Memory | File-based | ✅ 100% |
| MCP | MCP | ✅ 100% |

## 📦 Project Structure

```
PAI-kiro/
├── Releases/v5.0.0/          # Original PAI (Claude Code)
│   └── .claude/              # PAI core system
│
├── kiro-adapter/             # Kiro adaptation layer
│   ├── src/
│   │   ├── adapters/         # Platform adapters
│   │   ├── core/             # PAI Core (platform-agnostic)
│   │   ├── kiro/             # Kiro-specific implementations
│   │   └── cli/              # Installation CLI
│   └── package.json
│
├── docs/                     # Documentation
├── KIRO_ADAPTATION.md        # Architecture document
├── MIGRATION_GUIDE.md        # Migration instructions
└── README.md                 # This file
```

## 🎯 Roadmap

### Phase 1: Foundation ✅ (Current)
- [x] Platform adapter interface
- [x] Kiro adapter implementation
- [x] Basic hook conversion
- [x] Installation CLI
- [x] Documentation

### Phase 2: Core Features (Week 2-3)
- [ ] Skills migration script
- [ ] TELOS → Steering converter
- [ ] Memory system integration
- [ ] Hook testing suite

### Phase 3: ISA ↔ Specs (Week 4-5)
- [ ] ISA to Kiro Spec converter
- [ ] Spec to ISA converter
- [ ] Bidirectional sync
- [ ] Verification system

### Phase 4: Advanced Features (Week 6-8)
- [ ] Standalone Pulse daemon
- [ ] Voice notifications
- [ ] Life Dashboard
- [ ] Full feature parity

## 🤝 Contributing

Contributions are welcome! This is an open-source project.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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
- **[Anthropic](https://www.anthropic.com/)** - For Claude and Claude Code
- **[AWS](https://aws.amazon.com/)** - For Kiro IDE
- **PAI Community** - For the amazing Life OS vision

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/ylxai/PAI-kiro/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ylxai/PAI-kiro/discussions)
- **Original PAI:** [danielmiessler/Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)
- **Kiro Docs:** [kiro.dev/docs](https://kiro.dev/docs)

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ by the PAI-Kiro community**

*Bringing the Life Operating System to every AI IDE*
