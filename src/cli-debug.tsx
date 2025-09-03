#!/usr/bin/env bun
import React from 'react';
import { render, useTerminalDimensions } from '@opentui/react';

const DebugGame: React.FC = () => {
  const { rows, cols } = useTerminalDimensions();
  
  // Super simple fixed layout
  const heights = {
    title: 1,
    game: Math.floor((rows - 4) * 0.5),  // 50% of available
    output: Math.floor((rows - 4) * 0.5), // 50% of available
    command: 3,
    total: 0
  };
  heights.total = heights.title + heights.game + heights.output + heights.command;
  
  return (
    <box display="flex" flexDirection="column" width={cols} height={rows}>
      {/* Title */}
      <box height={heights.title}>
        <text fg="green" bold>
          DEBUG | Terminal: {rows}x{cols} | Total: {heights.total}
        </text>
      </box>
      
      {/* Game */}
      <box height={heights.game} border="single" style={{ borderColor: 'blue' }}>
        <text>Game Area (H: {heights.game})</text>
      </box>
      
      {/* Output */}
      <box height={heights.output} border="single" style={{ borderColor: 'yellow' }}>
        <box padding={1}>
          <text fg="yellow">Output Area (H: {heights.output})</text>
          <text>Line 1: Test output</text>
          <text>Line 2: More output</text>
          <text>Line 3: Even more</text>
        </box>
      </box>
      
      {/* Command */}
      <box height={heights.command} border="single" style={{ borderColor: 'green' }}>
        <box padding={1}>
          <text fg="green">Command $ _ (H: {heights.command})</text>
        </box>
      </box>
    </box>
  );
};

console.clear();
render(<DebugGame />);