/**
 * Simple user ID management for demo purposes
 * In production, replace this with proper Firebase Authentication
 */

const USER_ID_KEY = 'bizgalaxy_user_id';

/**
 * Get or create a user ID from localStorage
 * Generates a random ID if none exists
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'demo_user';
  }

  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate a random user ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Reset the user ID (for testing/logging out)
 */
export function resetUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
}

/**
 * Get a display name for the user
 */
export function getUserDisplayName(): string {
  const userId = getUserId();
  // Extract a friendly name from the user ID
  const match = userId.match(/user_(\d+)/);
  if (match) {
    return `사용자 #${match[1].slice(-4)}`;
  }
  return '사용자';
}
