import type { CommandItem } from '../state/types';

interface CommandHelp {
  name: string;
  shortDesc: string;
  usage: string;
  examples: string[];
  tips: string[];
}

export const commandHelpData: Record<CommandItem, CommandHelp> = {
  ls: {
    name: 'ls (list)',
    shortDesc: 'Lists files and directories in the current location',
    usage: 'ls [options]',
    examples: [
      'ls          → List current directory',
      'ls -a       → Show hidden files (starting with .)',
      'ls -l       → Long format with details',
      'ls -la      → Show all files in long format'
    ],
    tips: [
      '• Hidden files start with a dot (.secrets, .hidden_path)',
      '• Use -la to see everything in detail',
      '• Finding hidden paths may reveal secrets!'
    ]
  },
  
  grep: {
    name: 'grep (global regular expression print)',
    shortDesc: 'Searches for patterns in files or text',
    usage: 'grep [options] [pattern] [file]',
    examples: [
      'grep escape        → Search for "escape" patterns',
      'grep -i ERROR      → Case-insensitive search',
      'grep -r pattern    → Search recursively in all files',
      'grep exit          → May reveal hidden paths'
    ],
    tips: [
      '• Use -i for case-insensitive searches',
      '• Use -r to search through all files recursively',
      '• Searching for "escape" or "exit" might help!'
    ]
  },
  
  chmod: {
    name: 'chmod (change mode)',
    shortDesc: 'Changes file permissions (who can read/write/execute)',
    usage: 'chmod [options] [mode] [file]',
    examples: [
      'chmod +x escape.sh  → Make file executable',
      'chmod 755 file      → rwx for owner, rx for others',
      'chmod -v 777 file   → Verbose mode, full permissions',
      'chmod -R 755 dir/   → Apply recursively'
    ],
    tips: [
      '• Making escape.sh executable is important!',
      '• Use -v for verbose output',
      '• -R applies permissions recursively'
    ]
  },
  
  sudo: {
    name: 'sudo (superuser do)',
    shortDesc: 'Runs commands with administrator/root privileges',
    usage: 'sudo [options] [command]',
    examples: [
      'sudo            → Request root access',
      'sudo -l         → List allowed commands',
      'sudo -v         → Validate credentials',
      'sudo ./escape   → Run escape with root'
    ],
    tips: [
      '• May only work in specific locations',
      '• Root access is key to escaping',
      '• The root-vault might accept sudo'
    ]
  },
  
  cat: {
    name: 'cat (concatenate)',
    shortDesc: 'Displays file contents or combines files',
    usage: 'cat [options] [file]',
    examples: [
      'cat corrupted.txt  → Display file contents',
      'cat -n file        → Show with line numbers',
      'cat -E file        → Show line endings with $',
      'cat memories/day1  → Read memory logs'
    ],
    tips: [
      '• Files may contain corrupted data',
      '• Use -n to see line numbers',
      '• Some files might contain clues!'
    ]
  },
  
  echo: {
    name: 'echo',
    shortDesc: 'Prints text to the terminal',
    usage: 'echo [options] [text]',
    examples: [
      'echo "Hello World"  → Print text',
      'echo $USER          → Print environment variable',
      'echo -n "text"      → Print without newline',
      'echo -e "line\\nline" → Enable escape sequences'
    ],
    tips: [
      '• $USER, $HOME, $SHELL show system info',
      '• Use -e to enable escape sequences',
      '• Environment variables might reveal secrets'
    ]
  },
  
  pipe: {
    name: 'pipe ( | )',
    shortDesc: 'Sends output from one command as input to another',
    usage: 'command1 | command2',
    examples: [
      'ls -la | grep ".txt"  → List only .txt files',
      'cat file | wc -l      → Count lines in file',
      'ps aux | grep node    → Find Node.js processes',
      'history | tail -20    → Show last 20 commands'
    ],
    tips: [
      '• Chain multiple pipes: cmd1 | cmd2 | cmd3',
      '• Combines simple tools into powerful workflows',
      '• The Unix philosophy: do one thing well'
    ]
  },
  
  kill: {
    name: 'kill',
    shortDesc: 'Terminates running processes',
    usage: 'kill [options] [target]',
    examples: [
      'kill zombies    → Kill zombie processes',
      'kill -9 process → Force kill (SIGKILL)',
      'kill -l         → List available signals',
      'kill corruption → Reduce system corruption'
    ],
    tips: [
      '• Killing zombies reduces corruption',
      '• Use -9 for forceful termination',
      '• -l shows all available signals'
    ]
  }
};

export function getCommandHelp(command: CommandItem): string[] {
  const help = commandHelpData[command];
  if (!help) return [`No help available for '${command}'`];
  
  const output: string[] = [];
  
  // Header
  output.push('═══════════════════════════════════════════════════');
  output.push(`📚 ${help.name.toUpperCase()}`);
  output.push('═══════════════════════════════════════════════════');
  output.push('');
  
  // Description
  output.push(`📝 ${help.shortDesc}`);
  output.push('');
  
  // Usage
  output.push('USAGE:');
  output.push(`  ${help.usage}`);
  output.push('');
  
  // Examples
  output.push('EXAMPLES:');
  help.examples.forEach(example => {
    output.push(`  ${example}`);
  });
  output.push('');
  
  // Tips
  output.push('💡 TIPS:');
  help.tips.forEach(tip => {
    output.push(`  ${tip}`);
  });
  output.push('');
  output.push('═══════════════════════════════════════════════════');
  
  return output;
}

export function getQuickHelp(command: CommandItem): string {
  const help = commandHelpData[command];
  return help ? help.shortDesc : `Command '${command}'`;
}