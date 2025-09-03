#!/usr/bin/env bun
import React, { useState, useCallback } from 'react';
import { render, useTerminalDimensions } from '@opentui/react';

const OutputTest: React.FC = () => {
  const { rows, cols } = useTerminalDimensions();
  const [output, setOutput] = useState<string[]>([
    'Initial line 1',
    'Initial line 2'
  ]);
  const [commandInput, setCommandInput] = useState('');
  
  // Fixed layout for testing
  const TITLE_HEIGHT = 1;
  const GAME_HEIGHT = 10;
  const OUTPUT_HEIGHT = 10; // Total box height including border
  const COMMAND_HEIGHT = 3;
  
  // Calculate how many lines we can actually show inside output box
  const OUTPUT_CONTENT_HEIGHT = OUTPUT_HEIGHT - 2; // Remove border
  
  const handleCommand = useCallback((cmd: string) => {
    // Add command to output
    const newLines: string[] = [`> ${cmd}`];
    
    if (cmd === 'help') {
      // Simulate help command with many lines
      newLines.push(
        'AVAILABLE COMMANDS:',
        '===================',
        'Movement:',
        '  go <direction> - Move in a direction',
        '  n/s/e/w - Quick movement',
        'Items:',
        '  take <item> - Pick up an item',
        '  drop <item> - Drop an item',
        'Information:',
        '  look - Look around',
        '  examine <target> - Examine something',
        '  inventory - Check inventory',
        '  help - Show this help',
        'Game:',
        '  save - Save progress',
        '  load - Load game',
        '  reset - Reset game'
      );
    } else if (cmd === 'test') {
      newLines.push('Test output line 1', 'Test output line 2', 'Test output line 3');
    } else if (cmd === 'many') {
      // Add 30 lines to test overflow
      for (let i = 1; i <= 30; i++) {
        newLines.push(`Line ${i} of many`);
      }
    }
    
    setOutput(prev => [...prev, ...newLines]);
    setCommandInput('');
  }, []);
  
  // Get only the lines that should be visible
  const visibleOutput = output.slice(-OUTPUT_CONTENT_HEIGHT);
  
  return (
    <box display="flex" flexDirection="column" width={cols} height={rows}>
      {/* Title */}
      <box height={TITLE_HEIGHT}>
        <text bold fg="green">OUTPUT TEST | Terminal: {rows}x{cols}</text>
      </box>
      
      {/* Game Area - Simple placeholder */}
      <box height={GAME_HEIGHT} border="single" style={{ borderColor: 'blue' }}>
        <box padding={1}>
          <text>GAME AREA (Height: {GAME_HEIGHT})</text>
          <text>This should stay here and not move</text>
        </box>
      </box>
      
      {/* Output Area - This is where the problem likely is */}
      <box 
        height={OUTPUT_HEIGHT} 
        border="single" 
        style={{ 
          borderColor: 'yellow',
          position: 'relative'
        }}
      >
        <box 
          padding={1} 
          height={OUTPUT_CONTENT_HEIGHT}
          width={cols - 4}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden'
          }}
        >
          <text fg="yellow">Output ({visibleOutput.length} lines visible):</text>
          {visibleOutput.map((line, i) => (
            <text key={i} fg="white">
              {line.substring(0, cols - 6)}
            </text>
          ))}
        </box>
      </box>
      
      {/* Command Input - Should always stay here */}
      <box height={COMMAND_HEIGHT} border="single" style={{ borderColor: 'green' }}>
        <box padding={1}>
          <text fg="green">
            $ {commandInput}_ (type 'help', 'test', or 'many')
          </text>
        </box>
      </box>
      
      {/* Debug info */}
      <box height={2}>
        <text fg="red">
          Total Height Used: {TITLE_HEIGHT + GAME_HEIGHT + OUTPUT_HEIGHT + COMMAND_HEIGHT + 2} / {rows}
        </text>
        <text fg="red">
          Output lines: {output.length} total, showing last {OUTPUT_CONTENT_HEIGHT}
        </text>
      </box>
    </box>
  );
};

// Simple command input handler
const App = () => {
  const [instance, setInstance] = useState(0);
  
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Force re-render with command
        setInstance(prev => prev + 1);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, []);
  
  return <OutputTest key={instance} />;
};

console.clear();
render(<OutputTest />);