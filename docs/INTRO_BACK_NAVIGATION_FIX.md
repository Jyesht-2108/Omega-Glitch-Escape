# Intro/Instructions Back Navigation Fix

## Issue
Players could use the browser back button to return to intro or instructions pages after starting the game, which would:
- Stop the timer
- Allow them to waste time without penalty
- Break the game flow

## Solution
Added navigation guards to both intro and instructions pages that automatically redirect players to their current level if the game has already started.

## Implementation

### 1. Intro Page Guard

**File**: `frontend/src/pages/Intro.tsx`

**Logic**:
```typescript
useEffect(() => {
  const gameState = localStorage.getItem('gameState');
  if (gameState) {
    try {
      const parsed = JSON.parse(gameState);
      // If timer has started or player is beyond level 1, redirect
      if (parsed.isTimerRunning || parsed.currentLevel > 1) {
        navigate(`/level/${parsed.currentLevel}`, { replace: true });
        return;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}, [navigate]);
```

**Conditions for Redirect**:
- Timer is running (`isTimerRunning === true`)
- OR player is past level 1 (`currentLevel > 1`)

### 2. Instructions Page Guard

**File**: `frontend/src/pages/Instructions.tsx`

**Logic**:
```typescript
useEffect(() => {
  if (isTimerRunning || currentLevel > 1) {
    navigate(`/level/${currentLevel}`, { replace: true });
  }
}, [isTimerRunning, currentLevel, navigate]);
```

**Conditions for Redirect**:
- Timer is running (`isTimerRunning === true`)
- OR player is past level 1 (`currentLevel > 1`)

## How It Works

### Scenario 1: First-Time Player
1. Login → Intro page ✅ (allowed)
2. Intro → Instructions ✅ (allowed)
3. Click "Proceed" → Level 1 ✅ (timer starts)
4. Press back button → Redirected to Level 1 ✅ (blocked)

### Scenario 2: Returning Player (Level 2+)
1. Login → Skip intro/instructions → Level 2 ✅
2. Try to navigate to `/intro` → Redirected to Level 2 ✅ (blocked)
3. Try to navigate to `/instructions` → Redirected to Level 2 ✅ (blocked)

### Scenario 3: Player at Level 1 (Before Proceed)
1. Login → Intro ✅ (allowed)
2. Intro → Instructions ✅ (allowed)
3. Press back → Intro ✅ (allowed, timer not started yet)
4. Click "Proceed" → Level 1 ✅ (timer starts)
5. Press back → Redirected to Level 1 ✅ (blocked)

## Key Features

### 1. Replace Navigation
Uses `navigate(..., { replace: true })` to:
- Replace history entry (can't go back again)
- Prevent infinite back button loops
- Clean navigation history

### 2. Dual Check
Checks both:
- **Timer status**: Has the game started?
- **Level progress**: Is player past level 1?

This ensures:
- Players who started can't go back
- Players who progressed can't go back
- First-time players can navigate freely before starting

### 3. LocalStorage Fallback
Intro page checks localStorage directly because:
- Page might load before GameContext
- Ensures immediate redirect
- No flash of content

## Testing

### Test Cases

#### ✅ Test 1: First-Time Flow
```
1. Login with level 1 team
2. See intro animation
3. See instructions
4. Click "Proceed to Mission"
5. Timer starts, Level 1 loads
6. Press browser back button
7. Should redirect to Level 1 (not instructions)
```

#### ✅ Test 2: Returning Player
```
1. Login with level 2+ team
2. Should skip to current level
3. Manually navigate to /intro
4. Should redirect to current level
5. Manually navigate to /instructions
6. Should redirect to current level
```

#### ✅ Test 3: Before Game Start
```
1. Login with level 1 team
2. See intro
3. Press back (should work, go to login)
4. Login again
5. See intro → instructions
6. Press back (should work, go to intro)
7. Click "Proceed"
8. Press back (should NOT work, stay at level 1)
```

### Manual Testing

```bash
# Start frontend
cd frontend
npm run dev

# Test sequence:
1. Login with level 1 team
2. Watch intro
3. Read instructions
4. Click "Proceed to Mission"
5. Verify Level 1 loads
6. Press browser back button
7. Verify you stay at Level 1 (redirected)
8. Try typing /intro in URL
9. Verify you're redirected to Level 1
10. Try typing /instructions in URL
11. Verify you're redirected to Level 1
```

## Edge Cases Handled

### 1. Direct URL Access
- Player types `/intro` in URL bar
- Guard checks game state
- Redirects if game started

### 2. Browser Back Button
- Player presses back after starting
- Guard detects timer running
- Redirects to current level

### 3. Browser Forward Button
- Player goes back to login, then forward
- Guard checks game state
- Redirects if appropriate

### 4. Page Refresh
- Player refreshes intro/instructions
- Guard checks localStorage
- Redirects if game started

### 5. Multiple Tabs
- Player opens game in multiple tabs
- Each tab checks game state independently
- All tabs redirect appropriately

## Benefits

✅ **Prevents Timer Manipulation**: Can't pause timer by going back
✅ **Maintains Game Flow**: Players stay in the game
✅ **Fair Competition**: No time-wasting exploits
✅ **Better UX**: Clear one-way progression
✅ **Clean Navigation**: No confusing back button behavior

## Technical Details

### Dependencies
- `useNavigate` from react-router-dom
- `useGame` context hook
- `localStorage` for state persistence

### Performance
- Minimal overhead (single useEffect)
- Instant redirect (no delay)
- No additional API calls

### Browser Compatibility
- Works in all modern browsers
- Uses standard Web APIs
- No special polyfills needed

## Files Modified

1. `frontend/src/pages/Intro.tsx` - Added navigation guard
2. `frontend/src/pages/Instructions.tsx` - Added navigation guard

## Build Status

✅ **Build Successful**
- No TypeScript errors
- No build warnings
- Production ready

## Summary

**Problem**: Players could go back to intro/instructions after starting, stopping the timer.

**Solution**: Added guards that redirect players to their current level if:
- Timer is running, OR
- Player is past level 1

**Result**: One-way progression through intro → instructions → game, with no way to go back once started.

---

**Status**: ✅ FIXED

Players can no longer manipulate the timer by navigating back to intro/instructions pages!
