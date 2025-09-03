#!/usr/bin/env bun
import React, { useState } from 'react';
import { render, useTerminalDimensions, useKeyboard } from '@opentui/react';

const TestLayout: React.FC = () => {
  const { rows, cols } = useTerminalDimensions();
  const [testOutput, setTestOutput] = useState<string[]>([]);
  
  // ADAPTIVE LAYOUT CALCULATION
  // Use percentages of available height
  const TITLE_HEIGHT = 1;
  const COMMAND_HEIGHT = 3;
  const RESERVED = TITLE_HEIGHT + COMMAND_HEIGHT + 4; // +4 for borders/margins
  
  const availableHeight = Math.max(20, rows - RESERVED);
  const gameAreaHeight = Math.floor(availableHeight * 0.5); // 50% for game
  const outputHeight = Math.floor(availableHeight * 0.5);   // 50% for output
  
  // Ensure minimum sizes
  const finalGameHeight = Math.max(10, gameAreaHeight);
  const finalOutputHeight = Math.max(8, outputHeight);
  
  useKeyboard((event: { name?: string; str?: string }) => {
    if (event.str === '1') {
      setTestOutput(prev => [...prev, `Test line ${prev.length + 1}`]);
    } else if (event.str === '2') {
      // Add many lines to test overflow
      const lines = Array.from({length: 30}, (_, i) => `Overflow test line ${i + 1}`);
      setTestOutput(lines);
    } else if (event.str === '3') {
      setTestOutput([]);
    }
  });
  
  // Only show what fits in output window
  const visibleOutput = testOutput.slice(-(finalOutputHeight - 2));
  
  return (
    <box display="flex" flexDirection="column" width={cols} height={rows}>
      {/* Title */}
      <box height={TITLE_HEIGHT} width={cols}>
        <text bold fg="green">
          TEST LAYOUT | Height: {rows} | Game: {finalGameHeight} | Output: {finalOutputHeight}
        </text>
      </box>
      
      {/* Game Area Container */}
      <box 
        display="flex" 
        flexDirection="row" 
        height={finalGameHeight}
        width={cols}
        style={{ position: 'relative' }}
      >
        {/* Room Display */}
        <box 
          width={Math.floor(cols * 0.6)}
          height={finalGameHeight}
          border="single"
          style={{ 
            borderColor: 'cyan',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <box padding={1} height={finalGameHeight - 2}>
            <text fg="cyan">ROOM AREA</text>
            <text>Height: {finalGameHeight}</text>
            <text>This content should stay in this box</text>
            <text>Line 4</text>
            <text>Line 5</text>
            <text>Line 6</text>
            <text>Line 7</text>
            <text>Line 8</text>
            <text>Line 9</text>
            <text>Line 10</text>
            <text>Extra lines should be hidden...</text>
            <text>Line 12</text>
            <text>Line 13</text>
          </box>
        </box>
        
        {/* Inventory */}
        <box 
          width={Math.floor(cols * 0.4)}
          height={finalGameHeight}
          border="single"
          style={{ 
            borderColor: 'yellow',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <box padding={1} height={finalGameHeight - 2}>
            <text fg="yellow">INVENTORY AREA</text>
            <text>Height: {finalGameHeight}</text>
            <text>Isolated from room</text>
          </box>
        </box>
      </box>
      
      {/* Output Container - STRICTLY BOUNDED */}
      <box
        height={finalOutputHeight}
        width={cols}
        border="single"
        style={{
          borderColor: 'magenta',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <box padding={1} height={finalOutputHeight - 2} style={{ overflow: 'hidden' }}>
          <text fg="magenta">OUTPUT AREA (Press 1 to add, 2 to overflow, 3 to clear)</text>
          {visibleOutput.map((line, i) => (
            <text key={i} fg="white">{line}</text>
          ))}
        </box>
      </box>
      
      {/* Command Input */}
      <box
        height={COMMAND_HEIGHT}
        width={cols}
        border="single"
        style={{ borderColor: 'green' }}
      >
        <box padding={1}>
          <text fg="green">COMMAND INPUT $ _</text>
        </box>
      </box>
    </box>
  );
};

console.clear();
render(<TestLayout />);