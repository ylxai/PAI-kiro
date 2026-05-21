/**
 * Main entry point for PAI-Kiro adapter
 */

export { PlatformAdapter, BasePlatformAdapter } from './adapters/PlatformAdapter';
export { KiroAdapter } from './adapters/KiroAdapter';
export { PAICore } from './core/PAICore';
export { SpecConverter } from './kiro/SpecConverter';

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
  ISA,
  ISC,
  Decision,
  ChangelogEntry,
  VerificationResult,
  KiroSpec,
} from './kiro/SpecConverter';
