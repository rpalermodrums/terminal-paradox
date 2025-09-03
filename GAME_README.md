# Terminal Paradox 🖥️

An inventive CLI escape game built with OpenTUI React where you're trapped inside a malfunctioning terminal system and must escape by manipulating the UI itself.

## 🎮 How to Play

```bash
# Install dependencies
npm install

# Start the game
npm start

# Or run directly
npm run game
```

## 📖 Story

You wake up trapped inside a corrupted terminal system. The boot sequence has failed, memory is leaking, and zombie processes roam the system. Your only hope is to gain root access and find the escape route before the system completely corrupts.

## 🎯 Game Features

### Unique Mechanics
- **Terminal Corruption**: Visual glitches that are actually puzzles
- **Command Inventory**: Collect and combine terminal commands as items
- **Memory Management**: Limited inventory space forces strategic decisions
- **Meta Puzzles**: The game knows it's in a terminal and breaks the fourth wall

### Rooms to Explore
1. **Boot Sequence** - Starting point, corrupted initialization
2. **File System Maze** - Navigate through directories and symlinks
3. **Process Prison** - Battle zombie processes and fork bombs
4. **Memory Leak Chamber** - Fix memory leaks and pointer arithmetic
5. **Root Access Vault** - Final challenge to gain root and escape

## 🎮 Commands

### Movement
- `go/move <direction>` - Move in a direction
- `n/s/e/w/up/down` - Quick movement shortcuts

### Items
- `take/get <item>` - Pick up a command
- `drop <item>` - Drop from inventory
- `use <item>` - Execute a command
- `combine <X> with <Y>` - Combine commands

### Information
- `look/l` - Examine current room
- `examine <target>` - Inspect something closely
- `inventory/i` - Check your command inventory
- `help/?` - Show available commands

### Game Control
- `save` - Save your progress
- `load` - Load saved game
- `reset` - Start over

## 🧩 Puzzle Types

- **Regex Patterns**: Match patterns to unlock doors
- **Command Chains**: Pipe commands together
- **Permission Puzzles**: Use chmod to access files
- **Process Management**: Kill the right processes
- **Memory Management**: Balance inventory weight

## 💡 Tips

1. **Explore Everything**: Type `look` in each room and `examine` interesting objects
2. **Collect Commands**: Commands are your tools - collect them strategically
3. **Watch Corruption**: High corruption makes the game harder but might reveal secrets
4. **Combine Creatively**: Some puzzles require combining multiple commands
5. **Save Often**: The game can get challenging - save your progress

## 🏆 Win Conditions

To escape the Terminal Paradox, you must:
1. Gain root access using `sudo` in the Root Vault
2. Find the escape route using `grep` to search for patterns
3. Have both flags set to trigger the escape sequence

## 🐛 Features (Not Bugs!)

- Commands may become corrupted at high corruption levels
- Error messages might contain hidden clues
- The terminal prompt changes based on system state
- Some "glitches" are intentional puzzle elements

## 🔧 Development

```bash
# Run tests
npm test

# Run tests with UI
npm test:ui

# Check types
npx tsc --noEmit

# Lint code
npm run lint
```

## 🏗️ Architecture

The game uses:
- **OpenTUI React** for terminal UI components
- **TypeScript** for type safety
- **Vitest** for testing
- **State Management** with subscription pattern
- **TDD** approach with comprehensive test coverage

## 🎨 ASCII Art

Each room features unique ASCII art that provides both atmosphere and puzzle hints. Pay attention to the visual elements - they're not just decoration!

## 📝 Credits

Built with OpenTUI by SST as an inventive take on escape room games in the terminal.

---

*Remember: In the Terminal Paradox, nothing is quite what it seems. Error messages might be clues, and glitches might be features. Trust nothing, question everything, and may the terminal be with you.*