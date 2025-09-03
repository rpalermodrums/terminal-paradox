import { describe, it, expect } from 'vitest';
import { RoomFactory } from './roomFactory';
import type { Room, RoomId, Direction } from '../state/types';

describe('RoomFactory', () => {
  const factory = new RoomFactory();

  describe('room creation', () => {
    it('should create boot-sequence room', () => {
      const room = factory.createRoom('boot-sequence');
      expect(room.id).toBe('boot-sequence');
      expect(room.name).toBe('Boot Sequence');
      expect(room.description).toContain('corrupted');
      expect(room.exits).toHaveProperty('north');
    });

    it('should create file-maze room', () => {
      const room = factory.createRoom('file-maze');
      expect(room.id).toBe('file-maze');
      expect(room.name).toBe('File System Maze');
      expect(room.exits).toHaveProperty('south');
      expect(room.exits).toHaveProperty('east');
    });

    it('should create all defined rooms', () => {
      const roomIds: RoomId[] = [
        'boot-sequence',
        'file-maze',
        'process-prison',
        'memory-leak',
        'root-vault'
      ];

      roomIds.forEach(id => {
        const room = factory.createRoom(id);
        expect(room).toBeDefined();
        expect(room.id).toBe(id);
        expect(room.name).toBeTruthy();
        expect(room.description).toBeTruthy();
      });
    });
  });

  describe('room connectivity', () => {
    it('should have bidirectional connections', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      const fileMaze = factory.createRoom('file-maze');
      
      // If boot-sequence has north exit to file-maze
      if (bootRoom.exits.north === 'file-maze') {
        // file-maze should have south exit to boot-sequence
        expect(fileMaze.exits.south).toBe('boot-sequence');
      }
    });

    it('should not have exits to non-existent rooms', () => {
      const allRooms = factory.getAllRooms();
      const validRoomIds = new Set(allRooms.map(r => r.id));

      allRooms.forEach(room => {
        Object.values(room.exits).forEach(exitRoomId => {
          expect(validRoomIds.has(exitRoomId as RoomId)).toBe(true);
        });
      });
    });
  });

  describe('room properties', () => {
    it('should have items in certain rooms', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      expect(bootRoom.items.length).toBeGreaterThan(0);
      expect(bootRoom.items).toContain('ls');
    });

    it('should have puzzles in rooms', () => {
      const fileMaze = factory.createRoom('file-maze');
      expect(fileMaze.puzzles.length).toBeGreaterThan(0);
    });

    it('should track corruption state', () => {
      const memoryLeak = factory.createRoom('memory-leak');
      expect(typeof memoryLeak.corrupted).toBe('boolean');
    });
  });

  describe('navigation validation', () => {
    it('should validate if movement is possible', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      const canMoveNorth = factory.canMove(bootRoom, 'north');
      const canMoveSouth = factory.canMove(bootRoom, 'south');
      
      expect(canMoveNorth).toBe(true);
      expect(canMoveSouth).toBe(false);
    });

    it('should get destination room', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      const destination = factory.getDestination(bootRoom, 'north');
      
      expect(destination).toBe('file-maze');
    });

    it('should return null for invalid direction', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      const destination = factory.getDestination(bootRoom, 'south');
      
      expect(destination).toBeNull();
    });
  });

  describe('room ASCII art', () => {
    it('should have ASCII art for certain rooms', () => {
      const bootRoom = factory.createRoom('boot-sequence');
      expect(bootRoom.ascii).toBeDefined();
      expect(bootRoom.ascii).toContain('TERMINAL');
    });
  });
});