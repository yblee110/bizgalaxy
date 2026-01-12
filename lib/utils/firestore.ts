/**
 * Firestore utility functions for data transformation
 */

/**
 * Converts Firestore timestamp to JavaScript Date
 * @param timestamp - Firestore timestamp object with seconds and nanoseconds
 * @returns JavaScript Date object
 */
export function convertFirestoreTimestamp(timestamp?: { seconds: number; nanoseconds: number }): Date {
  if (!timestamp) {
    return new Date();
  }
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

/**
 * Converts Firestore timestamps in an object to JavaScript Dates
 * @param obj - Object containing Firestore timestamps
 * @param fields - Field names that contain timestamps
 * @returns Object with converted Dates
 */
export function convertFirestoreTimestamps<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };

  for (const field of fields) {
    const value = result[field];
    if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
      result[field] = convertFirestoreTimestamp(value as { seconds: number; nanoseconds: number }) as T[keyof T];
    }
  }

  return result;
}

/**
 * Type guard for Firestore timestamp
 */
export function isFirestoreTimestamp(value: unknown): value is { seconds: number; nanoseconds: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof (value as { seconds: unknown }).seconds === 'number' &&
    typeof (value as { nanoseconds: unknown }).nanoseconds === 'number'
  );
}
