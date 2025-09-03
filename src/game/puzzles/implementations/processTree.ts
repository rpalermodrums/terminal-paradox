import { BasePuzzle, PuzzleType, PuzzleDifficulty, PuzzleHint, PuzzleResult, PuzzleState } from '../types';

interface Process {
  pid: number;
  ppid: number;
  name: string;
  status: 'running' | 'sleeping' | 'zombie';
}

export class ProcessTreePuzzle extends BasePuzzle {
  id = 'process-tree-1';
  type: PuzzleType = 'process-tree';
  name = 'Fork Bomb Defusal';
  description = 'Kill the zombie processes in the correct order to prevent a fork bomb';
  difficulty: PuzzleDifficulty = 'hard';
  corruptionModifier = 10;
  
  hints: PuzzleHint[] = [
    {
      threshold: 2,
      text: 'Kill child processes before their parents'
    },
    {
      threshold: 4,
      text: 'Zombie processes have living parents that need to reap them'
    },
    {
      threshold: 6,
      text: 'Process 1337 is the parent of the fork bomb',
      cost: 5
    },
    {
      threshold: 8,
      text: 'Kill order: 3047, 2048, then 1337',
      cost: 10
    }
  ];

  private processTree: Process[] = [
    { pid: 1, ppid: 0, name: 'init', status: 'running' },
    { pid: 1337, ppid: 1, name: 'fork_bomb', status: 'running' },
    { pid: 2048, ppid: 1337, name: 'zombie_spawn', status: 'zombie' },
    { pid: 3047, ppid: 2048, name: 'zombie_child', status: 'zombie' },
    { pid: 666, ppid: 1, name: 'daemon', status: 'sleeping' },
    { pid: 9999, ppid: 666, name: 'watcher', status: 'running' }
  ];

  private correctKillOrder = [3047, 2048, 1337];

  getProcessTree(): string {
    const header = 'PID   PPID  STATUS    NAME\n';
    const separator = '--------------------------------\n';
    const rows = this.processTree.map(p => 
      `${p.pid.toString().padEnd(6)}${p.ppid.toString().padEnd(6)}${p.status.padEnd(10)}${p.name}`
    ).join('\n');
    
    return header + separator + rows;
  }

  validate(input: string, state?: PuzzleState): PuzzleResult {
    // Parse kill commands
    const killPattern = /kill\s+([\d\s]+)/;
    const match = input.match(killPattern);
    
    if (!match) {
      return this.createResult(false, 'Invalid command. Use: kill <pid> [pid2] [pid3]', {
        corruption: 2
      });
    }
    
    const pids = match[1].trim().split(/\s+/).map(p => parseInt(p, 10));
    
    // Check if trying to kill parent before children
    if (pids.includes(1337) && pids.length === 1) {
      return this.createResult(false, 'CRITICAL: Killing parent process triggered fork bomb! System corrupting...', {
        corruption: 20
      });
    }
    
    // Check if all required processes are killed
    const requiredKilled = this.correctKillOrder.every(pid => pids.includes(pid));
    
    if (!requiredKilled) {
      const killed = pids.filter(pid => this.processTree.some(p => p.pid === pid));
      return this.createResult(false, `Killed processes ${killed.join(', ')} but zombies remain active.`, {
        corruption: 5
      });
    }
    
    // Check kill order
    const orderCorrect = this.isKillOrderValid(pids);
    
    if (orderCorrect) {
      return this.createResult(true, 'All zombie processes terminated! System stabilizing...', {
        corruption: -15,
        reward: 'kill'
      });
    } else {
      return this.createResult(false, 'Processes killed but in wrong order. Fork bomb partially triggered!', {
        corruption: 10
      });
    }
  }

  private isKillOrderValid(pids: number[]): boolean {
    const relevantPids = pids.filter(pid => this.correctKillOrder.includes(pid));
    
    // Check that children are killed before parents
    for (let i = 0; i < relevantPids.length; i++) {
      const pid = relevantPids[i];
      const process = this.processTree.find(p => p.pid === pid);
      
      if (process) {
        // Check if any children are killed after this process
        const children = this.processTree.filter(p => p.ppid === pid);
        for (const child of children) {
          const childIndex = relevantPids.indexOf(child.pid);
          if (childIndex > i) {
            return false; // Child killed after parent
          }
        }
      }
    }
    
    return true;
  }
}