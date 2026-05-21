#!/usr/bin/env bun

/**
 * PAI Hook Runner
 * 
 * Invoked by Kiro CLI shell hook wrappers. Reads event payload from stdin,
 * loads PAICore, and executes the target TypeScript hook handler.
 */

import { Command } from 'commander';
import { KiroAdapter } from '../adapters/KiroAdapter';
import { PAICore } from '../core/PAICore';
import { HookContext, HookType } from '../adapters/PlatformAdapter';

const program = new Command();

program
  .name('pai-run-hook')
  .description('Run a specific PAI TypeScript hook')
  .requiredOption('--event <type>', 'Kiro CLI event type (agentSpawn, userPromptSubmit, preToolUse, postToolUse, stop)')
  .requiredOption('--name <name>', 'Name of the hook to run')
  .parse(process.argv);

const options = program.opts();

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
    // Set a timeout to resolve if no input is provided (e.g. not piped)
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}

// Map Kiro CLI event names back to PAI HookTypes
function mapToPaiHookType(kiroEvent: string): HookType {
  const mapping: Record<string, HookType> = {
    'agentSpawn': 'SessionStart',
    'userPromptSubmit': 'UserPromptSubmit',
    'preToolUse': 'PreToolUse',
    'postToolUse': 'PostToolUse',
    'stop': 'Stop',
  };
  return mapping[kiroEvent] || 'SessionStart';
}

async function main() {
  try {
    const rawInput = await readStdin();
    let stdinData: any = {};
    
    if (rawInput.trim()) {
      try {
        stdinData = JSON.parse(rawInput);
      } catch (e) {
        stdinData = { raw: rawInput.trim() };
      }
    }

    // Initialize adapter and core
    const adapter = new KiroAdapter();
    const core = new PAICore({
      adapter,
      logLevel: 'error', // Keep stdout clean for Kiro CLI
    });

    // Suppress initialization stdout logs to keep output clean for Kiro CLI
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};

    try {
      await core.initialize();
    } finally {
      // Restore original console logging methods
      console.log = originalLog;
      console.info = originalInfo;
      console.warn = originalWarn;
    }

    // Find the registered hook
    const registeredHooks = core.getRegisteredHooks();
    const targetHook = registeredHooks.find(h => h.name === options.name);

    if (!targetHook) {
      console.warn(`[PAI] Hook "${options.name}" not registered in PAICore.`);
      process.exit(0);
    }

    // Construct context
    const context: HookContext = {
      event: mapToPaiHookType(options.event),
      data: stdinData,
      platform: 'kiro-cli',
      timestamp: new Date(),
    };

    // Execute handler
    await targetHook.handler(context);
    process.exit(0);
  } catch (error) {
    console.error('[PAI Error] Failed running hook:', error);
    process.exit(1);
  }
}

main();
