// A local portfolio-navigation simulation. Commands never reach a shell or server.
import { projects } from './projects';
const baseCommands = {
  help: 'Show available commands',
  whoami: 'Meet the engineer',
  pwd: 'Show the virtual portfolio directory',
  ls: 'List portfolio files and directories',
  'ls projects': 'List engineering projects',
  'ls experience': 'List professional experience',
  'ls skills': 'List the engineering toolkit',
  'cat about.md': 'Read the biography',
  'cat experience.md': 'Read professional experience',
  'cat toolkit.conf': 'Read toolkit capabilities',
  projects: 'List engineering projects',
  skills: 'List the engineering toolkit',
  contact: 'Email, GitHub, LinkedIn, and CV',
  clear: 'Clear output; keep command history',
  exit: 'Close the terminal',
} as const;

export type PortfolioCommand = keyof typeof baseCommands | `open project ${number}`;
export const commandDescriptions: Record<PortfolioCommand, string> = { ...baseCommands, ...Object.fromEntries(projects.map((_, index) => [`open project ${index + 1}`, `Open project ${index + 1} case study`])) };
export const supportedCommands = Object.keys(commandDescriptions) as PortfolioCommand[];
export const terminalHistoryLimit = 100;
export const terminalInputLimit = 1024;

export function normalizeCommand(input: string) {
  return input.trim().replace(/\s+/g, ' ');
}

export function parseCommand(input: string): PortfolioCommand | null {
  const command = normalizeCommand(input);
  return supportedCommands.find((known) => known === command) ?? null;
}

export function completeCommand(input: string) {
  const prefix = normalizeCommand(input);
  return prefix ? supportedCommands.filter((known) => known.startsWith(prefix)) : [];
}

export function suggestCommand(input: string) {
  const command = normalizeCommand(input);
  if (/^open project\b/.test(command)) {
    const options = projects.map((_, index) => `open project ${index + 1}`);
    if (!options.length) return 'There are no projects to open yet.';
    return `Use ${options.length > 1 ? `${options.slice(0, -1).join(', ')}, or ${options.at(-1)}` : options[0]}.`;
  }
  const match = command.length > 1 ? supportedCommands.find((known) => known.startsWith(command) || command.startsWith(`${known} `)) : undefined;
  return match ? `Try “${match}”. Type help for all commands.` : 'Type help to see the available portfolio commands.';
}
