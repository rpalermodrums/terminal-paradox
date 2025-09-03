import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestGameState } from './gameState';
import type { GameStateManager } from './gameState';
import type { CommandItem, RoomId } from './types';

describe('GameStateManager', () => {
  let gameState: GameStateManager;

  beforeEach(() => {
    gameState = createTestGameState();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with initial state', () => {
      const state = gameState.getState();
      expect(state.currentRoom).toBe('boot-sequence');
      expect(state.inventory).toEqual([]);
      expect(state.corruption).toBe(0);
      expect(state.moves).toBe(0);
      expect(state.maxInventory).toBe(5);
    });

    it('should have valid start time', () => {
      const state = gameState.getState();
      expect(state.startTime).toBeLessThanOrEqual(Date.now());
      expect(state.startTime).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('room navigation', () => {
    it('should move to new room', () => {
      gameState.moveToRoom('file-maze');
      const state = gameState.getState();
      expect(state.currentRoom).toBe('file-maze');
      expect(state.moves).toBe(1);
    });

    it('should track movement history', () => {
      gameState.moveToRoom('process-prison');
      const state = gameState.getState();
      expect(state.history[0]).toContain('Entered process-prison');
    });

    it('should increment moves counter', () => {
      gameState.moveToRoom('file-maze');
      gameState.moveToRoom('process-prison');
      gameState.moveToRoom('memory-leak');
      const state = gameState.getState();
      expect(state.moves).toBe(3);
    });
  });

  describe('inventory management', () => {
    it('should add items to inventory', () => {
      const added = gameState.addItem('ls');
      expect(added).toBe(true);
      expect(gameState.getState().inventory).toContain('ls');
    });

    it('should respect max inventory limit', () => {
      const items: CommandItem[] = ['ls', 'grep', 'chmod', 'sudo', 'cat'];
      items.forEach(item => gameState.addItem(item));
      
      const added = gameState.addItem('echo');
      expect(added).toBe(false);
      expect(gameState.getState().inventory).not.toContain('echo');
      expect(gameState.getState().inventory.length).toBe(5);
    });

    it('should remove items from inventory', () => {
      gameState.addItem('grep');
      gameState.addItem('ls');
      
      const removed = gameState.removeItem('grep');
      expect(removed).toBe(true);
      expect(gameState.getState().inventory).not.toContain('grep');
      expect(gameState.getState().inventory).toContain('ls');
    });

    it('should return false when removing non-existent item', () => {
      const removed = gameState.removeItem('sudo');
      expect(removed).toBe(false);
    });

    it('should check item existence correctly', () => {
      gameState.addItem('chmod');
      expect(gameState.hasItem('chmod')).toBe(true);
      expect(gameState.hasItem('kill')).toBe(false);
    });
  });

  describe('flags management', () => {
    it('should set and get flags', () => {
      gameState.setFlag('door_unlocked', true);
      expect(gameState.getFlag('door_unlocked')).toBe(true);
    });

    it('should return false for unset flags', () => {
      expect(gameState.getFlag('nonexistent')).toBe(false);
    });

    it('should update existing flags', () => {
      gameState.setFlag('puzzle_solved', true);
      gameState.setFlag('puzzle_solved', false);
      expect(gameState.getFlag('puzzle_solved')).toBe(false);
    });
  });

  describe('corruption system', () => {
    it('should increase corruption', () => {
      gameState.increaseCorruption(25);
      expect(gameState.getState().corruption).toBe(25);
    });

    it('should cap corruption at 100', () => {
      gameState.increaseCorruption(150);
      expect(gameState.getState().corruption).toBe(100);
    });

    it('should decrease corruption', () => {
      gameState.increaseCorruption(50);
      gameState.decreaseCorruption(20);
      expect(gameState.getState().corruption).toBe(30);
    });

    it('should not go below 0 corruption', () => {
      gameState.decreaseCorruption(50);
      expect(gameState.getState().corruption).toBe(0);
    });

    it('should add warning to history when corruption > 50', () => {
      gameState.increaseCorruption(60);
      const state = gameState.getState();
      expect(state.history.some(h => h.includes('WARNING: System corruption detected'))).toBe(true);
    });
  });

  describe('state persistence', () => {
    it('should save state to localStorage', () => {
      gameState.addItem('ls');
      gameState.moveToRoom('file-maze');
      
      expect(localStorage.setItem).toHaveBeenCalled();
      const savedData = (localStorage.setItem as any).mock.calls[
        (localStorage.setItem as any).mock.calls.length - 1
      ][1];
      const parsed = JSON.parse(savedData);
      
      expect(parsed.state.currentRoom).toBe('file-maze');
      expect(parsed.state.inventory).toContain('ls');
      expect(parsed.version).toBe('1.0.0');
    });

    it('should reset game state', () => {
      gameState.addItem('grep');
      gameState.moveToRoom('root-vault');
      gameState.increaseCorruption(50);
      
      gameState.reset();
      
      const state = gameState.getState();
      expect(state.currentRoom).toBe('boot-sequence');
      expect(state.inventory).toEqual([]);
      expect(state.corruption).toBe(0);
      expect(state.moves).toBe(0);
    });
  });

  describe('time tracking', () => {
    it('should format elapsed time correctly', () => {
      // Test formatting directly with known values
      const oneHourOneMinuteFiveSeconds = 3665000;
      const formatted = gameState.formatTime(oneHourOneMinuteFiveSeconds);
      expect(formatted).toBe('01:01:05');
    });

    it('should track elapsed time', () => {
      const elapsed = gameState.getElapsedTime();
      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(1000); // Should be less than 1 second in test
    });
  });

  describe('subscription system', () => {
    it('should notify subscribers on state change', () => {
      const listener = vi.fn();
      gameState.subscribe(listener);
      
      gameState.addItem('ls');
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        inventory: ['ls']
      }));
    });

    it('should support unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = gameState.subscribe(listener);
      
      gameState.addItem('ls');
      expect(listener).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      gameState.addItem('grep');
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      gameState.subscribe(listener1);
      gameState.subscribe(listener2);
      
      gameState.moveToRoom('memory-leak');
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});