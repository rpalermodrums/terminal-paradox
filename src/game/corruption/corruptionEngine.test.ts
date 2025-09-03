import { describe, it, expect, beforeEach } from 'vitest';
import { CorruptionEngine } from './corruptionEngine';

describe('CorruptionEngine', () => {
  let engine: CorruptionEngine;

  beforeEach(() => {
    engine = new CorruptionEngine();
  });

  describe('corruption level management', () => {
    it('should start at 0 corruption', () => {
      const state = engine.getState();
      expect(state.level).toBe(0);
      expect(state.activeEffects.size).toBe(0);
    });

    it('should increase and decrease corruption', () => {
      engine.increase(25);
      expect(engine.getState().level).toBe(25);
      
      engine.decrease(10);
      expect(engine.getState().level).toBe(15);
    });

    it('should clamp corruption between 0 and 100', () => {
      engine.increase(150);
      expect(engine.getState().level).toBe(100);
      
      engine.decrease(200);
      expect(engine.getState().level).toBe(0);
    });
  });

  describe('effect activation', () => {
    it('should activate text-scramble at level 15', () => {
      engine.setLevel(14);
      expect(engine.getState().activeEffects.has('text-scramble')).toBe(false);
      
      engine.setLevel(15);
      expect(engine.getState().activeEffects.has('text-scramble')).toBe(true);
    });

    it('should activate multiple effects at high corruption', () => {
      engine.setLevel(75);
      const state = engine.getState();
      
      expect(state.activeEffects.has('text-scramble')).toBe(true);
      expect(state.activeEffects.has('command-intercept')).toBe(true);
      expect(state.activeEffects.has('memory-shuffle')).toBe(true);
      expect(state.activeEffects.has('input-lag')).toBe(true);
    });

    it('should have all effects at max corruption', () => {
      engine.setLevel(100);
      const state = engine.getState();
      expect(state.activeEffects.size).toBeGreaterThanOrEqual(7);
    });
  });

  describe('text corruption', () => {
    it('should not corrupt text at low levels', () => {
      engine.setLevel(10);
      const text = 'Hello World';
      expect(engine.corruptText(text)).toBe(text);
    });

    it('should preserve spaces and newlines', () => {
      engine.setLevel(50);
      const text = 'Hello World\nNew Line';
      const corrupted = engine.corruptText(text);
      
      // Count spaces and newlines
      const originalSpaces = (text.match(/ /g) || []).length;
      const originalNewlines = (text.match(/\n/g) || []).length;
      const corruptedSpaces = (corrupted.match(/ /g) || []).length;
      const corruptedNewlines = (corrupted.match(/\n/g) || []).length;
      
      expect(corruptedSpaces).toBe(originalSpaces);
      expect(corruptedNewlines).toBe(originalNewlines);
    });
  });

  describe('command interception', () => {
    it('should not intercept at low corruption', () => {
      engine.setLevel(20);
      expect(engine.interceptCommand('help')).toBe('help');
    });

    it('should intercept commands at level 30+', () => {
      engine.setLevel(35);
      const intercepted = engine.interceptCommand('help');
      expect(['help', 'hinder']).toContain(intercepted);
    });

    it('should intercept more commands at higher levels', () => {
      engine.setLevel(60);
      
      // Multiple interceptions should be active
      const helpResult = engine.interceptCommand('help');
      const northResult = engine.interceptCommand('north test');
      
      expect(helpResult).toBe('hinder');
      expect(northResult).toBe('south test');
    });
  });

  describe('memory shuffle', () => {
    it('should not shuffle at low corruption', () => {
      engine.setLevel(30);
      const array = [1, 2, 3, 4, 5];
      const result = engine.shuffleArray(array);
      expect(result).toEqual(array);
    });

    it('should potentially shuffle at level 40+', () => {
      engine.setLevel(100);
      const array = [1, 2, 3, 4, 5];
      
      // Run multiple times to account for randomness
      let wasShuffled = false;
      for (let i = 0; i < 10; i++) {
        const result = engine.shuffleArray([...array]);
        if (result.join(',') !== array.join(',')) {
          wasShuffled = true;
          break;
        }
      }
      
      expect(wasShuffled).toBe(true);
    });
  });

  describe('input delay', () => {
    it('should have no delay below level 70', () => {
      engine.setLevel(60);
      expect(engine.getInputDelay()).toBe(0);
    });

    it('should calculate delay at level 70+', () => {
      engine.setLevel(75);
      const delay = engine.getInputDelay();
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(2000);
    });
  });

  describe('echo loop', () => {
    it('should not echo below level 80', () => {
      engine.setLevel(75);
      expect(engine.shouldEchoCommand()).toBe(false);
    });

    it('should potentially echo at level 80+', () => {
      engine.setLevel(90);
      
      // Test multiple times for randomness
      let echoed = false;
      for (let i = 0; i < 20; i++) {
        if (engine.shouldEchoCommand()) {
          echoed = true;
          break;
        }
      }
      
      expect(echoed).toBe(true);
    });
  });

  describe('visual glitch', () => {
    it('should not generate glitch below level 25', () => {
      engine.setLevel(20);
      const glitch = engine.generateGlitch(10, 5);
      expect(glitch.replace(/\s/g, '')).toBe('');
    });

    it('should generate glitch patterns at level 25+', () => {
      engine.setLevel(50);
      const glitch = engine.generateGlitch(20, 5);
      
      // Should contain some glitch characters
      expect(glitch.length).toBeGreaterThan(0);
      const hasGlitchChars = /[▓▒░█▄▀▌▐]/.test(glitch);
      
      // Multiple attempts for randomness
      let foundGlitch = hasGlitchChars;
      for (let i = 0; i < 5 && !foundGlitch; i++) {
        const newGlitch = engine.generateGlitch(20, 5);
        foundGlitch = /[▓▒░█▄▀▌▐]/.test(newGlitch);
      }
      
      expect(foundGlitch).toBe(true);
    });
  });

  describe('time dilation', () => {
    it('should have normal time below level 50', () => {
      engine.setLevel(45);
      expect(engine.getTimeDilation()).toBe(1);
    });

    it('should vary time at level 50+', () => {
      engine.setLevel(60);
      const dilation = engine.getTimeDilation();
      expect(dilation).toBeGreaterThanOrEqual(0.5);
      expect(dilation).toBeLessThanOrEqual(1.5);
    });
  });
});