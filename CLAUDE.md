# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terminal Paradox is a CLI escape game built with OpenTUI React where players are trapped inside a malfunctioning terminal system. The game uses TypeScript, React, and Bun as the runtime.

## Commands

### Development
- `bun run dev` - Start Vite development server for web version
- `bun run game` or `bun start` - Run the CLI game
- `bun run build` - Build the web version (runs TypeScript check then Vite build)

### Testing
- `bun test` - Run tests using Bun's test runner
- `bun run test:vitest` - Run tests using Vitest
- `bun run test:ui` - Run tests with Vitest UI
- `bun run test:coverage` - Run tests with coverage report

### Code Quality
- `bun run lint` - Run ESLint
- `npx tsc --noEmit` - Type check without emitting files

## Architecture

### Core State Management
The game uses a subscription-based state management pattern centered around `GameStateManager` (src/game/state/gameState.ts). State includes:
- Current room location
- Inventory system with command items
- Corruption level affecting game behavior
- Flags for tracking puzzle completion
- Save/load functionality via localStorage

### Game Flow
1. **Rooms** (src/game/rooms/) - Each room has unique puzzles, items, and exit conditions
2. **Commands** (src/game/commands/) - Terminal commands are collectible items that can be combined
3. **Puzzles** (src/game/puzzles/) - Various puzzle types including regex patterns, binary permissions, and process trees
4. **Corruption Engine** (src/game/corruption/) - Affects visual display and game difficulty

### UI Components
- Main game component: `src/Game.tsx` - Orchestrates game state and rendering
- OpenTUI React components in `src/ui/components/` for terminal-style display
- Command input handling with history and autocomplete

### Testing Approach
- Test files alongside source files (*.test.ts)
- Uses Bun test runner for unit tests
- Comprehensive test coverage for state management, puzzles, and corruption engine

## Development Guidelines

### Code Style
- Use `const` by default, avoid `let` unless mutation is necessary
- TypeScript strict mode is enabled
- Follow existing patterns for state updates through GameStateManager
- Commands and puzzles follow defined interfaces in their respective `types.ts` files

### Adding New Features
- New puzzles: Implement the `Puzzle` interface in src/game/puzzles/
- New commands: Add to the command registry in src/game/commands/
- New rooms: Follow the room factory pattern in src/game/rooms/

### State Management
- All state changes go through GameStateManager methods
- State is immutable - methods return new state objects
- Use subscription pattern for React component updates