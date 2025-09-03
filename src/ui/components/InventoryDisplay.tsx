import React from 'react';
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
    <box
      border="single"
      padding={1}
      style={{
        borderColor: 'cyan',
        minHeight: 8
      }}
    >
      <box marginBottom={1}>
        <text bold fg="cyan">
          {'>'} COMMAND INVENTORY
        </text>
      </box>

      <box marginBottom={1}>
        <text fg={getMemoryColor()}>
          Memory: {getMemoryBar()} {memoryUsed}/{maxInventory}
        </text>
      </box>

      <box>
        {inventory.length === 0 ? (
          <text fg="gray" italic>
            [No commands in memory]
          </text>
        ) : (
          inventory.map((item, index) => (
            <box key={index}>
              <text fg="yellow">
                {index + 1}. {item}
              </text>
            </box>
          ))
        )}
      </box>

      {memoryUsed === maxInventory && (
        <box marginTop={1}>
          <text fg="red" bold>
            [MEMORY FULL - Drop items to continue]
          </text>
        </box>
      )}
    </box>
  );
};