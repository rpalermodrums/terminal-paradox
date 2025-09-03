import { BasePuzzle, PuzzleType, PuzzleDifficulty, PuzzleHint, PuzzleResult, PuzzleState } from '../types';

export class BinaryPermissionPuzzle extends BasePuzzle {
  id = 'binary-permission-1';
  type: PuzzleType = 'binary-permission';
  name = 'Access Denied';
  description = 'Set permissions to rwxr-xr-- to unlock the escape script';
  difficulty: PuzzleDifficulty = 'easy';
  corruptionModifier = 3;
  
  hints: PuzzleHint[] = [
    {
      threshold: 2,
      text: 'chmod uses octal notation: r=4, w=2, x=1'
    },
    {
      threshold: 4,
      text: 'Owner needs all permissions (7), group needs read+execute (5)'
    },
    {
      threshold: 6,
      text: 'Others need read only (4)',
      cost: 3
    },
    {
      threshold: 8,
      text: 'The answer is 754',
      cost: 8
    }
  ];

  private readonly targetPermission = '754';
  private readonly targetSymbolic = 'rwxr-xr--';

  validate(input: string, state?: PuzzleState): PuzzleResult {
    const trimmed = input.trim();
    
    // Check if input is octal notation
    if (/^\d{3}$/.test(trimmed)) {
      if (trimmed === this.targetPermission) {
        return this.createResult(true, 'Permissions set! The file is now accessible.', {
          corruption: -3,
          reward: 'chmod'
        });
      }
      
      // Valid octal but wrong
      if (this.isValidOctal(trimmed)) {
        const symbolic = this.octalToSymbolic(trimmed);
        return this.createResult(false, `Permissions set to ${symbolic}, but the file remains locked.`, {
          corruption: 1
        });
      }
      
      return this.createResult(false, 'Invalid octal notation. Use values 0-7 for each digit.', {
        corruption: 2
      });
    }
    
    // Check if input is symbolic notation
    if (/^[rwx-]{9}$/.test(trimmed)) {
      if (trimmed === this.targetSymbolic) {
        return this.createResult(true, 'Permissions matched! The file is now accessible.', {
          corruption: -3,
          reward: 'chmod'
        });
      }
      
      const octal = this.symbolicToOctal(trimmed);
      return this.createResult(false, `Permissions ${octal} (${trimmed}) don't match the required pattern.`, {
        corruption: 1
      });
    }
    
    return this.createResult(false, 'Invalid permission format. Use octal (e.g., 755) or symbolic (e.g., rwxr-xr-x).', {
      corruption: 2
    });
  }

  private isValidOctal(input: string): boolean {
    return /^[0-7]{3}$/.test(input);
  }

  private octalToSymbolic(octal: string): string {
    const permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    const digits = octal.split('').map(d => parseInt(d, 10));
    return digits.map(d => permissions[d]).join('');
  }

  private symbolicToOctal(symbolic: string): string {
    const chunks = symbolic.match(/.{3}/g) || [];
    return chunks.map(chunk => {
      let value = 0;
      if (chunk[0] === 'r') value += 4;
      if (chunk[1] === 'w') value += 2;
      if (chunk[2] === 'x') value += 1;
      return value.toString();
    }).join('');
  }
}