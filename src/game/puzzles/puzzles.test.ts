import { describe, it, expect, beforeEach } from 'vitest';
import { RegexEscapePuzzle } from './implementations/regexEscape';
import { BinaryPermissionPuzzle } from './implementations/binaryPermission';
import { ProcessTreePuzzle } from './implementations/processTree';
import type { PuzzleState } from './types';

describe('Puzzle System', () => {
  describe('RegexEscapePuzzle', () => {
    let puzzle: RegexEscapePuzzle;
    let state: PuzzleState;

    beforeEach(() => {
      puzzle = new RegexEscapePuzzle();
      state = {
        id: puzzle.id,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      };
    });

    it('should have correct metadata', () => {
      expect(puzzle.id).toBe('regex-escape-1');
      expect(puzzle.type).toBe('regex-escape');
      expect(puzzle.difficulty).toBe('medium');
    });

    it('should validate correct regex pattern', () => {
      const result = puzzle.validate('^\\[ERROR\\].*corruption.*$', state);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Pattern matched');
    });

    it('should reject incorrect patterns', () => {
      const result = puzzle.validate('wrong pattern', state);
      expect(result.success).toBe(false);
      expect(result.corruption).toBeGreaterThan(0);
    });

    it('should provide hints after attempts', () => {
      const hints = puzzle.getAvailableHints(0);
      expect(hints.length).toBe(0);

      const hintsAfter3 = puzzle.getAvailableHints(3);
      expect(hintsAfter3.length).toBeGreaterThan(0);
      expect(hintsAfter3[0].text).toContain('anchor');
    });

    it('should handle corrupted prompts', () => {
      const normalPrompt = puzzle.getPrompt(0);
      const corruptedPrompt = puzzle.getPrompt(80);
      
      expect(normalPrompt).toBe(puzzle.description);
      expect(corruptedPrompt).not.toBe(normalPrompt);
      expect(corruptedPrompt.length).toBe(normalPrompt.length);
    });
  });

  describe('BinaryPermissionPuzzle', () => {
    let puzzle: BinaryPermissionPuzzle;
    let state: PuzzleState;

    beforeEach(() => {
      puzzle = new BinaryPermissionPuzzle();
      state = {
        id: puzzle.id,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      };
    });

    it('should validate correct chmod values', () => {
      // Test for rwxr-xr-- (754)
      const result = puzzle.validate('754', state);
      expect(result.success).toBe(true);
      expect(result.reward).toBe('chmod');
    });

    it('should accept both octal and symbolic notation', () => {
      const octalResult = puzzle.validate('754', state);
      const symbolicResult = puzzle.validate('rwxr-xr--', state);
      
      expect(octalResult.success).toBe(true);
      expect(symbolicResult.success).toBe(true);
    });

    it('should reject invalid permissions', () => {
      const result = puzzle.validate('999', state);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid');
    });

    it('should convert between octal and symbolic', () => {
      expect(puzzle['octalToSymbolic']('755')).toBe('rwxr-xr-x');
      expect(puzzle['octalToSymbolic']('644')).toBe('rw-r--r--');
      expect(puzzle['octalToSymbolic']('777')).toBe('rwxrwxrwx');
    });
  });

  describe('ProcessTreePuzzle', () => {
    let puzzle: ProcessTreePuzzle;
    let state: PuzzleState;

    beforeEach(() => {
      puzzle = new ProcessTreePuzzle();
      state = {
        id: puzzle.id,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      };
    });

    it('should generate a process tree', () => {
      const tree = puzzle.getProcessTree();
      expect(tree).toContain('PID');
      expect(tree).toContain('PPID');
      expect(tree).toMatch(/\d+\s+\d+/);
    });

    it('should validate correct kill order', () => {
      // Kill children before parents
      const result = puzzle.validate('kill 3047 2048 1337', state);
      expect(result.success).toBe(true);
      expect(result.message).toContain('terminated');
    });

    it('should detect fork bomb if parent killed first', () => {
      const result = puzzle.validate('kill 1337', state);
      expect(result.success).toBe(false);
      expect(result.message).toContain('fork bomb');
      expect(result.corruption).toBeGreaterThan(10);
    });

    it('should track process relationships', () => {
      const tree = puzzle['processTree'];
      const children = tree.filter(p => p.ppid === 1337);
      expect(children.length).toBeGreaterThan(0);
    });
  });

  describe('Hint System', () => {
    it('should progressively reveal hints', () => {
      const puzzle = new RegexEscapePuzzle();
      
      const hints1 = puzzle.getAvailableHints(1);
      const hints3 = puzzle.getAvailableHints(3);
      const hints5 = puzzle.getAvailableHints(5);
      
      expect(hints1.length).toBeLessThan(hints3.length);
      expect(hints3.length).toBeLessThanOrEqual(hints5.length);
    });

    it('should have hint costs for harder puzzles', () => {
      const puzzle = new ProcessTreePuzzle();
      const hints = puzzle.hints;
      
      const hardHint = hints.find(h => h.threshold > 5);
      expect(hardHint?.cost).toBeGreaterThan(0);
    });
  });

  describe('Corruption Effects', () => {
    it('should increase corruption on failure', () => {
      const puzzle = new BinaryPermissionPuzzle();
      const state: PuzzleState = {
        id: puzzle.id,
        attempts: 5,
        solved: false,
        hintsRevealed: []
      };

      const result = puzzle.validate('wrong', state);
      expect(result.success).toBe(false);
      expect(result.corruption).toBeGreaterThan(0);
    });

    it('should decrease corruption on success for certain puzzles', () => {
      const puzzle = new ProcessTreePuzzle();
      const state: PuzzleState = {
        id: puzzle.id,
        attempts: 0,
        solved: false,
        hintsRevealed: []
      };

      const result = puzzle.validate('kill 3047 2048 1337', state);
      expect(result.success).toBe(true);
      expect(result.corruption).toBeLessThan(0);
    });
  });
});