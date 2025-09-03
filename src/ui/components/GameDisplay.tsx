import React from 'react';
import { Box, Text } from '@opentui/react';
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
    <Box
      border="single"
      padding={1}
      style={{
        borderColor: corruptionLevel > 50 ? 'red' : 'green',
        minHeight: 20
      }}
    >
      {/* Room Title */}
      <Box marginBottom={1}>
        <Text 
          bold 
          fg={corruptionLevel > 75 ? 'red' : 'cyan'}
        >
          {'>'} {corruptText(room.name.toUpperCase())}
        </Text>
      </Box>

      {/* ASCII Art if available */}
      {room.ascii && (
        <Box marginBottom={1}>
          <Text fg="green" dim>
            {corruptText(room.ascii)}
          </Text>
        </Box>
      )}

      {/* Room Description */}
      <Box marginBottom={1}>
        <Text fg="white">
          {corruptText(room.description)}
        </Text>
      </Box>

      {/* Available Exits */}
      <Box marginBottom={1}>
        <Text fg="yellow">
          Exits: {Object.keys(room.exits).join(', ') || 'none'}
        </Text>
      </Box>

      {/* Items in Room */}
      {room.items.length > 0 && (
        <Box marginBottom={1}>
          <Text fg="magenta">
            Items here: {room.items.join(', ')}
          </Text>
        </Box>
      )}

      {/* Corruption Warning */}
      {corruptionLevel > 0 && (
        <Box marginTop={1}>
          <Text 
            fg={corruptionLevel > 75 ? 'red' : corruptionLevel > 50 ? 'yellow' : 'white'}
            bold={corruptionLevel > 50}
          >
            [SYSTEM CORRUPTION: {corruptionLevel}%]
          </Text>
        </Box>
      )}
    </Box>
  );
};