#!/usr/bin/env bun
import React, { useState } from 'react';
import { render, useTerminalDimensions } from '@opentui/react';

const MinimalTest: React.FC = () => {
  const { rows, cols } = useTerminalDimensions();
  const [counter, setCounter] = useState(0);
  
  // Fixed layout - total should equal terminal height
  const TITLE = 1;
  const GAME = 10;
  const OUTPUT = 8;
  const COMMAND = 3;
  const TOTAL = TITLE + GAME + OUTPUT + COMMAND; // = 22
  
  // Test output
  const testOutput = [
    'Line 1: This is test output',
    'Line 2: Help command would show here',
    'Line 3: Another line',
    'Line 4: More output',
    'Line 5: Last visible line'
  ];
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCounter(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <box width={cols} height={rows}>
      {/* Title - 1 line */}
      <box height={TITLE}>
        <text fg="green">MINIMAL TEST | Terminal: {rows}x{cols} | Total: {TOTAL} | Counter: {counter}</text>
      </box>
      
      {/* Game - 10 lines */}
      <box height={GAME} border="single">
        <text>Game Area (Height: {GAME})</text>
      </box>
      
      {/* Output - 8 lines */}
      <box height={OUTPUT} border="single">
        <box padding={1}>
          {testOutput.map((line, i) => (
            <text key={i}>{line}</text>
          ))}
        </box>
      </box>
      
      {/* Command - 3 lines */}
      <box height={COMMAND} border="single">
        <text>Command Input $ _</text>
      </box>
      
      {/* Debug if we exceed terminal height */}
      {TOTAL > rows && (
        <box>
          <text fg="red">ERROR: Layout ({TOTAL}) exceeds terminal height ({rows})</text>
        </box>
      )}
    </box>
  );
};

console.clear();
render(<MinimalTest />);