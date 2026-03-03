

# Project OMEGA — Cyberpunk Escape Room Frontend

## Design & Aesthetic
- **Theme**: Dark cyberpunk hacker terminal — pitch-black backgrounds, neon cyan/green/red accents, CRT monitor glow effects, glitch animations
- **Typography**: Monospace fonts throughout, typewriter text reveal effects
- **Color palette**: Neon cyan (`#00FFFF`), matrix green (`#00FF41`), warning red (`#FF0040`), amber/yellow for hints

## Global Systems

### HUD Overlay (persistent across all levels)
- **Top bar**: Countdown timer (03:00:00), current level indicator, live leaderboard ticker (top 5 teams + user rank)
- **Hint button**: Pulsing yellow/orange "Request System Override Hint" with confirmation modal warning of -5 minute penalty
- **CRT scanline overlay** across entire viewport for atmosphere

### Animation Infrastructure (Framer Motion)
- Page transitions with digital wipe / cross-fade + scale
- Typewriter effect component for narrative text
- Input glow on focus, shake + red flash on wrong answer, green ripple on correct
- Anti-cheat: full-screen red warning modal on tab switch or right-click

## Views

### 1. Login Screen
- Centered glowing terminal window on black background
- Team Name + Password inputs
- Scale-up bounce animation on load

### 2. Level 1: The Boot Sequence
- Green-on-black terminal aesthetic
- Scrambled 12-bit binary string display
- Interactive logic gate visualizer (SVG nodes with toggleable A/B/C inputs)
- Glowing 4-bit output input field

### 3. Level 2: The Scripting Subnet
- Mock IDE interface with file tabs, line numbers
- Syntax-highlighted corrupted Python script
- Terminal output window for typing debugged answer
- Hidden route (`/level3-admin`) discoverable via Base64 decoding

### 4. Level 3: The Data Maze
- Data visualization dashboard layout
- Memory Stack visualizer with animated PUSH/POP operations
- Scrollable 500-row data table with hover highlights, searching for anomalous confidence score > 1.0

### 5. Level 4: The Core Meltdown
- Red-tinted emergency screen with alarm effects
- Glitched AI face (CSS filters + Framer Motion stutter)
- Vigenère cipher matrix grid
- "KILL SWITCH" 10-letter input field
- Victory sequence: white flash → fade to black → "SYSTEM RESTORED: OMEGA TERMINATED"

## Technical Notes
- All interactive elements accept props for future backend wiring (timer, score, inputs)
- State managed via React context for timer/score/level progression
- Framer Motion for all animations and page transitions
- React Router for level navigation + hidden routes
- Fully frontend — mock data with placeholder callbacks

