# PAI Core

**Platform-Agnostic Personal AI Infrastructure**

This package contains the core functionality of PAI that works across all platforms.

## Architecture

```
pai-core/
├── algorithm/      # Algorithm v6.3.0 (platform agnostic)
├── memory/         # Memory system (file-based, universal)
├── isa/            # Ideal State Artifact system
├── telos/          # TELOS system (goals, mission, beliefs)
├── skills/         # Core skill definitions
├── da/             # Digital Assistant identity
└── types/          # TypeScript type definitions
```

## Platform Adapters

PAI Core works with platform-specific adapters:

- **ClaudeCodeAdapter** - For Claude Code
- **KiroCLIAdapter** - For Kiro CLI
- **OpenCodeAdapter** - For OpenCode
- **Custom Adapters** - Community-built adapters

## Usage

```typescript
import { PlatformAdapter, PAI_CORE_VERSION } from '@pai/core';
import { KiroCLIAdapter } from '@pai/adapters/kiro-cli';

// Initialize adapter
const adapter = new KiroCLIAdapter();
await adapter.initialize();

// Use PAI Core functionality
const context = await adapter.loadContext();
const skills = await adapter.loadSkills();
const memory = await adapter.readMemory('WORK/current-project');
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# Test
bun test
```

## License

MIT
