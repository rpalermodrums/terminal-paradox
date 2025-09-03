import React, { useState, useEffect } from 'react';
import { useKeyboard } from '@opentui/react';

interface CommandInputFixedProps {
  onCommand: (command: string) => void;
  isCorrupted?: boolean;
}

export const CommandInputFixed: React.FC<CommandInputFixedProps> = ({ 
  onCommand, 
  isCorrupted = false 
}) => {
  const [inputLine, setInputLine] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Apply corruption to prompt
  const getPrompt = () => {
    const basePrompt = '$ ';
    if (!isCorrupted) return basePrompt;
    
    const corruptedPrompts = ['# ', '> ', ':: ', '!> ', '??? ', '▓▓ '];
    return Math.random() < 0.3 ? 
      corruptedPrompts[Math.floor(Math.random() * corruptedPrompts.length)] : 
      basePrompt;
  };

  // Keyboard handling - same as GameSimple
  useKeyboard((event: any) => {
    const str = event?.sequence || event?.str || '';
    const name = event?.name || '';
    const ctrl = event?.ctrl || false;
    
    if (name === 'return' || name === 'enter') {
      if (inputLine.trim()) {
        // Add to history
        setHistory(prev => [...prev, inputLine]);
        setHistoryIndex(-1);
        
        // Send command
        onCommand(inputLine);
        
        // Clear input
        setInputLine('');
      }
    } else if (name === 'backspace' || name === 'delete') {
      setInputLine(prev => prev.slice(0, -1));
    } else if (name === 'up' && history.length > 0) {
      // Navigate history up
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInputLine(history[history.length - 1 - newIndex]);
    } else if (name === 'down' && historyIndex > 0) {
      // Navigate history down
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setInputLine('');
      } else {
        setInputLine(history[history.length - 1 - newIndex]);
      }
    } else if ((ctrl && name === 'c') || name === 'escape') {
      process.exit(0);
    } else if (str && str.length === 1 && !ctrl) {
      // Regular character input
      setInputLine(prev => prev + str);
    }
  });

  return (
    <box
      border="single"
      padding={1}
      style={{
        borderColor: isCorrupted ? 'red' : 'green',
        minHeight: 3
      }}
    >
      <text fg={isCorrupted ? 'red' : 'green'}>
        {getPrompt()}{inputLine}_
      </text>
    </box>
  );
};