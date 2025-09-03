import type { Room, RoomId, Direction, CommandItem } from '../state/types';

export class RoomFactory {
  private rooms: Map<RoomId, Room>;

  constructor() {
    this.rooms = new Map();
    this.initializeRooms();
  }

  private initializeRooms() {
    const bootSequence: Room = {
      id: 'boot-sequence',
      name: 'Boot Sequence',
      description: 'You find yourself in a corrupted boot sequence. Green text flickers on black screens. The system is trying to initialize but something is wrong...',
      ascii: `
╔════════════════════════════════════════════╗
║         TERMINAL PARADOX v0.0.1            ║
║                                            ║
║  > SYSTEM BOOT SEQUENCE                    ║
║  > Loading kernel... [ERROR]                ║
║  > Memory check... [CORRUPTED]              ║
║  > User trapped in: /dev/null               ║
║                                            ║
║  Type 'help' for commands                  ║
╚════════════════════════════════════════════╝`,
      exits: {
        north: 'file-maze'
      },
      items: ['ls'],
      puzzles: ['boot-puzzle'],
      corrupted: false
    };

    const fileMaze: Room = {
      id: 'file-maze',
      name: 'File System Maze',
      description: 'A labyrinth of directories and symlinks. Files appear and disappear. The path keeps changing. You hear the sound of hard drives spinning.',
      ascii: `
/root
├── bin/
│   └── [LOCKED]
├── etc/
│   ├── shadow [CORRUPTED]
│   └── passwd [READABLE]
├── usr/
│   └── local/
│       └── escape/
│           └── portal.sh [ENCRYPTED]
└── dev/
    └── null [YOU ARE HERE]`,
      exits: {
        south: 'boot-sequence',
        east: 'process-prison',
        west: 'memory-leak'
      },
      items: ['grep'],
      puzzles: ['maze-navigation', 'permission-puzzle'],
      corrupted: false
    };

    const processPrison: Room = {
      id: 'process-prison',
      name: 'Process Prison',
      description: 'Zombie processes wander aimlessly. Fork bombs threaten to overwhelm the system. You must kill the right processes to proceed.',
      ascii: `
PID   PPID  STATUS    COMMAND
1     0     sleeping  /sbin/init
666   1     zombie    [defunct]
1337  1     running   /usr/bin/escape
9999  666   zombie    [trap]
2048  1     sleeping  /usr/bin/guardian
????  ????  ???????   [REDACTED]`,
      exits: {
        west: 'file-maze',
        north: 'root-vault'
      },
      items: ['kill', 'ps'],
      puzzles: ['process-killer', 'fork-bomb-defusal'],
      corrupted: true
    };

    const memoryLeak: Room = {
      id: 'memory-leak',
      name: 'Memory Leak Chamber',
      description: 'Memory is leaking everywhere. Pointers dangle in the void. Stack overflows threaten to crash everything. You must plug the leaks.',
      ascii: `
[████████████████████████░░░░░] 89% MEMORY USED
WARNING: CRITICAL MEMORY PRESSURE
FREE: 128MB | USED: 15.8GB | SWAP: EXHAUSTED

0x7fff8badc000: ░░░░░░░░░░░░░░░░
0x7fff8bade000: ████████████████
0x7fff8bae0000: ░▓▓▓░▓▓▓░▓▓▓░▓▓▓
0x7fff8bae2000: SEGMENTATION FAULT`,
      exits: {
        east: 'file-maze'
      },
      items: ['free', 'malloc'],
      puzzles: ['memory-management', 'pointer-arithmetic'],
      corrupted: true
    };

    const rootVault: Room = {
      id: 'root-vault',
      name: 'Root Access Vault',
      description: 'The heart of the system. Root access awaits, but the final guardian blocks your path. This is where you can finally escape... or become one with the system.',
      ascii: `
         .-.
        (o o)
        | O \\
         \\   \\
          \`~~~'
    ROOT GUARDIAN

"WHO DARES SEEK ROOT ACCESS?"
[AUTHENTICATION REQUIRED]`,
      exits: {
        south: 'process-prison'
      },
      items: ['sudo', 'chmod'],
      puzzles: ['root-authentication', 'final-escape'],
      corrupted: false
    };

    // Store all rooms
    this.rooms.set('boot-sequence', bootSequence);
    this.rooms.set('file-maze', fileMaze);
    this.rooms.set('process-prison', processPrison);
    this.rooms.set('memory-leak', memoryLeak);
    this.rooms.set('root-vault', rootVault);
  }

  createRoom(id: RoomId): Room {
    const room = this.rooms.get(id);
    if (!room) {
      throw new Error(`Room ${id} not found`);
    }
    // Return a copy to prevent external modifications
    return { ...room, items: [...room.items], puzzles: [...room.puzzles] };
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map(room => this.createRoom(room.id));
  }

  canMove(room: Room, direction: Direction): boolean {
    return direction in room.exits;
  }

  getDestination(room: Room, direction: Direction): RoomId | null {
    return room.exits[direction] || null;
  }

  getRoomConnections(): Map<RoomId, Set<RoomId>> {
    const connections = new Map<RoomId, Set<RoomId>>();
    
    this.rooms.forEach((room, id) => {
      const roomConnections = new Set<RoomId>();
      Object.values(room.exits).forEach(exitId => {
        roomConnections.add(exitId as RoomId);
      });
      connections.set(id, roomConnections);
    });
    
    return connections;
  }

  validateConnectivity(): boolean {
    // Check if all rooms are reachable from boot-sequence
    const visited = new Set<RoomId>();
    const queue: RoomId[] = ['boot-sequence'];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      
      visited.add(current);
      const room = this.rooms.get(current)!;
      
      Object.values(room.exits).forEach(exitId => {
        if (!visited.has(exitId as RoomId)) {
          queue.push(exitId as RoomId);
        }
      });
    }
    
    return visited.size === this.rooms.size;
  }
}

export const roomFactory = new RoomFactory();