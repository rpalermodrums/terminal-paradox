export type CorruptionEffect = 
  | 'text-scramble'
  | 'command-intercept'
  | 'memory-shuffle'
  | 'time-dilation'
  | 'false-rooms'
  | 'input-lag'
  | 'echo-loop'
  | 'visual-glitch';

export interface CorruptionState {
  level: number; // 0-100
  activeEffects: Set<CorruptionEffect>;
  lastTrigger: number;
  falseRoomActive: boolean;
  interceptedCommands: Map<string, string>;
}

export class CorruptionEngine {
  private state: CorruptionState;
  private effectThresholds: Map<CorruptionEffect, number>;

  constructor() {
    this.state = {
      level: 0,
      activeEffects: new Set(),
      lastTrigger: Date.now(),
      falseRoomActive: false,
      interceptedCommands: new Map()
    };

    // Define corruption level thresholds for effects
    this.effectThresholds = new Map([
      ['text-scramble', 15],
      ['command-intercept', 30],
      ['memory-shuffle', 40],
      ['time-dilation', 50],
      ['false-rooms', 60],
      ['input-lag', 70],
      ['echo-loop', 80],
      ['visual-glitch', 25]
    ]);
  }

  getState(): CorruptionState {
    return { ...this.state, activeEffects: new Set(this.state.activeEffects) };
  }

  setLevel(level: number): void {
    this.state.level = Math.max(0, Math.min(100, level));
    this.updateActiveEffects();
    this.state.lastTrigger = Date.now();
  }

  increase(amount: number): void {
    this.setLevel(this.state.level + amount);
  }

  decrease(amount: number): void {
    this.setLevel(this.state.level - amount);
  }

  private updateActiveEffects(): void {
    this.state.activeEffects.clear();
    
    for (const [effect, threshold] of this.effectThresholds) {
      if (this.state.level >= threshold) {
        this.state.activeEffects.add(effect);
      }
    }

    // Update command interceptions based on corruption level
    if (this.state.activeEffects.has('command-intercept')) {
      this.updateInterceptedCommands();
    } else {
      this.state.interceptedCommands.clear();
    }

    // Activate false room at high corruption
    this.state.falseRoomActive = this.state.level >= 60 && Math.random() < 0.3;
  }

  private updateInterceptedCommands(): void {
    this.state.interceptedCommands.clear();
    
    const interceptions: Array<[string, string]> = [
      ['help', 'hinder'],
      ['save', 'corrupt'],
      ['north', 'south'],
      ['take', 'drop'],
      ['exit', 'enter']
    ];

    // Add more interceptions at higher corruption
    const numInterceptions = Math.floor(this.state.level / 20);
    
    for (let i = 0; i < Math.min(numInterceptions, interceptions.length); i++) {
      const [from, to] = interceptions[i];
      this.state.interceptedCommands.set(from, to);
    }
  }

  // Text corruption effects
  corruptText(text: string): string {
    if (!this.state.activeEffects.has('text-scramble')) {
      return text;
    }

    const corruptionChance = this.state.level / 300;
    const glitchChars = '░▒▓█▀▄▌▐│┤┬┴├┼╬═║╔╗╚╝';
    
    return text.split('').map(char => {
      if (char === ' ' || char === '\n') return char;
      
      if (Math.random() < corruptionChance) {
        // Sometimes replace with glitch
        if (Math.random() < 0.7) {
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        // Sometimes duplicate
        if (Math.random() < 0.2) {
          return char + char;
        }
        // Sometimes remove
        return '';
      }
      
      return char;
    }).join('');
  }

  // Command interception
  interceptCommand(command: string): string {
    if (!this.state.activeEffects.has('command-intercept')) {
      return command;
    }

    const words = command.toLowerCase().split(' ');
    const firstWord = words[0];
    
    if (this.state.interceptedCommands.has(firstWord)) {
      const intercepted = this.state.interceptedCommands.get(firstWord)!;
      words[0] = intercepted;
      return words.join(' ');
    }

    // Random chance to corrupt any command at very high corruption
    if (this.state.level > 80 && Math.random() < 0.1) {
      return 'segfault';
    }

    return command;
  }

  // Memory shuffle effect
  shuffleArray<T>(array: T[]): T[] {
    if (!this.state.activeEffects.has('memory-shuffle')) {
      return array;
    }

    const shuffled = [...array];
    
    // Only shuffle with certain probability
    if (Math.random() < this.state.level / 100) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    }

    return shuffled;
  }

  // Input lag calculation
  getInputDelay(): number {
    if (!this.state.activeEffects.has('input-lag')) {
      return 0;
    }

    // 0-2000ms delay based on corruption
    return Math.floor((this.state.level - 70) * 66);
  }

  // Echo loop effect
  shouldEchoCommand(): boolean {
    if (!this.state.activeEffects.has('echo-loop')) {
      return false;
    }

    return Math.random() < (this.state.level - 80) / 40;
  }

  // Visual glitch generation
  generateGlitch(width: number, height: number): string {
    if (!this.state.activeEffects.has('visual-glitch')) {
      return '';
    }

    const glitchChars = '▓▒░█▄▀▌▐';
    const lines: string[] = [];
    
    for (let i = 0; i < height; i++) {
      let line = '';
      for (let j = 0; j < width; j++) {
        if (Math.random() < this.state.level / 200) {
          line += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  // Check if a false room should be shown
  shouldShowFalseRoom(): boolean {
    return this.state.falseRoomActive && Math.random() < 0.5;
  }

  // Time dilation factor for animations/delays
  getTimeDilation(): number {
    if (!this.state.activeEffects.has('time-dilation')) {
      return 1;
    }

    // Speed up or slow down by up to 50%
    return 0.5 + Math.random();
  }
}

export const corruptionEngine = new CorruptionEngine();