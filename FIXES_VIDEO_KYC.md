# Video KYC Admin Dashboard - Fixes Documentation

## Issues Fixed

### 1. ❌ Video KYC Not Showing After Approval

**Problem:** Approved riders' video KYC status wasn't appearing in the admin dashboard.

**Root Cause:** Bug in `/src/app/api/admin/video-kyc/pending/route.ts`

- Used incorrect field name: `riderOnboardingStatus: 4`
- Correct field name: `riderOnboardingSteps: 4` (defined in user.model.ts)
- Result: Query never matched any riders

**Fix Applied:**

```typescript
// BEFORE (Wrong)
const rider = await User.find({
  role: "rider",
  riderOnboardingStatus: 4, // ❌ Field doesn't exist
  videoKYCStatus: { $in: ["pending", "in_progress"] },
});

// AFTER (Fixed)
const rider = await User.find({
  role: "rider",
  riderOnboardingSteps: 4, // ✅ Correct field
  videoKYCStatus: { $in: ["pending", "in_progress"] },
});
```

---

### 2. ❌ Changes Not Reflecting Without Manual Page Reload

**Problem:** After approving/rejecting riders or starting KYC, changes didn't appear until manual page refresh.

**Root Causes:**

- **No auto-refresh:** Data fetched once on mount with empty dependency array
- **No refresh callback:** Components didn't trigger parent refresh after actions
- **Stale UI:** ReviewCard didn't communicate success back to dashboard

**Fixes Applied:**

#### A. Added Auto-Refresh Polling (AdminDashboard.tsx)

```typescript
useEffect(() => {
  handleGetData();
  handleGetKYCData();

  // Auto-refresh every 10 seconds to reflect real-time changes
  const interval = setInterval(() => {
    handleGetData();
    handleGetKYCData();
  }, 10000);

  return () => clearInterval(interval);
}, []);
```

#### B. Added Manual Refresh Button (AdminDashboard.tsx)

- New refresh button in the page header
- Instant refresh when clicked
- Shows loading state while refreshing

#### C. Added Refresh Callback Chain

1. **AdminDashboard → ContentList**: Pass `onRefresh` prop
2. **ContentList → ReviewCard**: Pass `onRefresh` prop
3. **ReviewCard**: Call `onRefresh()` after successfully starting KYC

```typescript
const handleStartVideoKYC = async (e: React.MouseEvent) => {
  try {
    setKycLoading(true);
    const { data } = await axios.get(`/api/admin/video-kyc/start/${item._id}`);

    // ✅ NEW: Trigger parent refresh
    if (onRefresh) {
      onRefresh();
    }
  } catch (error) {
    setKycError(error?.response?.data?.message ?? "Failed to start KYC");
  } finally {
    setKycLoading(false);
  }
};
```

---

## Files Modified

| File                                            | Changes                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `/src/app/api/admin/video-kyc/pending/route.ts` | Fixed field name: `riderOnboardingStatus` → `riderOnboardingSteps`  |
| `/src/components/AdminDashboard.tsx`            | Added auto-refresh polling, manual refresh button, refresh callback |
| `/src/components/ContentList.tsx`               | Added `onRefresh` prop to pass to ReviewCard                        |
| `/src/components/ReviewCard.tsx`                | Added `onRefresh` prop, trigger on successful KYC start             |

---

## How It Works Now

### For Admin Users:

1. **Auto-refresh:** Dashboard automatically refreshes every 10 seconds
2. **Manual refresh:** Click "Refresh" button for immediate update
3. **Action feedback:** After starting KYC, the list updates automatically

### Data Flow:

```
Admin Action (e.g., Start KYC)
    ↓
ReviewCard.handleStartVideoKYC()
    ↓
API Call: /api/admin/video-kyc/start/{id}
    ↓
onRefresh() callback triggered
    ↓
AdminDashboard.handleRefresh()
    ↓
Both handleGetData() & handleGetKYCData() executed
    ↓
UI updates with fresh data
```

---

## Testing Checklist

- [ ] Approve a rider and verify video KYC appears immediately or within 10 seconds
- [ ] Start a KYC session and confirm the "Join Call" button appears without reload
- [ ] Click the refresh button and verify all data updates
- [ ] Leave dashboard open for > 10 seconds and confirm auto-refresh works
- [ ] Reject a rider and verify it disappears from the list

---

## Additional Notes

- **Polling Interval:** Set to 10 seconds for real-time feel without excessive server load
- **Cleanup:** useEffect now properly cleans up the interval on unmount
- **Backward Compatible:** Changes are additive; no breaking changes to existing code
- **Performance:** Multiple data fetches combined into single `handleRefresh()` call
