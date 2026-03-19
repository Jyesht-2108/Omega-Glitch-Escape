# Level Access Control

## Problem
Players could skip levels by manually changing the URL:
- On Level 1, could access `/level/2`, `/level/3`, `/level/4`
- Could bypass puzzle solving
- Unfair advantage in competition

## Solution
Created `LevelGuard` component that enforces level progression.

---

## Implementation

### LevelGuard Component
**File**: `frontend/src/components/LevelGuard.tsx`

```typescript
export const LevelGuard: React.FC<LevelGuardProps> = ({ requiredLevel, children }) => {
  const { currentLevel } = useGame();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Special case: level3-admin and level3-complete are part of level 3
    const isLevel3Special = location.pathname === '/level3-admin' || location.pathname === '/level3-complete';
    
    if (isLevel3Special) {
      // Allow if on level 3 or higher
      if (currentLevel < 3) {
        console.log(`Access denied to ${location.pathname}. Current level: ${currentLevel}, Required: 3`);
        navigate(`/level/${currentLevel}`, { replace: true });
      }
    } else if (requiredLevel > currentLevel) {
      // Trying to access a level ahead of progress
      console.log(`Access denied to level ${requiredLevel}. Current level: ${currentLevel}`);
      navigate(`/level/${currentLevel}`, { replace: true });
    }
  }, [requiredLevel, currentLevel, navigate, location.pathname]);

  return <>{children}</>;
};
```

### Usage in App.tsx
```typescript
<Route path="/level/2" element={
  <ProtectedRoute>
    <LevelGuard requiredLevel={2}>
      <Level2 />
    </LevelGuard>
  </ProtectedRoute>
} />
```

---

## Access Rules

### Level 1
- **Allowed**: `/level/1`
- **Blocked**: `/level/2`, `/level/3`, `/level/4`, `/level3-admin`, `/level3-complete`
- **Redirect**: Stays on `/level/1`

### Level 2
- **Allowed**: `/level/1`, `/level/2`
- **Blocked**: `/level/3`, `/level/4`, `/level3-admin`, `/level3-complete`
- **Redirect**: Back to `/level/2`

### Level 3
- **Allowed**: `/level/1`, `/level/2`, `/level/3`, `/level3-admin`, `/level3-complete`
- **Blocked**: `/level/4`
- **Redirect**: Back to `/level/3`

### Level 4
- **Allowed**: All levels
- **Blocked**: None
- **Redirect**: N/A

### Special Routes
- `/level3-admin` - Requires Level 3 (discovered via Base64 puzzle)
- `/level3-complete` - Requires Level 3 (transition page)
- `/victory` - No level requirement (reached after Level 4)

---

## Login Route Fix

### Problem
Logout redirected to `/login` which showed 404 error.

### Solution
Added `/login` route that renders the same Login component as `/`.

```typescript
<Route path="/" element={<Login />} />
<Route path="/login" element={<Login />} />
```

**Result**: Both `/` and `/login` now work correctly.

---

## Testing

### Test Level Skipping Prevention
1. Login and start on Level 1
2. Try to access `/level/2` in URL bar
3. **Expected**: Redirected back to `/level/1`
4. Try to access `/level/3`
5. **Expected**: Redirected back to `/level/1`
6. Complete Level 1
7. Now on Level 2
8. Try to access `/level/3`
9. **Expected**: Redirected back to `/level/2`

### Test Level3-Admin Access
1. Login and start on Level 1
2. Try to access `/level3-admin`
3. **Expected**: Redirected to `/level/1`
4. Progress to Level 3
5. Try to access `/level3-admin`
6. **Expected**: Access granted (this is the puzzle solution)

### Test Login Routes
1. Logout
2. Should redirect to `/login`
3. **Expected**: Login page shows (no 404)
4. Navigate to `/`
5. **Expected**: Login page shows
6. Both routes work

---

## Console Logs

When access is denied:
```
Access denied to level 3. Current level: 1
```

When trying to access level3-admin too early:
```
Access denied to /level3-admin. Current level: 2, Required: 3
```

---

## Security Layers

The game now has multiple security layers:

1. **ProtectedRoute** - Requires authentication
2. **LevelGuard** - Enforces level progression
3. **GameCompletedGuard** - Prevents playing after completion
4. **AntiCheat** - Detects tab switching
5. **Backend Validation** - Server-side progress tracking

---

## Files Modified

1. `frontend/src/components/LevelGuard.tsx` (new)
   - Created level access control component

2. `frontend/src/App.tsx`
   - Added LevelGuard to all level routes
   - Added `/login` route
   - Imported LevelGuard component

---

## Summary

✅ Cannot skip levels by changing URL
✅ Must complete levels in order
✅ Level3-admin requires Level 3 (puzzle solution)
✅ Login route works at both `/` and `/login`
✅ Console logs show access denial reasons
✅ Automatic redirect to current level

The game progression is now properly enforced!
