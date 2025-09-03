import { BasePuzzle, PuzzleType, PuzzleDifficulty, PuzzleHint, PuzzleResult, PuzzleState } from '../types';

export class RegexEscapePuzzle extends BasePuzzle {
  id = 'regex-escape-1';
  type: PuzzleType = 'regex-escape';
  name = 'Pattern Recognition';
  description = 'Match the corrupted log pattern: [ERROR] *corruption* detected at 0x????';
  difficulty: PuzzleDifficulty = 'medium';
  corruptionModifier = 5;
  
  hints: PuzzleHint[] = [
    {
      threshold: 3,
      text: 'Remember to anchor your pattern with ^ and $'
    },
    {
      threshold: 5,
      text: 'The brackets around ERROR need escaping: \\[ERROR\\]'
    },
    {
      threshold: 7,
      text: 'Use .* for any characters and 0x[0-9a-fA-F]+ for hex',
      cost: 5
    },
    {
      threshold: 10,
      text: 'Full solution: ^\\[ERROR\\].*corruption.*0x[0-9a-fA-F]+$',
      cost: 10
    }
  ];

  private readonly solution = /^\\\[ERROR\\\].*corruption.*(?:0x[0-9a-fA-F]+|\?)$/;
  private readonly testString = '[ERROR] Memory corruption detected at 0x7fff';

  validate(input: string, state?: PuzzleState): PuzzleResult {
    try {
      // Try to create a regex from user input
      const userRegex = new RegExp(input);
      
      // Test if the regex matches our test string
      if (userRegex.test(this.testString)) {
        return this.createResult(true, 'Pattern matched! The corruption clears slightly.', {
          corruption: -5,
          reward: 'grep'
        });
      } else {
        return this.createResult(false, 'Pattern does not match the corrupted logs.', {
          corruption: 2
        });
      }
    } catch (error) {
      // Invalid regex syntax
      return this.createResult(false, `REGEX ERROR: ${error instanceof Error ? error.message : 'Invalid pattern'}`, {
        corruption: 3
      });
    }
  }
}