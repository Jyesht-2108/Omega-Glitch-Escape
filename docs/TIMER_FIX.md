# Timer System - Final Implementation

## Timer Behavior - CORRECT ✅

### Initial State
- **Starting time**: 3 hours (10,800 seconds)
- **On app load**: Timer stopped
- **On login**: Timer remains stopped until level entered
- **On level entry**: Timer starts automatically

### During Gameplay
- **Between levels**: Timer continues running
- **Security breach**: Timer CONTINUES running (60-second penalty)
- **Hint request**: Timer deducts 5 minutes (300 seconds)
- **Auto-save**: Runs every 30 seconds, saves current timer state

### On Logout
- **Timer stops**: `isTimerRunning` set to false
- **State cleared**: All game state reset
- **localStorage cleared**: Game state removed

---

## Security Breach Behavior - INTENTIONAL ✅

### Why Timer Continues During Security Breach

The timer **intentionally continues** during the 60-second security breach screen. This is the correct behavior because:

1. **Penalty for unauthorized actions**: Players lose time for tab-switching or other violations
2. **Deterrent effect**: Makes cheating costly and discourages attempts
3. **Fair competition**: All players face the same penalty
4. **CTF realism**: Security breaches have real consequences

### What Happens
1. Player triggers security breach (e.g., switches tabs)
2. Red warning screen appears
3. 60-second countdown starts (forced wait)
4. **Game timer continues running** (player loses ~60 seconds)
5. Player must wait full 60 seconds before dismissing
6. Player returns to game with less time remaining

### Total Time Lost
- **Minimum**: 60 seconds (if player returns immediately after countdown)
- **Actual**: Usually more (reaction time + reading warning)
- **Maximum**: 3 strikes = game over (total loss)

---

## Implementation Details

### Timer Start on All Levels

All levels (1-4) now properly start the timer:

**Level 1** (`Level1.tsx`):
```typescript
const { submitAnswer, addScore, setCurrentLevel, startTimer } = useGame();

useEffect(() => {
  setCurrentLevel(1);
  startTimer();  // ✅ Timer starts
}, [setCurrentLevel, startTimer]);
```

**Level 2** (`Level2.tsx`):
```typescript
const { submitAnswer, addScore, setCurrentLevel, level2Stage, setLevel2Stage, startTimer } = useGame();

useEffect(() => { 
  setCurrentLevel(2); 
  startTimer();  // ✅ Timer starts
}, [setCurrentLevel, startTimer]);
```

**Level 3** (`Level3.tsx`):
```typescript
const { submitAnswer, addScore, setCurrentLevel, level3Stage, setLevel3Stage, startTimer } = useGame();

useEffect(() => {
  setCurrentLevel(3);
  startTimer();  // ✅ Timer starts
  // ...
}, [setCurrentLevel, level3Stage, setLevel3Stage, startTimer]);
```

**Level 4** (`Level4.tsx`):
```typescript
const { submitAnswer, addScore, setCurrentLevel, stopTimer, level4Stage, setLevel4Stage, startTimer } = useGame();

useEffect(() => { 
  setCurrentLevel(4); 
  startTimer();  // ✅ Timer starts
  // ...
}, [setCurrentLevel, level4Stage, setLevel4Stage, startTimer]);
```

### AntiCheat Component

**Does NOT pause timer** (intentional):

```typescript
const triggerWarning = useCallback(() => {
  if (gameOver || exploded) return;

  const newStrikes = strikes + 1;
  setStrikes(newStrikes);
  
  playAlert();

  // Timer continues running as penalty - no pause needed ✅

  if (newStrikes >= 3) {
    setShow(false);
    setGameOver(true);
    stopAlarmRef.current = playAlarmSiren();
  } else {
    setShow(true);
    setCountdown(60);  // 60-second forced wait
    setCanDismiss(false);
    // ... countdown logic
  }
}, [strikes, gameOver, exploded, playAlert]);
```

**Dismiss function**:
```typescript
const dismiss = () => {
  if (!canDismiss) return;
  
  // Clear countdown interval
  if (countdownIntervalRef.current) {
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = null;
  }
  
  // Reset states
  setShow(false);
  setCountdown(60);
  setCanDismiss(false);
  
  // Timer continues running - no resume needed ✅
};
```

---

## Files Modified

1. `frontend/src/pages/Level2.tsx` - Added startTimer()
2. `frontend/src/pages/Level3.tsx` - Added startTimer()
3. `frontend/src/pages/Level4.tsx` - Added startTimer()
4. `frontend/src/components/AntiCheat.tsx` - Removed pause/resume (timer continues)
5. `frontend/src/contexts/GameContext.tsx` - Added pauseTimer/resumeTimer (not used, kept for future)

---

## Testing

### Test Timer Starts on Each Level
1. Login and start game
2. Enter Level 1 → Timer should start
3. Complete Level 1 → Enter Level 2 → Timer should continue
4. Enter Level 3 → Timer should continue
5. Enter Level 4 → Timer should continue

### Test Security Breach Penalty
1. Start playing any level
2. Note current timer value (e.g., 2:55:30)
3. Switch to another tab (trigger security breach)
4. Wait for 60-second countdown
5. Return to game
6. Check timer value → Should be ~60 seconds less (e.g., 2:54:30)

### Test Auto-Save During Breach
1. Trigger security breach
2. Open Network tab
3. Wait 30+ seconds (auto-save interval)
4. Should see PUT request to `/api/team/progress`
5. Check saved time_remaining → Should reflect time lost

---

## Summary

✅ Timer starts on all levels (1-4)
✅ Timer continues during security breach (intentional penalty)
✅ Timer stops on logout
✅ Auto-save captures correct timer state
✅ Progress tracking works correctly
✅ Security breach provides effective deterrent

The timer system is working exactly as designed for a CTF competition.
