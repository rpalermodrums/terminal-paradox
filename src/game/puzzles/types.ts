export type PuzzleType = 
  | 'regex-escape'
  | 'binary-permission'
  | 'process-tree'
  | 'pipe-chain'
  | 'memory-allocation'
  | 'signal-handling'
  | 'meta-file'
  | 'corruption-decode';

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'nightmare';

export interface PuzzleHint {
  threshold: number; // Number of attempts before showing
  text: string;
  cost?: number; // Corruption cost to reveal
}

export interface PuzzleResult {
  success: boolean;
  message: string;
  corruption?: number; // Corruption change on solve/fail
  reward?: string; // Item or flag reward
  sideEffect?: () => void; // Additional effects
}

export interface PuzzleState {
  id: string;
  attempts: number;
  solved: boolean;
  hintsRevealed: number[];
  lastAttempt?: string;
  solvedAt?: number; // Timestamp
}

export interface IPuzzle {
  id: string;
  type: PuzzleType;
  name: string;
  description: string;
  difficulty: PuzzleDifficulty;
  hints: PuzzleHint[];
  corruptionModifier: number;
  
  validate(input: string, state?: PuzzleState): PuzzleResult;
  getAvailableHints(attempts: number): PuzzleHint[];
  getPrompt(corruption: number): string;
  reset?(): void;
}

export abstract class BasePuzzle implements IPuzzle {
  abstract id: string;
  abstract type: PuzzleType;
  abstract name: string;
  abstract description: string;
  abstract difficulty: PuzzleDifficulty;
  abstract hints: PuzzleHint[];
  abstract corruptionModifier: number;

  abstract validate(input: string, state?: PuzzleState): PuzzleResult;

  getAvailableHints(attempts: number): PuzzleHint[] {
    return this.hints.filter(hint => attempts >= hint.threshold);
  }

  getPrompt(corruption: number): string {
    const basePrompt = this.description;
    if (corruption < 25) return basePrompt;
    
    // Add corruption to prompt at higher levels
    const corruptChance = corruption / 200;
    const chars = basePrompt.split('');
    
    return chars.map(char => {
      if (char === ' ' || char === '\n') return char;
      if (Math.random() < corruptChance) {
        const glitchChars = '░▒▓█▌▐│┤';
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
  }

  protected createResult(
    success: boolean, 
    message: string, 
    options?: Partial<PuzzleResult>
  ): PuzzleResult {
    return {
      success,
      message,
      ...options
    };
  }
}