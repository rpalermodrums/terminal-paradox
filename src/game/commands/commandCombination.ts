import type { CommandItem } from '../state/types';

export interface CommandCombo {
  id: string;
  name: string;
  inputs: CommandItem[];
  output: string;
  description: string;
  effect: () => void;
  discovered: boolean;
}

export class CommandCombinationEngine {
  private combinations: Map<string, CommandCombo>;
  private discoveredCombos: Set<string> = new Set();

  constructor() {
    this.combinations = new Map();
    this.initializeCombinations();
  }

  private initializeCombinations() {
    const combos: CommandCombo[] = [
      {
        id: 'deep-search',
        name: 'Deep Search',
        inputs: ['ls', 'grep'],
        output: 'ls | grep',
        description: 'Search through hidden files and directories',
        effect: () => console.log('Revealing hidden paths...'),
        discovered: false
      },
      {
        id: 'force-kill',
        name: 'Force Kill',
        inputs: ['sudo', 'kill'],
        output: 'sudo kill -9',
        description: 'Forcefully terminate any process',
        effect: () => console.log('Process terminated with extreme prejudice'),
        discovered: false
      },
      {
        id: 'duplicate',
        name: 'Duplicate',
        inputs: ['cat', 'echo'],
        output: 'cat | tee',
        description: 'Duplicate items in your inventory',
        effect: () => console.log('Item duplicated!'),
        discovered: false
      },
      {
        id: 'god-mode',
        name: 'God Mode',
        inputs: ['chmod', 'sudo'],
        output: 'sudo chmod 777',
        description: 'Temporary invincibility from corruption',
        effect: () => console.log('God mode activated for 30 seconds'),
        discovered: false
      },
      {
        id: 'pipe-dream',
        name: 'Pipe Dream',
        inputs: ['pipe', 'echo'],
        output: 'echo | pipe',
        description: 'Create a portal between rooms',
        effect: () => console.log('Portal created!'),
        discovered: false
      },
      {
        id: 'memory-leak',
        name: 'Memory Leak',
        inputs: ['free', 'malloc'],
        output: 'malloc --unlimited',
        description: 'Temporarily expand inventory capacity',
        effect: () => console.log('Inventory expanded!'),
        discovered: false
      }
    ];

    combos.forEach(combo => {
      const key = this.getComboKey(combo.inputs);
      this.combinations.set(key, combo);
    });
  }

  private getComboKey(items: CommandItem[]): string {
    return [...items].sort().join('+');
  }

  tryCombination(item1: CommandItem, item2: CommandItem): CommandCombo | null {
    const key = this.getComboKey([item1, item2]);
    const combo = this.combinations.get(key);
    
    if (combo && !combo.discovered) {
      combo.discovered = true;
      this.discoveredCombos.add(combo.id);
    }
    
    return combo || null;
  }

  tryCombinationMultiple(items: CommandItem[]): CommandCombo | null {
    const key = this.getComboKey(items);
    const combo = this.combinations.get(key);
    
    if (combo && !combo.discovered) {
      combo.discovered = true;
      this.discoveredCombos.add(combo.id);
    }
    
    return combo || null;
  }

  getDiscoveredCombos(): CommandCombo[] {
    return Array.from(this.combinations.values()).filter(c => c.discovered);
  }

  getHintForItems(items: CommandItem[]): string | null {
    // Check if these items are close to a combination
    for (const [key, combo] of this.combinations) {
      const comboItems = combo.inputs;
      const matching = items.filter(item => comboItems.includes(item));
      
      if (matching.length === comboItems.length - 1) {
        const missing = comboItems.find(item => !items.includes(item));
        if (missing) {
          return `These items might combine well with '${missing}'...`;
        }
      }
    }
    
    return null;
  }

  executeCombo(combo: CommandCombo): string {
    combo.effect();
    return `Executed: ${combo.output}\n${combo.description}`;
  }

  getComboDescription(id: string): string | null {
    for (const combo of this.combinations.values()) {
      if (combo.id === id) {
        return combo.description;
      }
    }
    return null;
  }

  // Special combinations that require specific conditions
  checkSpecialCombination(items: CommandItem[], context: any): CommandCombo | null {
    // Example: ls + sudo in root-vault creates special effect
    if (context.currentRoom === 'root-vault' && 
        items.includes('ls') && 
        items.includes('sudo')) {
      return {
        id: 'root-reveal',
        name: 'Root Revelation',
        inputs: ['ls', 'sudo'],
        output: 'sudo ls -la /',
        description: 'Reveals the true nature of the system',
        effect: () => console.log('The truth is revealed...'),
        discovered: true
      };
    }
    
    return null;
  }

  getAllPossibleCombos(): string[] {
    return Array.from(this.combinations.values()).map(c => 
      `${c.inputs.join(' + ')} = ${c.name}`
    );
  }
}

export const commandCombinationEngine = new CommandCombinationEngine();