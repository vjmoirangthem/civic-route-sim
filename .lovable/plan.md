
# Plan: Fix Truck Simulation Synchronization

## Problem Summary
The truck on the citizen's dashboard doesn't move when the admin starts the simulation. This happens because:

1. **Math bug in simulation**: The progress calculation has an error that makes trucks instantly complete their routes
2. **Map markers not updating smoothly**: The truck marker position updates aren't being applied correctly
3. **Browser tabs don't share state**: React Context only works within a single browser session, not across tabs

## Solution Overview
Since this is a **workflow demonstration prototype** (not production), we'll fix the simulation math and marker updates so that:
- When you navigate Admin → Start simulation → Go back → Go to Citizen, the truck is visibly moving
- Or when viewing both dashboards in the same browser tab (switching between them)

For a true "two screens side-by-side" demo, we would need a backend server or real-time sync (WebSocket/Supabase), but that's beyond the current scope.

---

## Technical Changes

### 1. Fix Simulation Progress Calculation
**File:** `src/context/SimulationContext.tsx`

The progress increment formula is incorrect. Current code:
```
progressIncrement = (speed * simSpeed * deltaTime) / (totalDistance * 3600)
newProgress = progress + progressIncrement * 100  ← WRONG
```

Should be:
```
progressIncrement = (speed * simSpeed * deltaTime) / (totalDistance * 3600)
newProgress = progress + progressIncrement  ← CORRECT (progress is 0-1)
```

The `* 100` causes the truck to instantly reach 100% progress and become idle.

### 2. Fix Map Marker Updates to Animate Smoothly
**File:** `src/components/map/MapContainer.tsx`

Current issue: The truck markers are created once, then `setLngLat()` is called on updates, but this doesn't always trigger visual updates reliably.

Solution: 
- Ensure markers update on every trucks state change
- Add a dedicated animation frame or interval to poll truck positions from context

### 3. Add Visual Debug Info (Optional Enhancement)
Show simulation status and truck position on the citizen dashboard so users can see:
- Whether simulation is running
- Current truck coordinates
- Progress percentage

### 4. Simplify to Single Primary Truck for Citizen View
As requested, show only **one truck** on the citizen dashboard for clarity. Filter to show only the truck on route1 (primary truck).

---

## Implementation Steps

### Step 1: Fix SimulationContext.tsx
- Remove the erroneous `* 100` multiplier from line 162
- This allows trucks to progress slowly (0.001 increments) along the route instead of jumping to 1.0 immediately

### Step 2: Improve MapContainer.tsx Truck Marker Updates
- Modify the truck marker update effect to always update positions
- Add a `key` based on truck position to force re-render when positions change
- Consider using `requestAnimationFrame` or short interval for smoother visual updates

### Step 3: Show Primary Truck Only on Citizen View
- Add a prop `primaryTruckId` to MapContainer
- In CitizenDashboard, pass `primaryTruckId="truck1"` to filter display to one truck

### Step 4: Test the Flow
1. Go to Login → Select Admin → Start Simulation
2. Watch truck progress bar increase
3. Go back → Select Citizen
4. Verify truck position has moved and continues moving
5. ETA and distance should update in real-time

---

## Files to Modify

| File | Change |
|------|--------|
| `src/context/SimulationContext.tsx` | Fix progress calculation formula |
| `src/components/map/MapContainer.tsx` | Improve marker position updates, add primary truck filter |
| `src/pages/CitizenDashboard.tsx` | Minor: pass primary truck ID for focused view |

---

## Expected Outcome
After these changes:
- The garbage truck will visibly move along the route when simulation runs
- Citizen dashboard will show the same truck position as admin dashboard (within same session)
- ETA and distance will update as the truck moves
- Collection status will change as truck approaches citizen locations

## Note on Multi-Tab Synchronization
True real-time sync between separate browser tabs would require:
- A backend server (FastAPI with WebSockets)
- Or Supabase Realtime subscriptions
- This is marked for a future phase when the backend is implemented
