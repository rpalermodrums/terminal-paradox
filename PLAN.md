# Terminal Paradox - Development Plan

## Overview
An inventive CLI escape game built with OpenTUI React that breaks the fourth wall - you're trapped inside a malfunctioning terminal and must escape by manipulating the UI itself.

## Current Progress
✅ Project initialized with Vite + React + TypeScript
✅ OpenTUI React installed
✅ Directory structure created
✅ Core game state management implemented (with full test coverage)
✅ Room navigation system built (5 interconnected rooms with ASCII art)
✅ Main game UI components (GameDisplay, InventoryDisplay, CommandInput)
✅ Command parser with extensive aliases
✅ Inventory system with memory management
✅ Basic puzzle mechanics and win conditions
✅ Corruption effects on UI
✅ Game entry point and run scripts
✅ Comprehensive test suite (37 passing tests)
✅ Game documentation

## Architecture Decisions

### State Management
- Using class-based GameStateManager for centralized state
- Subscription pattern for reactive updates
- Auto-save to localStorage
- Immutable state updates

### Type System
- Strict TypeScript with robust types
- Union types for finite states (RoomId, CommandItem, Direction)
- Interface segregation for Game, Room, Puzzle entities
- Type guards for runtime safety

### Testing Strategy (TDD)
- Unit tests for game logic (state, puzzles, inventory)
- Integration tests for room navigation
- Component tests for UI elements
- E2E tests for complete game flows

## Key Features to Implement

### 1. Room System
- [ ] Room factory with type-safe room definitions
- [ ] Navigation logic with direction validation
- [ ] Room-specific rendering components
- [ ] Transition animations

### 2. Puzzle Engine
- [ ] Abstract puzzle base class
- [ ] Regex puzzles
- [ ] Command combination puzzles
- [ ] Terminal manipulation puzzles
- [ ] Puzzle state persistence

### 3. Inventory System
- [ ] Command items with effects
- [ ] Combination logic
- [ ] Memory limits (weight system)
- [ ] Item usage validation

### 4. Visual Effects
- [ ] Corruption renderer
- [ ] Glitch animations
- [ ] ASCII art system
- [ ] Terminal color theming

### 5. Game Mechanics
- [ ] Command interception
- [ ] UI manipulation (drag/resize)
- [ ] Meta puzzles (file system access)
- [ ] Multiple endings

## Technical Considerations

### OpenTUI Integration
- Using @opentui/react for terminal UI
- Custom components extending OpenTUI primitives
- Terminal-specific event handling
- Performance optimization for animations

### Performance
- Lazy loading for rooms
- Memoization for expensive renders
- Debounced corruption effects
- Efficient state updates

### Accessibility
- Keyboard-only navigation
- Screen reader support where possible
- Clear visual indicators
- Configurable difficulty

## Testing Checklist
- [ ] GameStateManager unit tests
- [ ] Room navigation tests
- [ ] Inventory management tests
- [ ] Puzzle solution tests
- [ ] Save/load functionality tests
- [ ] Corruption effects tests
- [ ] UI component tests
- [ ] Integration tests

## Important Notes
- Keep game state immutable
- All commands should be type-safe
- Visual effects should be performant
- Puzzles should have multiple solutions where logical
- Game should be completable in 30-45 minutes

## Next Steps
1. Complete room navigation system with tests
2. Build main UI layout with OpenTUI
3. Implement first room (boot-sequence)
4. Add first puzzle mechanic
5. Test save/load functionality