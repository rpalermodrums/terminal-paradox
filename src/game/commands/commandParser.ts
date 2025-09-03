import type { Direction, CommandItem } from '../state/types';

export type CommandType = 
  | 'move'
  | 'take'
  | 'use'
  | 'look'
  | 'inventory'
  | 'help'
  | 'save'
  | 'load'
  | 'reset'
  | 'drop'
  | 'combine'
  | 'examine'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  target?: string;
  direction?: Direction;
  item?: CommandItem;
  args: string[];
  raw: string;
}

export class CommandParser {
  private aliases: Map<string, CommandType>;
  private directionAliases: Map<string, Direction>;

  constructor() {
    this.aliases = new Map([
      // Movement
      ['go', 'move'],
      ['walk', 'move'],
      ['move', 'move'],
      ['n', 'move'],
      ['s', 'move'],
      ['e', 'move'],
      ['w', 'move'],
      ['north', 'move'],
      ['south', 'move'],
      ['east', 'move'],
      ['west', 'move'],
      ['up', 'move'],
      ['down', 'move'],
      
      // Item interaction
      ['take', 'take'],
      ['get', 'take'],
      ['grab', 'take'],
      ['pickup', 'take'],
      
      ['use', 'use'],
      ['run', 'use'],
      ['execute', 'use'],
      ['apply', 'use'],
      
      ['drop', 'drop'],
      ['discard', 'drop'],
      ['remove', 'drop'],
      
      ['combine', 'combine'],
      ['merge', 'combine'],
      ['pipe', 'combine'],
      
      // Information
      ['look', 'look'],
      ['l', 'look'],
      ['examine', 'examine'],
      ['inspect', 'examine'],
      ['check', 'examine'],
      
      ['inventory', 'inventory'],
      ['i', 'inventory'],
      ['inv', 'inventory'],
      ['items', 'inventory'],
      
      ['help', 'help'],
      ['h', 'help'],
      ['?', 'help'],
      ['commands', 'help'],
      
      // Game control
      ['save', 'save'],
      ['load', 'load'],
      ['reset', 'reset'],
      ['restart', 'reset'],
      ['quit', 'reset'],
      ['exit', 'reset'],
    ]);

    this.directionAliases = new Map([
      ['n', 'north'],
      ['north', 'north'],
      ['s', 'south'],
      ['south', 'south'],
      ['e', 'east'],
      ['east', 'east'],
      ['w', 'west'],
      ['west', 'west'],
      ['u', 'up'],
      ['up', 'up'],
      ['d', 'down'],
      ['down', 'down'],
    ]);
  }

  parse(input: string): ParsedCommand {
    const trimmed = input.trim().toLowerCase();
    const parts = trimmed.split(/\s+/);
    
    if (parts.length === 0) {
      return {
        type: 'unknown',
        args: [],
        raw: input
      };
    }

    const firstWord = parts[0];
    const restArgs = parts.slice(1);

    // Check for direct direction commands
    if (this.directionAliases.has(firstWord)) {
      return {
        type: 'move',
        direction: this.directionAliases.get(firstWord)!,
        args: restArgs,
        raw: input
      };
    }

    // Get command type from aliases
    const commandType = this.aliases.get(firstWord) || 'unknown';

    const command: ParsedCommand = {
      type: commandType,
      args: restArgs,
      raw: input
    };

    // Parse additional parameters based on command type
    switch (commandType) {
      case 'move':
        if (restArgs.length > 0) {
          const dir = this.directionAliases.get(restArgs[0]);
          if (dir) {
            command.direction = dir;
          }
        }
        break;

      case 'take':
      case 'use':
      case 'drop':
      case 'examine':
        if (restArgs.length > 0) {
          command.target = restArgs.join(' ');
          // Try to match with known command items
          const possibleItem = restArgs[0] as CommandItem;
          if (this.isValidCommandItem(possibleItem)) {
            command.item = possibleItem;
          }
        }
        break;

      case 'combine':
        // Handle "combine X with Y" or "X | Y"
        const withIndex = restArgs.indexOf('with');
        if (withIndex > 0 && withIndex < restArgs.length - 1) {
          command.args = [
            restArgs.slice(0, withIndex).join(' '),
            restArgs.slice(withIndex + 1).join(' ')
          ];
        }
        break;
    }

    return command;
  }

  private isValidCommandItem(item: string): item is CommandItem {
    const validItems: CommandItem[] = [
      'ls', 'grep', 'chmod', 'sudo', 'cat', 'echo', 'pipe', 'kill'
    ];
    return validItems.includes(item as CommandItem);
  }

  getHelp(): string {
    return `
AVAILABLE COMMANDS:
===================
Movement:
  go/move <direction> - Move in a direction
  n/s/e/w/up/down    - Quick movement

Items:
  take/get <item>    - Pick up an item
  drop <item>        - Drop an item from inventory
  use <item>         - Use an item
  combine <X> with <Y> - Combine two items

Information:
  look/l             - Look around the room
  examine <target>   - Examine something closely
  inventory/i        - Check your inventory
  help/?             - Show this help

Game:
  save              - Save your progress
  load              - Load saved game
  reset             - Reset the game

TIPS:
- Some commands can be corrupted and may not work as expected
- Combine commands creatively to solve puzzles
- Pay attention to error messages - they might be clues`;
  }
}

export const commandParser = new CommandParser();