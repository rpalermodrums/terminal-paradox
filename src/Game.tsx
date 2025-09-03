import React, { useState, useEffect, useCallback, useRef } from 'react';
import { render, useKeyboard, useTerminalDimensions } from '@opentui/react';
import { GameDisplay } from './ui/components/GameDisplay';
import { InventoryDisplay } from './ui/components/InventoryDisplay';
import { CommandInputFixed } from './ui/components/CommandInputFixed';
import { gameState } from './game/state/gameState';
import { roomFactory } from './game/rooms/roomFactory';
import { commandParser, type ParsedCommand } from './game/commands/commandParser';
import { puzzleManager } from './game/puzzles/puzzleManager';
import { corruptionEngine } from './game/corruption/corruptionEngine';
import { commandCombinationEngine } from './game/commands/commandCombination';
import type { Room, GameState } from './game/state/types';

const Game: React.FC = () => {
  const [state, setState] = useState<GameState>(gameState.getState());
  const [currentRoom, setCurrentRoom] = useState<Room>(
    roomFactory.createRoom(state.currentRoom)
  );
  // Start with empty output - the initial message shows in the room description
  const [output, setOutput] = useState<string[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);  // Start at top of output
  const outputRef = useRef<string[]>([]);  // Initialize empty
  
  // Get terminal dimensions early
  const { rows, cols } = useTerminalDimensions();
  
  // FIXED LAYOUT - must add up exactly to terminal height
  const TITLE_HEIGHT = 1;
  const COMMAND_HEIGHT = 3;
  
  // Use actual terminal dimensions (useTerminalDimensions should give us the real values)
  // If not available, use process.stdout dimensions as fallback
  const terminalRows = rows || (process.stdout?.rows || 40);
  const terminalCols = cols || (process.stdout?.columns || 80);
  
  // Calculate remaining space for game and output
  const remainingHeight = terminalRows - TITLE_HEIGHT - COMMAND_HEIGHT;
  
  // Split remaining height between game and output
  // More balanced split for better output visibility
  const GAME_AREA_HEIGHT = Math.floor(remainingHeight * 0.5); // 50% for game display
  const OUTPUT_DISPLAY_HEIGHT = remainingHeight - GAME_AREA_HEIGHT; // 50% for command output
  
  // Total should ALWAYS equal terminal height
  const TOTAL_HEIGHT = TITLE_HEIGHT + GAME_AREA_HEIGHT + OUTPUT_DISPLAY_HEIGHT + COMMAND_HEIGHT;

  useEffect(() => {
    const unsubscribe = gameState.subscribe((newState) => {
      setState(newState);
      setCurrentRoom(roomFactory.createRoom(newState.currentRoom));
      // Update corruption engine
      corruptionEngine.setLevel(newState.corruption);
    });
    
    // Initialize corruption
    corruptionEngine.setLevel(state.corruption);
    
    return unsubscribe;
  }, []);

  const addOutput = useCallback((message: string) => {
    // Apply corruption to output if high corruption
    const displayMessage = state.corruption > 30 ? 
      corruptionEngine.corruptText(message) : message;
    
    setOutput(prev => {
      const newOutput = [...prev, displayMessage];
      outputRef.current = newOutput;
      // Keep a large buffer for scrolling
      if (newOutput.length > 100) {
        const trimmed = newOutput.slice(-100);
        outputRef.current = trimmed;
        return trimmed;
      }
      return newOutput;
    });
    
    // Echo effect at high corruption
    if (corruptionEngine.shouldEchoCommand()) {
      setTimeout(() => {
        setOutput(prev => [...prev.slice(-9), displayMessage + ' [ECHO]']);
      }, 500);
    }
  }, [state.corruption]);
  
  // Track when output changes to handle auto-scrolling
  const [lastCommandIndex, setLastCommandIndex] = useState(0);
  
  // Removed auto-scroll for now - always show latest

  const handleCommand = useCallback((input: string) => {
    // Remember where this command starts in the output
    const commandStartIndex = output.length;
    
    // Apply command interception at high corruption
    const processedInput = state.corruption > 30 ? 
      corruptionEngine.interceptCommand(input) : input;
    
    if (processedInput !== input) {
      addOutput(`> ${input} [CORRUPTED → ${processedInput}]`);
    } else {
      addOutput(`> ${input}`);
    }

    const command = commandParser.parse(processedInput);

    // Check for puzzle commands first
    if (input.startsWith('solve ')) {
      const puzzleInput = input.substring(6);
      if (!activePuzzle) {
        const roomPuzzles = puzzleManager.getUnsolvedRoomPuzzles(state.currentRoom);
        if (roomPuzzles.length > 0) {
          const puzzle = roomPuzzles[0];
          setActivePuzzle(puzzle.id);
          addOutput(`Attempting puzzle: ${puzzle.name}`);
          addOutput(puzzle.description);
          
          const result = puzzleManager.attemptPuzzle(puzzle.id, puzzleInput);
          if (result.success) {
            addOutput(`SUCCESS: ${result.message}`);
            if (result.corruption) {
              gameState.increaseCorruption(result.corruption);
            }
            if (result.reward) {
              addOutput(`Reward: ${result.reward}`);
              gameState.addItem(result.reward as any);
            }
            setActivePuzzle(null);
          } else {
            addOutput(`FAILED: ${result.message}`);
            if (result.corruption) {
              gameState.increaseCorruption(result.corruption);
            }
          }
        } else {
          addOutput('No puzzles in this room.');
        }
      }
      return;
    }

    if (input === 'puzzles') {
      const roomPuzzles = puzzleManager.getRoomPuzzles(state.currentRoom);
      if (roomPuzzles.length === 0) {
        addOutput('No puzzles in this room.');
      } else {
        addOutput('PUZZLES IN THIS ROOM:');
        roomPuzzles.forEach(puzzle => {
          const puzzleState = puzzleManager.getPuzzleState(puzzle.id);
          const status = puzzleState?.solved ? '[SOLVED]' : '[UNSOLVED]';
          addOutput(`  ${puzzle.name} ${status}`);
        });
      }
      return;
    }

    if (input.startsWith('hint')) {
      const roomPuzzles = puzzleManager.getUnsolvedRoomPuzzles(state.currentRoom);
      if (roomPuzzles.length > 0) {
        const puzzle = roomPuzzles[0];
        const hints = puzzleManager.getHints(puzzle.id);
        if (hints.length > 0) {
          addOutput(`HINT: ${hints[0]}`);
          gameState.increaseCorruption(3); // Hints cost corruption
        } else {
          addOutput('No hints available yet. Keep trying!');
        }
      } else {
        addOutput('No active puzzles.');
      }
      return;
    }

    if (input.startsWith('combine ')) {
      const parts = input.substring(8).split(' with ');
      if (parts.length === 2 && gameState.hasItem(parts[0] as any) && gameState.hasItem(parts[1] as any)) {
        const combo = commandCombinationEngine.tryCombination(parts[0] as any, parts[1] as any);
        if (combo) {
          addOutput(`COMBINATION DISCOVERED: ${combo.name}`);
          addOutput(combo.description);
          const result = commandCombinationEngine.executeCombo(combo);
          addOutput(result);
          
          // Special effects for combinations
          if (combo.id === 'god-mode') {
            gameState.decreaseCorruption(30);
          } else if (combo.id === 'memory-leak') {
            gameState['maxInventory'] = 8; // Expand inventory
            addOutput('Inventory capacity increased!');
          }
        } else {
          addOutput('These items cannot be combined.');
        }
      } else {
        addOutput('Usage: combine <item1> with <item2>');
      }
      return;
    }

    switch (command.type) {
      case 'move':
        if (!command.direction) {
          addOutput('ERROR: Move where? Specify a direction.');
          break;
        }
        if (roomFactory.canMove(currentRoom, command.direction)) {
          const destination = roomFactory.getDestination(currentRoom, command.direction);
          if (destination) {
            gameState.moveToRoom(destination);
            addOutput(`You move ${command.direction}...`);
            
            // Random corruption on movement
            if (Math.random() < 0.2) {
              gameState.increaseCorruption(5);
              addOutput('WARNING: Memory corruption detected!');
            }

            // Check for puzzles in new room
            const newRoomPuzzles = puzzleManager.getUnsolvedRoomPuzzles(destination);
            if (newRoomPuzzles.length > 0) {
              addOutput(`[!] This room contains ${newRoomPuzzles.length} unsolved puzzle(s)`);
            }
          }
        } else {
          addOutput(`ERROR: Cannot move ${command.direction}. Path blocked.`);
        }
        break;

      case 'take':
        if (!command.target) {
          addOutput('ERROR: Take what?');
          break;
        }
        const itemIndex = currentRoom.items.findIndex(
          item => item === command.target || item === command.item
        );
        if (itemIndex !== -1) {
          const item = currentRoom.items[itemIndex];
          if (gameState.addItem(item)) {
            currentRoom.items.splice(itemIndex, 1);
            addOutput(`Acquired command: ${item}`);
            
            // Check for combination hints
            const hint = commandCombinationEngine.getHintForItems(state.inventory);
            if (hint) {
              addOutput(`[?] ${hint}`);
            }
          } else {
            addOutput('ERROR: Inventory full. Drop something first.');
          }
        } else {
          addOutput(`ERROR: No such item: ${command.target}`);
        }
        break;

      case 'drop':
        if (!command.target) {
          addOutput('ERROR: Drop what?');
          break;
        }
        if (command.item && gameState.hasItem(command.item)) {
          if (gameState.removeItem(command.item)) {
            currentRoom.items.push(command.item);
            addOutput(`Dropped: ${command.item}`);
          }
        } else {
          addOutput(`ERROR: You don't have: ${command.target}`);
        }
        break;

      case 'use':
        if (!command.target) {
          addOutput('ERROR: Use what?');
          break;
        }
        if (command.item && gameState.hasItem(command.item)) {
          // Special effects for different items
          switch (command.item) {
            case 'ls':
              addOutput('Listing directory contents...');
              addOutput('drwxr-xr-x  corrupted.txt');
              addOutput('drwxr-xr-x  escape.sh [locked]');
              addOutput('drwxr-xr-x  memories/');
              if (state.currentRoom === 'file-maze') {
                addOutput('drwxr-xr-x  .hidden_path/');
                gameState.setFlag('found_hidden', true);
              }
              break;
            case 'sudo':
              if (state.currentRoom === 'root-vault') {
                addOutput('SUDO: Authentication successful!');
                addOutput('ROOT ACCESS GRANTED!');
                gameState.setFlag('has_root', true);
                gameState.decreaseCorruption(50);
              } else {
                addOutput('SUDO: This incident will be reported.');
                gameState.increaseCorruption(10);
              }
              break;
            case 'kill':
              addOutput('Killing zombie processes...');
              gameState.decreaseCorruption(15);
              break;
            case 'grep':
              addOutput('Searching for escape patterns...');
              addOutput('Found: /dev/escape -> /freedom');
              gameState.setFlag('found_escape', true);
              break;
            case 'chmod':
              addOutput('Changing permissions...');
              if (activePuzzle) {
                addOutput('Permissions modified for puzzle environment.');
              }
              break;
            case 'cat':
              addOutput('Reading file contents...');
              addOutput('[CORRUPTED DATA]');
              break;
            case 'echo':
              addOutput('echo: Terminal Paradox v0.0.1');
              break;
            default:
              addOutput(`Executed: ${command.item}`);
          }
        } else {
          addOutput(`ERROR: Command not found: ${command.target}`);
        }
        break;

      case 'look':
        addOutput('');
        addOutput(currentRoom.description);
        if (currentRoom.items.length > 0) {
          addOutput(`Items here: ${currentRoom.items.join(', ')}`);
        }
        addOutput(`Exits: ${Object.keys(currentRoom.exits).join(', ') || 'none'}`);
        
        const roomPuzzles = puzzleManager.getRoomPuzzles(state.currentRoom);
        if (roomPuzzles.length > 0) {
          addOutput(`Puzzles: ${roomPuzzles.map(p => p.name).join(', ')}`);
        }
        break;

      case 'inventory':
        addOutput('');
        addOutput('COMMAND INVENTORY:');
        if (state.inventory.length === 0) {
          addOutput('  [empty]');
        } else {
          state.inventory.forEach((item, i) => {
            addOutput(`  ${i + 1}. ${item}`);
          });
        }
        addOutput(`Memory: ${state.inventory.length}/${state.maxInventory}`);
        
        // Show discovered combinations
        const discovered = commandCombinationEngine.getDiscoveredCombos();
        if (discovered.length > 0) {
          addOutput('Known Combinations:');
          discovered.forEach(combo => {
            addOutput(`  ${combo.inputs.join(' + ')} = ${combo.name}`);
          });
        }
        break;

      case 'help':
        const helpLines = commandParser.getHelp().split('\n').filter(line => line.trim());
        helpLines.forEach(line => addOutput(line));
        addOutput('');
        addOutput('PHASE 2 COMMANDS:');
        addOutput('  puzzles         - List room puzzles');
        addOutput('  solve <answer>  - Solve active puzzle');
        addOutput('  hint            - Get puzzle hint (costs corruption)');
        addOutput('  combine X with Y - Combine items');
        addOutput('  clear/cls       - Clear output history');
        addOutput('');
        addOutput('SHORTCUTS:');
        addOutput('  Ctrl+U/D        - Scroll output up/down');
        addOutput('  Cmd+K or Cmd+L  - Clear output');
        addOutput('');
        addOutput(`Corruption Level: ${state.corruption}%`);
        addOutput(`Puzzle Progress: ${puzzleManager.getProgress().percentage}%`);
        break;

      case 'clear':
      case 'cls':
        // Clear command output
        setOutput([]);
        setScrollOffset(0);
        outputRef.current = [];
        addOutput('--- Output cleared ---');
        break;
        
      case 'save':
        addOutput('Game saved.');
        break;

      case 'reset':
        gameState.reset();
        puzzleManager.resetAllPuzzles();
        corruptionEngine.setLevel(0);
        setOutput(['Game reset.']);
        break;

      default:
        // Check if it's a command item being used directly
        const possibleItem = input.trim().toLowerCase();
        if (gameState.hasItem(possibleItem as any)) {
          // Treat it as "use <item>"
          handleCommand(`use ${possibleItem}`);
          return;
        }
        
        const errorMessages = [
          'ERROR: Command not recognized.',
          'SEGMENTATION FAULT',
          'ERROR: Corrupted command.',
          '????: ???????? ??? ?????'
        ];
        const msg = state.corruption > 50 ? 
          errorMessages[Math.floor(Math.random() * errorMessages.length)] :
          'ERROR: Unknown command. Type "help" for commands.';
        addOutput(msg);
    }

    // Check win condition
    if (gameState.getFlag('has_root') && gameState.getFlag('found_escape')) {
      addOutput('');
      addOutput('=================================');
      addOutput('CONGRATULATIONS!');
      addOutput('You have escaped the Terminal Paradox!');
      addOutput(`Time: ${gameState.getFormattedTime()}`);
      addOutput(`Moves: ${state.moves}`);
      addOutput(`Puzzles Solved: ${puzzleManager.getProgress().solved}/${puzzleManager.getProgress().total}`);
      addOutput('=================================');
    }
    
    // Auto-scroll to show the command and its output
    // Use setTimeout to ensure output has been updated
    setTimeout(() => {
      // Scroll to the command line position
      setScrollOffset(commandStartIndex);
    }, 0);
  }, [currentRoom, state, activePuzzle, output.length]);

  // Enable scrolling with Ctrl+U/D
  useKeyboard((event: { name?: string; ctrl?: boolean; shift?: boolean; sequence?: string }) => {
    // Scrolling with Ctrl+U/D
    if (!event.ctrl || event.shift) return;
    
    if (event.name === 'u') {
      // Scroll up
      setScrollOffset(prev => Math.max(0, prev - 5));
    } else if (event.name === 'd') {
      // Scroll down
      const maxScroll = Math.max(0, output.length - maxOutputLines);
      setScrollOffset(prev => Math.min(maxScroll, prev + 5));
    }
  });

  // Calculate how many lines we can actually display in output
  const maxOutputLines = Math.max(1, OUTPUT_DISPLAY_HEIGHT - 2); // -2 for border
  
  // Handle scrolling - show different portion of output based on scroll offset
  const visibleOutput = (() => {
    if (output.length === 0) return [];
    const start = Math.max(0, Math.min(scrollOffset, output.length - maxOutputLines));
    const end = Math.min(output.length, start + maxOutputLines);
    return output.slice(start, end);
  })();
  
  const canScrollUp = scrollOffset > 0;
  const canScrollDown = scrollOffset < output.length - maxOutputLines;

  
  return (
    <box display="flex" flexDirection="column" width={terminalCols} height={terminalRows}>
      {/* Game Title */}
      <box height={TITLE_HEIGHT} width={terminalCols}>
        <text bold fg="green">
          TERMINAL PARADOX - {gameState.getFormattedTime()}
        </text>
      </box>

      {/* Main Game Area - Fixed height container */}
      <box 
        display="flex" 
        flexDirection="row" 
        height={GAME_AREA_HEIGHT} 
        width={terminalCols}
      >
        {/* Left Panel - Room Display */}
        <box width={Math.floor(terminalCols * 0.6)} height={GAME_AREA_HEIGHT}>
          <GameDisplay room={currentRoom} gameState={state} />
        </box>

        {/* Right Panel - Inventory */}
        <box width={Math.floor(terminalCols * 0.4)} height={GAME_AREA_HEIGHT}>
          <InventoryDisplay 
            inventory={state.inventory} 
            maxInventory={state.maxInventory} 
          />
        </box>
      </box>

      {/* Output History - Fixed height container - SEPARATE FROM GAME AREA */}
      <box 
        border="single" 
        height={OUTPUT_DISPLAY_HEIGHT}
        width={terminalCols}
        style={{ 
          borderColor: state.corruption > 50 ? 'red' : 'gray',
          marginTop: 0
        }}
      >
        <box padding={1} height={OUTPUT_DISPLAY_HEIGHT - 2}>
          {/* Scroll indicators inline with content */}
          {canScrollUp && (
            <text fg="yellow" bold>↑ More above (Ctrl+U)</text>
          )}
          
          {/* Show output or placeholder */}
          {visibleOutput.length === 0 ? (
            <text fg="gray">Type 'help' to see available commands</text>
          ) : (
            visibleOutput.map((line, i) => {
              // Account for space taken by scroll indicators
              const skipLines = (canScrollUp ? 1 : 0) + (canScrollDown ? 1 : 0);
              if (i >= maxOutputLines - skipLines) return null;
              
              return (
                <text key={i} fg={
                  line.startsWith('ERROR') || line.startsWith('FAILED') ? 'red' : 
                  line.startsWith('SUCCESS') ? 'green' :
                  line.startsWith('WARNING') ? 'yellow' :
                  line.startsWith('>') ? 'cyan' : 'white'
                }>
                  {line.substring(0, terminalCols - 4)}
                </text>
              );
            })
          )}
          
          {/* Bottom indicator */}
          {canScrollDown && (
            <text fg="yellow" bold>↓ More below (Ctrl+D)</text>
          )}
        </box>
      </box>

      {/* Command Input - Fixed at bottom */}
      <box height={COMMAND_HEIGHT} width={terminalCols}>
        <CommandInputFixed 
          onCommand={handleCommand} 
          isCorrupted={state.corruption > 25} 
        />
      </box>
    </box>
  );
};

export const startGame = () => {
  render(<Game />);
};

export default Game;