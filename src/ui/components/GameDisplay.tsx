import React from 'react';
import type { Room, GameState } from '../../game/state/types';

interface GameDisplayProps {
  room: Room;
  gameState: GameState;
}

export const GameDisplay: React.FC<GameDisplayProps> = ({ room, gameState }) => {
  const corruptionLevel = gameState.corruption;
  
  // Apply corruption effects to text
  const corruptText = (text: string): string => {
    if (corruptionLevel === 0) return text;
    
    const chars = text.split('');
    const corruptChance = corruptionLevel / 200; // Max 50% chance at 100 corruption
    
    return chars.map(char => {
      if (char === ' ' || char === '\n') return char;
      if (Math.random() < corruptChance) {
        // Replace with random glitch characters
        const glitchChars = '░▒▓█▀▄▌▐│┤┬┴├┼';
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    }).join('');
  };

  return (
    <box
      border="single"
      padding={1}
      style={{
        borderColor: corruptionLevel > 50 ? 'red' : 'green',
        minHeight: 20
      }}
    >
      {/* Room Title */}
      <box marginBottom={1}>
        <text 
          bold 
          fg={corruptionLevel > 75 ? 'red' : 'cyan'}
        >
          {'>'} {corruptText(room.name.toUpperCase())}
        </text>
      </box>

      {/* ASCII Art if available */}
      {room.ascii && (
        <box marginBottom={1}>
          <text fg="green" dim>
            {corruptText(room.ascii)}
          </text>
        </box>
      )}

      {/* Room Description */}
      <box marginBottom={1}>
        <text fg="white">
          {corruptText(room.description)}
        </text>
      </box>

      {/* Available Exits */}
      <box marginBottom={1}>
        <text fg="yellow">
          Exits: {Object.keys(room.exits).join(', ') || 'none'}
        </text>
      </box>

      {/* Items in Room */}
      {room.items.length > 0 && (
        <box marginBottom={1}>
          <text fg="magenta">
            Items here: {room.items.join(', ')}
          </text>
        </box>
      )}

      {/* Corruption Warning */}
      {corruptionLevel > 0 && (
        <box marginTop={1}>
          <text 
            fg={corruptionLevel > 75 ? 'red' : corruptionLevel > 50 ? 'yellow' : 'white'}
            bold={corruptionLevel > 50}
          >
            [SYSTEM CORRUPTION: {corruptionLevel}%]
          </text>
        </box>
      )}
    </box>
  );
};