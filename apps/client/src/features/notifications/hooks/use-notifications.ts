/**
 * Placeholder notifications hook
 * TODO: Wire to real API/websocket when implementing notifications feature
 * Interface shape is stable — bottom nav can depend on this without changing
 */
export function useNotifications() {
  return {
    unreadCount: 0, // hardcoded for now
  };
}
