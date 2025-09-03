import type { IPuzzle, PuzzleState, PuzzleResult } from './types';
import type { RoomId } from '../state/types';
import { RegexEscapePuzzle } from './implementations/regexEscape';
import { BinaryPermissionPuzzle } from './implementations/binaryPermission';
import { ProcessTreePuzzle } from './implementations/processTree';

export class PuzzleManager {
  private puzzles: Map<string, IPuzzle>;
  private puzzleStates: Map<string, PuzzleState>;
  private roomPuzzles: Map<RoomId, string[]>;

  constructor() {
    this.puzzles = new Map();
    this.puzzleStates = new Map();
    this.roomPuzzles = new Map();
    this.initializePuzzles();
  }

  private initializePuzzles() {
    // Create puzzle instances
    const puzzleInstances: IPuzzle[] = [
      new RegexEscapePuzzle(),
      new BinaryPermissionPuzzle(),
      new ProcessTreePuzzle()
    ];

    // Register puzzles
    puzzleInstances.forEach(puzzle => {
      this.puzzles.set(puzzle.id, puzzle);
      this.puzzleStates.set(puzzle.id, {
        id: puzzle.id,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      });
    });

    // Map puzzles to rooms
    this.roomPuzzles.set('boot-sequence', ['binary-permission-1']);
    this.roomPuzzles.set('file-maze', ['regex-escape-1', 'binary-permission-1']);
    this.roomPuzzles.set('process-prison', ['process-tree-1']);
    this.roomPuzzles.set('memory-leak', []);
    this.roomPuzzles.set('root-vault', ['regex-escape-1']);
  }

  getPuzzle(puzzleId: string): IPuzzle | null {
    return this.puzzles.get(puzzleId) || null;
  }

  getPuzzleState(puzzleId: string): PuzzleState | null {
    return this.puzzleStates.get(puzzleId) || null;
  }

  getRoomPuzzles(roomId: RoomId): IPuzzle[] {
    const puzzleIds = this.roomPuzzles.get(roomId) || [];
    return puzzleIds
      .map(id => this.puzzles.get(id))
      .filter((p): p is IPuzzle => p !== undefined);
  }

  getUnsolvedRoomPuzzles(roomId: RoomId): IPuzzle[] {
    return this.getRoomPuzzles(roomId).filter(puzzle => {
      const state = this.puzzleStates.get(puzzle.id);
      return state && !state.solved;
    });
  }

  attemptPuzzle(puzzleId: string, input: string): PuzzleResult {
    const puzzle = this.puzzles.get(puzzleId);
    const state = this.puzzleStates.get(puzzleId);

    if (!puzzle || !state) {
      return {
        success: false,
        message: 'Puzzle not found',
        corruption: 5
      };
    }

    // Increment attempts
    state.attempts++;
    state.lastAttempt = input;

    // Validate the puzzle
    const result = puzzle.validate(input, state);

    // Update state based on result
    if (result.success) {
      state.solved = true;
      state.solvedAt = Date.now();
    }

    // Save state
    this.puzzleStates.set(puzzleId, state);

    return result;
  }

  getHints(puzzleId: string): string[] {
    const puzzle = this.puzzles.get(puzzleId);
    const state = this.puzzleStates.get(puzzleId);

    if (!puzzle || !state) {
      return [];
    }

    const availableHints = puzzle.getAvailableHints(state.attempts);
    
    return availableHints
      .filter((_, index) => !state.hintsRevealed.includes(index))
      .map(hint => hint.text);
  }

  revealHint(puzzleId: string, hintIndex: number): string | null {
    const puzzle = this.puzzles.get(puzzleId);
    const state = this.puzzleStates.get(puzzleId);

    if (!puzzle || !state) {
      return null;
    }

    const availableHints = puzzle.getAvailableHints(state.attempts);
    
    if (hintIndex < availableHints.length && !state.hintsRevealed.includes(hintIndex)) {
      state.hintsRevealed.push(hintIndex);
      this.puzzleStates.set(puzzleId, state);
      return availableHints[hintIndex].text;
    }

    return null;
  }

  getProgress(): { total: number; solved: number; percentage: number } {
    const total = this.puzzles.size;
    const solved = Array.from(this.puzzleStates.values()).filter(s => s.solved).length;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    return { total, solved, percentage };
  }

  resetPuzzle(puzzleId: string): void {
    const puzzle = this.puzzles.get(puzzleId);
    if (puzzle) {
      this.puzzleStates.set(puzzleId, {
        id: puzzleId,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      });

      if (puzzle.reset) {
        puzzle.reset();
      }
    }
  }

  resetAllPuzzles(): void {
    this.puzzles.forEach(puzzle => {
      this.resetPuzzle(puzzle.id);
    });
  }

  getSolvedPuzzleIds(): string[] {
    return Array.from(this.puzzleStates.entries())
      .filter(([_, state]) => state.solved)
      .map(([id, _]) => id);
  }

  serialize(): string {
    return JSON.stringify({
      states: Array.from(this.puzzleStates.entries())
    });
  }

  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (parsed.states) {
        this.puzzleStates = new Map(parsed.states);
      }
    } catch (e) {
      console.error('Failed to deserialize puzzle state:', e);
    }
  }
}

export const puzzleManager = new PuzzleManager();