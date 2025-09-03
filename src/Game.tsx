import React, { useState, useEffect, useCallback } from 'react';
import { render, Box, Text } from '@opentui/react';
import { GameDisplay } from './ui/components/GameDisplay';
import { InventoryDisplay } from './ui/components/InventoryDisplay';
import { CommandInput } from './ui/components/CommandInput';
import { gameState } from './game/state/gameState';
import { roomFactory } from './game/rooms/roomFactory';
import { commandParser } from './game/commands/commandParser';
import type { Room, GameState } from './game/state/types';

const Game: React.FC = () => {
  const [state, setState] = useState<GameState>(gameState.getState());
  const [currentRoom, setCurrentRoom] = useState<Room>(
    roomFactory.createRoom(state.currentRoom)
  );
  const [output, setOutput] = useState<string[]>([
    'TERMINAL PARADOX v0.0.1',
    '========================',
    'You are trapped in a corrupted terminal system.',
    'Type "help" for commands.',
    ''
  ]);

  useEffect(() => {
    const unsubscribe = gameState.subscribe((newState) => {
      setState(newState);
      setCurrentRoom(roomFactory.createRoom(newState.currentRoom));
    });
    return unsubscribe;
  }, []);

  const addOutput = useCallback((message: string) => {
    setOutput(prev => {
      const newOutput = [...prev, message];
      // Keep only last 10 messages
      if (newOutput.length > 10) {
        return newOutput.slice(-10);
      }
      return newOutput;
    });
  }, []);

  const handleCommand = useCallback((input: string) => {
    const command = commandParser.parse(input);
    addOutput(`> ${input}`);

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
        break;

      case 'help':
        addOutput(commandParser.getHelp());
        break;

      case 'save':
        addOutput('Game saved.');
        break;

      case 'reset':
        gameState.reset();
        setOutput(['Game reset.']);
        break;

      default:
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
      addOutput('=================================');
    }
  }, [currentRoom, state]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Game Title */}
      <Box marginBottom={1}>
        <Text bold fg="green">
          TERMINAL PARADOX - {gameState.getFormattedTime()}
        </Text>
      </Box>

      {/* Main Game Area */}
      <Box display="flex" flexDirection="row" flex={1}>
        {/* Left Panel - Room Display */}
        <Box flex={2} marginRight={1}>
          <GameDisplay room={currentRoom} gameState={state} />
        </Box>

        {/* Right Panel - Inventory */}
        <Box flex={1}>
          <InventoryDisplay 
            inventory={state.inventory} 
            maxInventory={state.maxInventory} 
          />
        </Box>
      </Box>

      {/* Output History */}
      <Box 
        border="single" 
        padding={1} 
        marginTop={1}
        style={{ 
          borderColor: 'gray',
          minHeight: 8,
          maxHeight: 12 
        }}
      >
        {output.map((line, i) => (
          <Text key={i} fg={line.startsWith('ERROR') ? 'red' : 'white'}>
            {line}
          </Text>
        ))}
      </Box>

      {/* Command Input */}
      <Box marginTop={1}>
        <CommandInput 
          onCommand={handleCommand} 
          isCorrupted={state.corruption > 25} 
        />
      </Box>
    </Box>
  );
};

export const startGame = () => {
  render(<Game />);
};

export default Game;