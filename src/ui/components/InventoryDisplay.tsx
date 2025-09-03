import React from 'react';
import { Box, Text } from '@opentui/react';
import type { CommandItem } from '../../game/state/types';

interface InventoryDisplayProps {
  inventory: CommandItem[];
  maxInventory: number;
}

export const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ 
  inventory, 
  maxInventory 
}) => {
  const memoryUsed = inventory.length;
  const memoryPercentage = (memoryUsed / maxInventory) * 100;
  
  const getMemoryBar = () => {
    const barLength = 20;
    const filledLength = Math.floor((memoryUsed / maxInventory) * barLength);
    const emptyLength = barLength - filledLength;
    
    const filled = '█'.repeat(filledLength);
    const empty = '░'.repeat(emptyLength);
    
    return `[${filled}${empty}]`;
  };

  const getMemoryColor = () => {
    if (memoryPercentage >= 80) return 'red';
    if (memoryPercentage >= 60) return 'yellow';
    return 'green';
  };

  return (
    <Box
      border="single"
      padding={1}
      style={{
        borderColor: 'cyan',
        minHeight: 8
      }}
    >
      <Box marginBottom={1}>
        <Text bold fg="cyan">
          {'>'} COMMAND INVENTORY
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text fg={getMemoryColor()}>
          Memory: {getMemoryBar()} {memoryUsed}/{maxInventory}
        </Text>
      </Box>

      <Box>
        {inventory.length === 0 ? (
          <Text fg="gray" italic>
            [No commands in memory]
          </Text>
        ) : (
          inventory.map((item, index) => (
            <Box key={index}>
              <Text fg="yellow">
                {index + 1}. {item}
              </Text>
            </Box>
          ))
        )}
      </Box>

      {memoryUsed === maxInventory && (
        <Box marginTop={1}>
          <Text fg="red" bold>
            [MEMORY FULL - Drop items to continue]
          </Text>
        </Box>
      )}
    </Box>
  );
};