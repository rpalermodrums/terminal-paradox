export type RoomId = 
  | 'boot-sequence'
  | 'file-maze'
  | 'process-prison'
  | 'memory-leak'
  | 'root-vault';

export type CommandItem = 
  | 'ls'
  | 'grep'
  | 'chmod'
  | 'sudo'
  | 'cat'
  | 'echo'
  | 'pipe'
  | 'kill';

export interface GameState {
  currentRoom: RoomId;
  inventory: CommandItem[];
  maxInventory: number;
  flags: Record<string, boolean>;
  corruption: number; // 0-100, affects visual glitches
  moves: number;
  startTime: number;
  history: string[];
}

export interface Room {
  id: RoomId;
  name: string;
  description: string;
  ascii?: string;
  exits: Partial<Record<Direction, RoomId>>;
  items: CommandItem[];
  puzzles: string[];
  corrupted: boolean;
}

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface Puzzle {
  id: string;
  name: string;
  description: string;
  solution: string | RegExp | (() => boolean);
  reward?: CommandItem;
  hint?: string;
  attempts: number;
}

export interface SaveGame {
  state: GameState;
  timestamp: number;
  version: string;
}