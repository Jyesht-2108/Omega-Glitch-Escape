# Logout Feature & HUD Improvements

## Changes Made

### 1. Added Logout Button to HUD ✅

**Location**: `frontend/src/components/HUD.tsx`

**Features**:
- Logout button in HUD header (top-right)
- Confirmation modal before logout
- Redirects to login page after logout
- Clears all game state and tokens

**Implementation**:
```typescript
// Added LogOut icon import
import { Clock, Zap, Trophy, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Added logout from useGame
const { ..., logout } = useGame();
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
const navigate = useNavigate();

// Logout handler
const handleLogout = () => {
  logout();
  navigate('/');
};

// Logout button in HUD
<motion.button
  onClick={() => setShowLogoutConfirm(true)}
  className="px-3 py-1 border border-destructive text-destructive text-xs font-mono hover:bg-destructive hover:text-destructive-foreground transition-colors"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  title="Logout"
>
  <LogOut className="w-3 h-3 inline mr-1" />
  LOGOUT
</motion.button>

// Logout confirmation modal
<AnimatePresence>
  {showLogoutConfirm && (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div className="bg-card border border-destructive p-6 max-w-md box-glow-red">
        <h3 className="text-destructive text-lg font-bold mb-3 text-glow-red">⚠ LOGOUT CONFIRMATION</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Are you sure you want to logout? Your progress has been auto-saved, but the timer will stop.
        </p>
        <div className="flex gap-3">
          <button onClick={handleLogout}>CONFIRM LOGOUT</button>
          <button onClick={() => setShowLogoutConfirm(false)}>CANCEL</button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

### 2. Fixed HUD Display on Login Page ✅

**Problem**: HUD was showing on login page when user was already logged in

**Solution**: Updated App.tsx to conditionally show HUD based on route

**Location**: `frontend/src/App.tsx`

**Implementation**:
```typescript
const AppRoutes = () => {
  const location = useLocation();
  const { isLoggedIn } = useGame();
  
  // Don't show HUD on login page or victory page
  const showHUD = isLoggedIn && location.pathname !== '/' && location.pathname !== '/victory';

  return (
    <>
      {showHUD && <HUD />}  {/* Conditional display */}
      <AntiCheat />
      <CRTOverlay />
      {/* ... routes */}
    </>
  );
};
```

**HUD Now Shows On**:
- ✅ Level 1, 2, 3, 4
- ✅ Level 3 Admin page
- ✅ Level 3 Complete page

**HUD Hidden On**:
- ✅ Login page (/)
- ✅ Victory page (/victory)
- ✅ Not Found page

---

### 3. Auto-Redirect on Login Page ✅

**Problem**: If user navigates to `/` while logged in, they see login form

**Solution**: Auto-redirect to current level if already logged in

**Location**: `frontend/src/pages/Login.tsx`

**Implementation**:
```typescript
const Login = () => {
  const { login, isLoggedIn, currentLevel } = useGame();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(`/level/${currentLevel}`);
    }
  }, [isLoggedIn, currentLevel, navigate]);
  
  // ... rest of component
};
```

**Behavior**:
- User navigates to `/` while logged in
- Automatically redirects to current level
- No login form shown
- Seamless experience

---

## User Experience Flow

### Logout Flow
1. User clicks "LOGOUT" button in HUD
2. Confirmation modal appears
3. User clicks "CONFIRM LOGOUT"
4. Game state cleared (timer stops, progress saved)
5. Token removed from localStorage
6. Redirect to login page
7. HUD disappears

### Login Page Access
1. **Not logged in**: Shows login form
2. **Already logged in**: Auto-redirects to current level
3. **After logout**: Shows login form

### HUD Visibility
1. **Login page**: Hidden (even if logged in)
2. **Game levels**: Visible
3. **Victory page**: Hidden (shows own stats)
4. **Not found**: Hidden

---

## Visual Design

### Logout Button
- **Color**: Red/destructive theme
- **Icon**: LogOut icon from lucide-react
- **Position**: Top-right of HUD, after hint button
- **Hover**: Background changes to red, text to white
- **Animation**: Scale on hover/tap

### Logout Confirmation Modal
- **Style**: Red border with glow effect
- **Title**: "⚠ LOGOUT CONFIRMATION" in red
- **Message**: Informs user progress is saved, timer will stop
- **Buttons**: 
  - "CONFIRM LOGOUT" (red background)
  - "CANCEL" (gray border)
- **Backdrop**: Blurred background
- **Click outside**: Closes modal (cancel)

---

## Technical Details

### State Management
```typescript
// HUD component state
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

// GameContext logout function
const logout = useCallback(() => {
  authService.logout();  // Clear token
  setState({
    teamName: '',
    teamId: '',
    isLoggedIn: false,
    currentLevel: 1,
    score: 0,
    timerSeconds: 3 * 60 * 60,
    isTimerRunning: false,
    hints: [],
    leaderboard: MOCK_LEADERBOARD,
    level2Stage: 'python',
    level3Stage: 'pointers',
    level4Stage: 'glitch',
  });
  localStorage.removeItem('gameState');
}, []);
```

### Modal Click Handling
```typescript
// Click outside to close
<motion.div
  onClick={() => setShowLogoutConfirm(false)}
  className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
>
  {/* Stop propagation on modal content */}
  <motion.div
    onClick={(e) => e.stopPropagation()}
    className="bg-card border border-destructive p-6 max-w-md box-glow-red"
  >
    {/* Modal content */}
  </motion.div>
</motion.div>
```

---

## Files Modified

1. `frontend/src/components/HUD.tsx`
   - Added logout button
   - Added logout confirmation modal
   - Added handleLogout function
   - Imported LogOut icon and useNavigate

2. `frontend/src/App.tsx`
   - Added conditional HUD display logic
   - HUD hidden on login and victory pages

3. `frontend/src/pages/Login.tsx`
   - Added auto-redirect for logged-in users
   - Imported useEffect
   - Added isLoggedIn and currentLevel to useGame

---

## Testing

### Test Logout Button
1. Login and navigate to any level
2. Click "LOGOUT" button in HUD
3. Confirmation modal should appear
4. Click "CONFIRM LOGOUT"
5. Should redirect to login page
6. HUD should disappear
7. localStorage should be cleared

### Test Logout Cancel
1. Click "LOGOUT" button
2. Click "CANCEL" in modal
3. Modal should close
4. Should remain on current page
5. Game should continue

### Test HUD Visibility
1. Login and check HUD appears on levels
2. Navigate to `/` → HUD should not appear
3. Navigate to `/victory` → HUD should not appear
4. Navigate to level → HUD should appear

### Test Auto-Redirect
1. Login and play game
2. Manually navigate to `/` in URL bar
3. Should auto-redirect to current level
4. Should not see login form

---

## Benefits

1. **User Control**: Players can logout when needed
2. **Clean UI**: HUD doesn't clutter login/victory screens
3. **Better UX**: Auto-redirect prevents confusion
4. **Confirmation**: Prevents accidental logouts
5. **Progress Safety**: Reminds users progress is saved
6. **Consistent Design**: Matches game's cyberpunk theme

---

## Future Enhancements

- Add keyboard shortcut for logout (e.g., Ctrl+L)
- Add "Return to Game" button on login page if logged in
- Add session timeout warning before auto-logout
- Add "Switch Team" option instead of full logout
- Add logout to victory screen as well
