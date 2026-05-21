/**
 * Main entry point for PAI-Kiro adapter
 */

export { PlatformAdapter, BasePlatformAdapter } from './adapters/PlatformAdapter';
export { KiroAdapter } from './adapters/KiroAdapter'; // For Kiro IDE (legacy)
export { KiroCLIAdapter } from './adapters/KiroCLIAdapter'; // For Kiro CLI
export { PAICore } from './core/PAICore';

export type {
  PlatformConfig,
  HookEvent,
  HookType,
  HookContext,
  ContextInjection,
  SpecData,
  Task,
  PlatformCapabilities,
} from './adapters/PlatformAdapter';

export type {
  KiroCLIAgentConfig,
  KiroCLIHook,
} from './adapters/KiroCLIAdapter';
