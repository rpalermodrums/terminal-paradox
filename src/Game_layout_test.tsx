import React, { useState, useEffect, useCallback, useRef } from 'react';
import { render, useTerminalDimensions } from '@opentui/react';
import { GameDisplay } from './ui/components/GameDisplay';
import { InventoryDisplay } from './ui/components/InventoryDisplay';
import { CommandInputFixed } from './ui/components/CommandInputFixed';
import { gameState } from './game/state/gameState';
import { roomFactory } from './game/rooms/roomFactory';
import { commandParser } from './game/commands/commandParser';
import { puzzleManager } from './game/puzzles/puzzleManager';
import { corruptionEngine } from './game/corruption/corruptionEngine';
import { commandCombinationEngine } from './game/commands/commandCombination';
import type { Room, GameState } from './game/state/types';

const Game: React.FC = () => {
  const [state, setState] = useState<GameState>(gameState.getState());
  const [currentRoom, setCurrentRoom] = useState<Room>(
    roomFactory.createRoom(state.currentRoom)
  );
  
  // Start with empty output to test layout
  const [output, setOutput] = useState<string[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  const { rows, cols } = useTerminalDimensions();
  
  // STRICT LAYOUT CALCULATION
  // Total available: rows
  const TITLE_HEIGHT = 1;
  const GAME_AREA_HEIGHT = 10;  // Fixed size for room + inventory
  const COMMAND_HEIGHT = 3;      // Command input box
  const OUTPUT_MAX_HEIGHT = 6;   // Maximum lines for output display
  
  // Calculate actual output height based on available space
  const totalUsed = TITLE_HEIGHT + GAME_AREA_HEIGHT + COMMAND_HEIGHT + OUTPUT_MAX_HEIGHT + 3; // +3 for borders
  const outputHeight = totalUsed > rows ? Math.max(4, OUTPUT_MAX_HEIGHT - (totalUsed - rows)) : OUTPUT_MAX_HEIGHT;
  
  // Only show last N lines of output that fit in our window
  const visibleOutput = output.slice(-outputHeight);

  const addOutput = useCallback((message: string) => {
    setOutput(prev => [...prev, message]);
  }, []);

  const handleCommand = useCallback((input: string) => {
    addOutput(`> ${input}`);
    
    // Simple test commands
    if (input === 'test') {
      addOutput('Test output line 1');
      addOutput('Test output line 2');
      addOutput('Test output line 3');
    } else if (input === 'long') {
      for (let i = 1; i <= 20; i++) {
        addOutput(`Long output line ${i}`);
      }
    } else {
      addOutput('Unknown command. Try "test" or "long"');
    }
  }, [addOutput]);

  return (
    <box display="flex" flexDirection="column" width={cols} height={rows}>
      {/* Title - Fixed 1 line */}
      <box height={TITLE_HEIGHT} width={cols}>
        <text bold fg="green">
          TERMINAL PARADOX - TEST LAYOUT
        </text>
      </box>

      {/* Game Area - Fixed height */}
      <box display="flex" flexDirection="row" height={GAME_AREA_HEIGHT} width={cols}>
        {/* Room Display */}
        <box width={Math.floor(cols * 0.6)} height={GAME_AREA_HEIGHT}>
          <box border="single" padding={1} height={GAME_AREA_HEIGHT}>
            <text>Room: {currentRoom.name}</text>
            <text>Description: {currentRoom.description.substring(0, 40)}...</text>
            <text>Exits: {Object.keys(currentRoom.exits).join(', ')}</text>
          </box>
        </box>
        
        {/* Inventory */}
        <box width={Math.floor(cols * 0.4)} height={GAME_AREA_HEIGHT}>
          <box border="single" padding={1} height={GAME_AREA_HEIGHT}>
            <text>Inventory: {state.inventory.length}/{state.maxInventory}</text>
          </box>
        </box>
      </box>

      {/* Output History - Strictly bounded */}
      <box 
        border="single" 
        height={outputHeight + 2} 
        width={cols}
        style={{ 
          borderColor: 'cyan'
        }}
      >
        <box padding={1} height={outputHeight}>
          {visibleOutput.length === 0 ? (
            <text fg="gray">No output yet. Type a command...</text>
          ) : (
            visibleOutput.map((line, i) => (
              <text key={i} fg={line.startsWith('>') ? 'cyan' : 'white'}>
                {line}
              </text>
            ))
          )}
        </box>
      </box>

      {/* Command Input - Fixed at bottom */}
      <box height={COMMAND_HEIGHT} width={cols}>
        <CommandInputFixed 
          onCommand={handleCommand} 
          isCorrupted={false} 
        />
      </box>
    </box>
  );
};

export const startTestGame = () => {
  render(<Game />);
};

export default Game;