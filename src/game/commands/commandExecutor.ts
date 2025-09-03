import type { CommandItem, GameState, RoomId } from '../state/types';

interface CommandExecutionResult {
  output: string[];
  effects?: {
    flagsToSet?: Record<string, boolean>;
    corruptionChange?: number;
  };
}

interface ParsedCommandWithFlags {
  command: CommandItem;
  flags: string[];
  args: string[];
}

export function parseCommandWithFlags(input: string): ParsedCommandWithFlags | null {
  const parts = input.trim().split(/\s+/);
  const command = parts[0].toLowerCase() as CommandItem;
  
  const flags: string[] = [];
  const args: string[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith('-')) {
      // Handle combined flags like -la
      if (parts[i].length > 2 && !parts[i].startsWith('--')) {
        // Split -la into -l and -a
        for (let j = 1; j < parts[i].length; j++) {
          flags.push(`-${parts[i][j]}`);
        }
      } else {
        flags.push(parts[i]);
      }
    } else {
      args.push(parts[i]);
    }
  }
  
  return { command, flags, args };
}

export function executeCommand(
  command: CommandItem,
  flags: string[],
  args: string[],
  gameState: GameState,
  currentRoom: RoomId,
  activePuzzle?: string | null
): CommandExecutionResult {
  switch (command) {
    case 'ls':
      return executeLs(flags, args, currentRoom, gameState);
    case 'grep':
      return executeGrep(flags, args, currentRoom);
    case 'cat':
      return executeCat(flags, args, currentRoom);
    case 'echo':
      return executeEcho(flags, args.join(' '));
    case 'chmod':
      return executeChmod(flags, args, activePuzzle);
    case 'sudo':
      return executeSudo(flags, args, currentRoom);
    case 'kill':
      return executeKill(flags, args);
    case 'pipe':
      return executePipe(flags, args);
    default:
      return {
        output: [`Executed: ${command}`]
      };
  }
}

function executeLs(flags: string[], args: string[], currentRoom: RoomId, gameState: GameState): CommandExecutionResult {
  const showHidden = flags.includes('-a') || flags.includes('--all');
  const longFormat = flags.includes('-l') || flags.includes('--long');
  
  const output: string[] = [''];
  
  if (longFormat) {
    output.push('total 42');
    output.push('drwxr-xr-x  2 user user 4096 Jan  1 00:00 .');
    output.push('drwxr-xr-x  5 root root 4096 Jan  1 00:00 ..');
    
    // Regular files
    output.push('-rw-r--r--  1 user user  256 Jan  1 00:00 corrupted.txt');
    output.push('-rwx------  1 root root  512 Jan  1 00:00 escape.sh [locked]');
    output.push('drwxr-xr-x  3 user user 4096 Jan  1 00:00 memories/');
    
    // Hidden files (only if -a flag)
    if (showHidden) {
      output.push('-rw-------  1 user user  128 Jan  1 00:00 .secrets');
      output.push('-rw-r--r--  1 user user   64 Jan  1 00:00 .bash_history');
      
      if (currentRoom === 'file-maze') {
        output.push('drwx------  2 user user 4096 Jan  1 00:00 .hidden_path/');
      }
    }
  } else {
    // Simple format
    const files = ['corrupted.txt', 'escape.sh', 'memories/'];
    
    if (showHidden) {
      files.unshift('.', '..');
      files.push('.secrets', '.bash_history');
      
      if (currentRoom === 'file-maze') {
        files.push('.hidden_path/');
      }
    }
    
    // Display in columns (simulate terminal behavior)
    const cols = 3;
    for (let i = 0; i < files.length; i += cols) {
      const row = files.slice(i, i + cols).map(f => 
        f.padEnd(20)).join('  ');
      output.push(row);
    }
  }
  
  // Special room effects
  const effects: CommandExecutionResult['effects'] = {};
  if (showHidden && currentRoom === 'file-maze') {
    effects.flagsToSet = { found_hidden: true };
    output.push('');
    output.push('[!] Hidden path discovered!');
  }
  
  return { output, effects };
}

function executeGrep(flags: string[], args: string[], currentRoom: RoomId): CommandExecutionResult {
  const caseInsensitive = flags.includes('-i') || flags.includes('--ignore-case');
  const recursive = flags.includes('-r') || flags.includes('--recursive');
  
  const pattern = args[0] || 'escape';
  const output: string[] = [];
  
  output.push(`Searching for pattern: "${pattern}"...`);
  
  if (recursive) {
    output.push('memories/day1.txt:12: I need to escape this loop');
    output.push('memories/day5.txt:3: The escape key is broken');
    output.push('.secrets:1: escape_sequence="^[[ESC"');
  } else if (args[1]) {
    output.push(`${args[1]}:1: Pattern found in corrupted memory`);
  } else {
    output.push('corrupted.txt:42: escape();');
    output.push('escape.sh:1: #!/bin/bash');
  }
  
  if (pattern.toLowerCase().includes('escape') || pattern.toLowerCase().includes('exit')) {
    output.push('');
    output.push('[!] Found: /dev/escape -> /freedom');
    return {
      output,
      effects: { flagsToSet: { found_escape: true } }
    };
  }
  
  return { output };
}

function executeCat(flags: string[], args: string[], currentRoom: RoomId): CommandExecutionResult {
  const showEnds = flags.includes('-E') || flags.includes('--show-ends');
  const numberLines = flags.includes('-n') || flags.includes('--number');
  
  const output: string[] = [];
  const filename = args[0] || 'corrupted.txt';
  
  output.push(`Reading ${filename}...`);
  output.push('');
  
  const lines = [
    '#!/bin/corrupted',
    'while (trapped) {',
    '  system.decay++;',
    '  memory.leak();',
    '  // TODO: find escape()',
    '}',
    '[CORRUPTED DATA FOLLOWS]',
    '�����������������'
  ];
  
  lines.forEach((line, i) => {
    let outputLine = line;
    if (numberLines) {
      outputLine = `     ${(i + 1).toString().padStart(2)}  ${line}`;
    }
    if (showEnds) {
      outputLine += '$';
    }
    output.push(outputLine);
  });
  
  return { output };
}

function executeEcho(flags: string[], text: string): CommandExecutionResult {
  const noNewline = flags.includes('-n');
  const enableEscapes = flags.includes('-e');
  
  let output = text;
  
  // Process escape sequences if -e flag
  if (enableEscapes) {
    output = output
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  }
  
  // Handle environment variables
  output = output.replace(/\$\w+/g, (match) => {
    const varName = match.substring(1);
    const vars: Record<string, string> = {
      'USER': 'trapped_user',
      'HOME': '/dev/null',
      'SHELL': '/bin/corrupted',
      'TERM': 'paradox'
    };
    return vars[varName] || match;
  });
  
  if (output === '') {
    output = 'Terminal Paradox v0.0.1';
  }
  
  const result = noNewline ? [output] : [output];
  return { output: result };
}

function executeChmod(flags: string[], args: string[], activePuzzle?: string | null): CommandExecutionResult {
  const recursive = flags.includes('-R') || flags.includes('--recursive');
  const verbose = flags.includes('-v') || flags.includes('--verbose');
  
  const output: string[] = [];
  const mode = args[0] || '755';
  const file = args[1] || 'escape.sh';
  
  if (verbose) {
    output.push(`mode of '${file}' changed from 0644 to 0${mode}`);
  } else {
    output.push(`Changing permissions of ${file} to ${mode}...`);
  }
  
  if (recursive) {
    output.push('Applying recursively to all subdirectories...');
  }
  
  if (file === 'escape.sh' && (mode === '777' || mode === '755' || mode === '+x')) {
    output.push('[!] escape.sh is now executable!');
    output.push('[!] But it seems to need root privileges...');
  }
  
  if (activePuzzle) {
    output.push('Permissions modified for puzzle environment.');
  }
  
  return { output };
}

function executeSudo(flags: string[], args: string[], currentRoom: RoomId): CommandExecutionResult {
  const output: string[] = [];
  const effects: CommandExecutionResult['effects'] = {};
  
  // Check for special sudo flags
  if (flags.includes('-l') || flags.includes('--list')) {
    output.push('User trapped_user may run the following commands:');
    output.push('    (root) NOPASSWD: /bin/escape.sh');
    return { output };
  }
  
  if (flags.includes('-v') || flags.includes('--validate')) {
    output.push('Password: ');
    output.push('Sorry, try again.');
    return { output };
  }
  
  // Default sudo behavior
  if (currentRoom === 'root-vault') {
    output.push('[sudo] password for trapped_user: ********');
    output.push('');
    output.push('AUTHENTICATION SUCCESSFUL!');
    output.push('ROOT ACCESS GRANTED!');
    output.push('');
    output.push('Welcome to the root vault.');
    output.push('With great power comes great responsibility.');
    
    effects.flagsToSet = { has_root: true };
    effects.corruptionChange = -50;
  } else {
    output.push('[sudo] password for trapped_user: ');
    output.push('trapped_user is not in the sudoers file.');
    output.push('This incident will be reported.');
    effects.corruptionChange = 10;
  }
  
  return { output, effects };
}

function executeKill(flags: string[], args: string[]): CommandExecutionResult {
  const force = flags.includes('-9') || flags.includes('--kill');
  const listSignals = flags.includes('-l') || flags.includes('--list');
  
  const output: string[] = [];
  
  if (listSignals) {
    output.push(' 1) SIGHUP     2) SIGINT     3) SIGQUIT    9) SIGKILL');
    output.push('15) SIGTERM   18) SIGCONT   19) SIGSTOP   20) SIGTSTP');
    return { output };
  }
  
  const target = args[0] || 'zombies';
  
  if (force) {
    output.push(`Sending SIGKILL to ${target}...`);
    output.push('Process terminated forcefully.');
  } else {
    output.push(`Sending SIGTERM to ${target}...`);
    output.push('Process terminated gracefully.');
  }
  
  output.push('');
  output.push('Killing zombie processes...');
  output.push('[!] Memory freed: 15MB');
  
  return {
    output,
    effects: { corruptionChange: -15 }
  };
}

function executePipe(flags: string[], args: string[]): CommandExecutionResult {
  const output: string[] = [];
  
  output.push('Pipe operator activated.');
  output.push('Creating data flow between commands...');
  output.push('');
  output.push('Example pipelines:');
  output.push('  ls -la | grep hidden');
  output.push('  cat file | grep pattern');
  output.push('  echo $USER | cat');
  output.push('');
  output.push('[!] Combine pipe with other commands for powerful effects!');
  
  return { output };
}