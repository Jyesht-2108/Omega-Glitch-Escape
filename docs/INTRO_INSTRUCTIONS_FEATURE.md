# Intro & Instructions Feature

## Overview
Added an animated intro sequence and comprehensive instructions page that players see after logging in and before starting the game.

## Flow

```
Login → Intro (Animated) → Instructions → Level 1 (Timer Starts)
```

## Components

### 1. Intro Page (`/intro`)

**Location**: `frontend/src/pages/Intro.tsx`

**Features**:
- Animated terminal-style text typing effect
- Green hacker-style text on black background
- Story-based narrative from Project OMEGA
- Auto-redirects to instructions after completion
- Blinking cursor effect

**Content**:
```
> INITIALIZING EMERGENCY PROTOCOL...
> CONNECTING TO CSE MAINFRAME...
> CONNECTION ESTABLISHED
> WARNING: UNAUTHORIZED AI ACTIVITY DETECTED
> PROJECT OMEGA HAS GAINED SENTIENCE
> SYSTEM LOCKDOWN IN PROGRESS...
> CRITICAL ALERT:
> ALL ACADEMIC AND FINANCIAL RECORDS AT RISK
> TIME UNTIL COMPLETE SYSTEM WIPE: 3 HOURS
> DEPLOYING RAPID-RESPONSE CYBERSECURITY TEAM...
> MISSION: COLLECT OVERRIDE FRAGMENTS
> OBJECTIVE: DEPLOY MANUAL KILL SWITCH
> LOADING MISSION BRIEFING...
```

**Timing**:
- Each character types at 30ms intervals
- 300ms pause between lines
- 1.5s delay before redirect to instructions

### 2. Instructions Page (`/instructions`)

**Location**: `frontend/src/pages/Instructions.tsx`

**Features**:
- Comprehensive game rules and guidelines
- Mission briefing with story context
- Visual card-based layout
- "Proceed to Mission" button that starts the timer
- Fade-in animation on load

**Sections**:

1. **The Situation**
   - Story context about Project OMEGA
   - 3-hour time limit warning
   - Mission objectives

2. **Game Rules** (4 cards)
   - Challenge Structure: 4 levels, 9 puzzles
   - Time Management: 3-hour limit, penalties
   - Hint System: 3 hints per puzzle, 5-minute cost each
   - Scoring: Points, speed bonuses, penalties

3. **Critical Rules** (Warning box)
   - No tab switching (triggers alarm)
   - No external tools (use F12 only)
   - No console manipulation (anti-cheat active)
   - Teamwork encouraged

4. **Available Tools**
   - Browser Developer Console (F12)
   - Built-in hint system
   - Your brain!

5. **Final Message**
   - Motivational text
   - Timer warning

**Button Action**:
- Calls `startGame()` from GameContext
- Starts the 3-hour timer
- Navigates to Level 1

## Login Flow Updates

**Location**: `frontend/src/pages/Login.tsx`

**Changes**:
- First-time login (level 1) → Redirects to `/intro`
- Returning players (level 2+) → Redirects to current level
- Completed game → Redirects to `/victory`

**Logic**:
```typescript
if (gameCompleted) {
  navigate('/victory');
} else if (currentLevel === 1) {
  navigate('/intro');  // Show intro for first-time/level 1
} else {
  navigate(`/level/${currentLevel}`);  // Resume at current level
}
```

## GameContext Updates

**Location**: `frontend/src/contexts/GameContext.tsx`

**New Function**: `startGame()`
```typescript
const startGame = useCallback(() => {
  // Start the timer when the game officially begins (after instructions)
  setState(prev => ({ ...prev, isTimerRunning: true }));
}, []);
```

**Purpose**:
- Separates login from game start
- Timer only starts when player clicks "Proceed to Mission"
- Gives players time to read instructions without pressure

## Routing Updates

**Location**: `frontend/src/App.tsx`

**New Routes**:
```typescript
<Route path="/intro" element={
  <ProtectedRoute>
    <Intro />
  </ProtectedRoute>
} />
<Route path="/instructions" element={
  <ProtectedRoute>
    <Instructions />
  </ProtectedRoute>
} />
```

**HUD Visibility**:
- HUD hidden on intro and instructions pages
- Anti-cheat and CRT overlay also hidden
- Clean viewing experience for story and rules

## User Experience

### First-Time Players
1. Login with team credentials
2. See animated intro (immersive story)
3. Read comprehensive instructions
4. Click "Proceed to Mission"
5. Timer starts, Level 1 begins

### Returning Players
1. Login with team credentials
2. Skip intro/instructions
3. Resume at current level
4. Timer continues from saved state

## Styling

**Intro Page**:
- Black background (`bg-black`)
- Green terminal text (`text-green-500`)
- Monospace font (`font-mono`)
- Blinking cursor animation
- Fade-in animations

**Instructions Page**:
- Dark gradient background
- Green accent color (theme)
- Card-based layout
- Responsive grid (2 columns on desktop)
- Warning box with red border
- Large "Proceed" button with hover effects

## Technical Details

### Animations

**Intro Typing Effect**:
```typescript
const typeInterval = setInterval(() => {
  if (charIndex <= line.length) {
    setDisplayedText(line.substring(0, charIndex));
    charIndex++;
  } else {
    clearInterval(typeInterval);
    setTimeout(() => {
      setCurrentLine(currentLine + 1);
      setDisplayedText('');
    }, 300);
  }
}, 30);
```

**Cursor Blink**:
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s infinite;
}
```

**Instructions Fade-in**:
```typescript
const [isReady, setIsReady] = useState(false);
useEffect(() => {
  setTimeout(() => setIsReady(true), 300);
}, []);
```

### State Management

**Timer Control**:
- Timer does NOT start on login
- Timer starts only when `startGame()` is called
- Prevents time loss during intro/instructions

**Navigation**:
- Intro auto-navigates to instructions
- Instructions requires manual button click
- Ensures players read the rules

## Testing

### Test Cases

1. **First Login**
   - Login → Should see intro
   - Intro should auto-advance to instructions
   - Instructions should show "Proceed" button
   - Timer should be stopped

2. **Proceed to Game**
   - Click "Proceed to Mission"
   - Should navigate to Level 1
   - Timer should start running
   - HUD should appear

3. **Returning Player**
   - Login at level 2+
   - Should skip intro/instructions
   - Should go directly to current level
   - Timer should resume

4. **Completed Game**
   - Login with completed team
   - Should go directly to victory page
   - Should not see intro/instructions

### Manual Testing

```bash
# Start frontend
cd frontend
npm run dev

# Test flow:
1. Create new team or use level 1 team
2. Login
3. Verify intro animation plays
4. Verify auto-redirect to instructions
5. Read instructions
6. Click "Proceed to Mission"
7. Verify timer starts
8. Verify Level 1 loads
```

## Future Enhancements

Possible improvements:
- Skip intro button for returning players
- Sound effects for typing
- More dramatic animations
- Video background
- Voice-over narration
- Customizable intro speed
- Save "intro seen" flag to skip on subsequent logins

## Files Modified

1. `frontend/src/pages/Intro.tsx` - NEW
2. `frontend/src/pages/Instructions.tsx` - NEW
3. `frontend/src/App.tsx` - Added routes, updated HUD logic
4. `frontend/src/pages/Login.tsx` - Updated redirect logic
5. `frontend/src/contexts/GameContext.tsx` - Added `startGame()` function

## Configuration

No configuration needed. The feature works out of the box.

**Customization Options**:
- Typing speed: Change `30` in `setInterval` (Intro.tsx)
- Line delay: Change `300` in `setTimeout` (Intro.tsx)
- Fade-in speed: Change `300` in `setTimeout` (Instructions.tsx)
- Intro text: Modify `introLines` array (Intro.tsx)

## Accessibility

- Keyboard navigation supported
- Screen reader friendly
- High contrast (green on black)
- Clear visual hierarchy
- Large clickable button
- No time pressure on instructions page

---

This feature significantly improves the onboarding experience and sets the tone for the CTF game!
