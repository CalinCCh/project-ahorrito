# SyncProgressToast Component

A modern, aesthetic toast notification component designed to show transaction synchronization progress with a real progress bar.

## Features

- **Modern Design**: Glass morphism effect with backdrop blur
- **Real Progress**: Animated progress bar with shimmer effects
- **Top Center Position**: Non-intrusive positioning
- **Multiple States**: Loading, success, and error states
- **Spanish Text**: "Sincronizando transacciones" with account details
- **Realistic Progress**: Based on actual transaction counts
- **Auto-dismiss**: Automatically removes completed toasts

## Usage

### Basic Implementation

```tsx
import { useSyncProgressToast } from "@/components/feedback/SyncProgressToast";

function MyComponent() {
  const { showSyncProgress, updateSyncProgress, dismissSyncProgress } =
    useSyncProgressToast();

  const handleSync = async () => {
    const accountId = "account-123";

    // Show initial toast
    showSyncProgress(accountId, {
      current: 0,
      total: 100,
      status: "Connecting to bank...",
      accountName: "Chase Checking",
    });

    // Update progress
    updateSyncProgress(accountId, {
      current: 50,
      total: 100,
      status: "Syncing transactions...",
      accountName: "Chase Checking",
    });

    // Complete sync
    updateSyncProgress(accountId, {
      current: 100,
      total: 100,
      status: "Sync completed successfully!",
      accountName: "Chase Checking",
      isComplete: true,
    });

    // Auto-dismiss after 2 seconds
    setTimeout(() => dismissSyncProgress(accountId), 2000);
  };
}
```

### Integration with Unified Sync Hook

The component is already integrated with the `useUnifiedSync` hook:

```tsx
import { useUnifiedSync } from "@/features/sync/hooks/use-unified-sync";

function SyncButton() {
  const { syncSingleAccount, isSyncing } = useUnifiedSync();

  const handleSync = async () => {
    await syncSingleAccount({
      id: "account-123",
      plaidId: "truelayer-account-id",
    });
  };

  return (
    <Button onClick={handleSync} disabled={isSyncing}>
      {isSyncing ? "Syncing..." : "Sync Transactions"}
    </Button>
  );
}
```

## API Reference

### `useSyncProgressToast()`

Returns an object with the following methods:

#### `showSyncProgress(accountId, data)`

- **accountId**: `string` - Unique identifier for the account
- **data**: `SyncProgressData` - Initial progress data

#### `updateSyncProgress(accountId, data)`

- **accountId**: `string` - Account identifier
- **data**: `SyncProgressData` - Updated progress data

#### `dismissSyncProgress(accountId)`

- **accountId**: `string` - Account identifier to dismiss

#### `dismissAllSyncProgress()`

Dismisses all active sync progress toasts.

### `SyncProgressData` Interface

```typescript
interface SyncProgressData {
  current: number; // Current progress (0-total)
  total: number; // Total items to sync
  status: string; // Status message
  accountName: string; // Display name for the account
  isComplete?: boolean; // Marks sync as complete
  hasError?: boolean; // Marks sync as failed
}
```

## Visual States

### Loading State

- Blue gradient progress bar
- Spinning sync icon
- Glass morphism background
- Shimmer animation on progress bar

### Success State

- Green checkmark icon
- Bounce animation
- "Success" styling

### Error State

- Red alert triangle icon
- Error styling
- Remains visible longer for user attention

## Styling

The component uses modern CSS features:

- **Backdrop Filter**: `blur(16px)` for glass effect
- **Box Shadow**: Multiple layers for depth
- **Gradients**: Smooth color transitions
- **Animations**: Keyframe-based smooth animations

## Test Page

Visit `/test-sync` to see the component in action with different scenarios:

- Basic linear progress
- Realistic multi-phase sync simulation
- Error handling demonstration

## Integration Points

The component is used in:

- `/transactions` page sync button
- `/accounts` page refresh buttons
- Any component using `useUnifiedSync` hook

## Customization

### Colors

Modify the CSS variables in `globals.css`:

```css
.toast-glass {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Animations

Adjust keyframes in `globals.css`:

```css
@keyframes progress-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

### Position

Update Sonner toast position in the component:

```tsx
toast.custom(/* ... */, {
  position: "top-center", // Change position here
});
```

## Performance

- Efficient re-renders using React state management
- Cleanup of intervals and timeouts
- Minimal DOM impact with toast library
- Smooth 60fps animations

## Accessibility

- Screen reader compatible
- Keyboard navigation support
- High contrast support
- Appropriate ARIA labels
