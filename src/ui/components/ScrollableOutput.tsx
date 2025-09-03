import React, { useState, useEffect, useRef } from 'react';
import { useKeyboard } from '@opentui/react';

interface ScrollableOutputProps {
  lines: string[];
  maxDisplayLines: number;
  borderColor?: string;
  autoScroll?: boolean;
}

export const ScrollableOutput: React.FC<ScrollableOutputProps> = ({ 
  lines, 
  maxDisplayLines,
  borderColor = 'gray',
  autoScroll = true
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const prevLinesLength = useRef(lines.length);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (autoScroll && lines.length > prevLinesLength.current) {
      const maxOffset = Math.max(0, lines.length - maxDisplayLines);
      setScrollOffset(maxOffset);
    }
    prevLinesLength.current = lines.length;
  }, [lines, maxDisplayLines, autoScroll]);

  // Handle scrolling with Page Up/Page Down
  useKeyboard((event: { name?: string }) => {
    const name = event?.name || '';
    
    if (name === 'pageup') {
      setScrollOffset(prev => Math.max(0, prev - 5));
    } else if (name === 'pagedown') {
      const maxOffset = Math.max(0, lines.length - maxDisplayLines);
      setScrollOffset(prev => Math.min(maxOffset, prev + 5));
    }
  });

  // Calculate which lines to display
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxDisplayLines);
  const hasMoreAbove = scrollOffset > 0;
  const hasMoreBelow = scrollOffset + maxDisplayLines < lines.length;

  return (
    <box
      border="single"
      padding={1}
      style={{
        borderColor,
        position: 'relative'
      }}
    >
      {/* Scroll indicator - top */}
      {hasMoreAbove && (
        <box position="absolute" top={0} right={2}>
          <text fg="yellow" bold>↑ More</text>
        </box>
      )}

      {/* Output lines */}
      <box display="flex" flexDirection="column">
        {visibleLines.map((line, i) => (
          <text 
            key={scrollOffset + i} 
            fg={
              line.startsWith('ERROR') || line.startsWith('FAILED') ? 'red' : 
              line.startsWith('SUCCESS') ? 'green' :
              line.startsWith('WARNING') ? 'yellow' :
              line.startsWith('>') ? 'cyan' : 'white'
            }
          >
            {line}
          </text>
        ))}
      </box>

      {/* Scroll indicator - bottom */}
      {hasMoreBelow && (
        <box position="absolute" bottom={0} right={2}>
          <text fg="yellow" bold>↓ More (PgDn)</text>
        </box>
      )}
    </box>
  );
};