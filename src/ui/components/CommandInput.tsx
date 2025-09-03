import React, { useState, useCallback } from 'react';
import { Box, Text, Input } from '@opentui/react';

interface CommandInputProps {
  onCommand: (command: string) => void;
  isCorrupted?: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({ 
  onCommand, 
  isCorrupted = false 
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = useCallback(() => {
    if (input.trim()) {
      // Add to history
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      
      // Process command
      onCommand(input);
      
      // Clear input
      setInput('');
    }
  }, [input, onCommand]);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'ArrowUp') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  }, [history, historyIndex]);

  // Apply corruption to prompt
  const getPrompt = () => {
    const basePrompt = '$ ';
    if (!isCorrupted) return basePrompt;
    
    const corruptedPrompts = ['# ', '> ', ':: ', '!> ', '??? ', '▓▓ '];
    return Math.random() < 0.3 ? 
      corruptedPrompts[Math.floor(Math.random() * corruptedPrompts.length)] : 
      basePrompt;
  };

  return (
    <Box
      border="single"
      padding={1}
      style={{
        borderColor: isCorrupted ? 'red' : 'green',
        minHeight: 3
      }}
    >
      <Box display="flex" flexDirection="row">
        <Text fg={isCorrupted ? 'red' : 'green'} bold>
          {getPrompt()}
        </Text>
        <Input
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
          placeholder="Enter command..."
          style={{
            flex: 1,
            color: isCorrupted && Math.random() < 0.1 ? 'red' : 'white'
          }}
        />
      </Box>
    </Box>
  );
};