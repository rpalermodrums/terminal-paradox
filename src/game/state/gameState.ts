import { GameState, RoomId, CommandItem } from './types';

const createInitialState = (): GameState => ({
  currentRoom: 'boot-sequence',
  inventory: [],
  maxInventory: 5,
  flags: {},
  corruption: 0,
  moves: 0,
  startTime: Date.now(),
  history: []
});

export class GameStateManager {
  private state: GameState;
  private listeners: Set<(state: GameState) => void> = new Set();

  constructor(autoLoad = true) {
    this.state = createInitialState();
    if (autoLoad) {
      this.loadFromStorage();
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
    this.saveToStorage();
  }

  moveToRoom(roomId: RoomId) {
    this.state.currentRoom = roomId;
    this.state.moves++;
    this.addHistory(`Entered ${roomId}`);
    this.notify();
  }

  addItem(item: CommandItem): boolean {
    if (this.state.inventory.length >= this.state.maxInventory) {
      return false;
    }
    this.state.inventory.push(item);
    this.addHistory(`Acquired command: ${item}`);
    this.notify();
    return true;
  }

  removeItem(item: CommandItem): boolean {
    const index = this.state.inventory.indexOf(item);
    if (index === -1) return false;
    
    this.state.inventory.splice(index, 1);
    this.addHistory(`Used command: ${item}`);
    this.notify();
    return true;
  }

  hasItem(item: CommandItem): boolean {
    return this.state.inventory.includes(item);
  }

  setFlag(key: string, value: boolean) {
    this.state.flags[key] = value;
    this.notify();
  }

  getFlag(key: string): boolean {
    return this.state.flags[key] || false;
  }

  increaseCorruption(amount: number) {
    this.state.corruption = Math.min(100, this.state.corruption + amount);
    if (this.state.corruption > 50) {
      this.addHistory('WARNING: System corruption detected');
    }
    this.notify();
  }

  decreaseCorruption(amount: number) {
    this.state.corruption = Math.max(0, this.state.corruption - amount);
    this.notify();
  }

  private addHistory(entry: string) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    this.state.history.push(`[${timestamp}] ${entry}`);
    if (this.state.history.length > 100) {
      this.state.history.shift();
    }
  }

  reset() {
    this.state = createInitialState();
    this.notify();
  }

  private saveToStorage() {
    try {
      const saveData = {
        state: this.state,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      localStorage.setItem('terminal-paradox-save', JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('terminal-paradox-save');
      if (saved) {
        const saveData = JSON.parse(saved);
        if (saveData.version === '1.0.0') {
          this.state = saveData.state;
        }
      }
    } catch (e) {
      console.error('Failed to load game:', e);
    }
  }

  getElapsedTime(): number {
    return Date.now() - this.state.startTime;
  }

  getFormattedTime(): string {
    const elapsed = this.getElapsedTime();
    return this.formatTime(elapsed);
  }

  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / 60000) % 60;
    const hours = Math.floor(milliseconds / 3600000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const gameState = new GameStateManager();

export const createTestGameState = () => new GameStateManager(false);

export const formatTime = (ms: number) => {
  const manager = new GameStateManager(false);
  return manager.formatTime(ms);
};