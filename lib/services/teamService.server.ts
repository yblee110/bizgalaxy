/**
 * SERVER-ONLY Team Service
 * Uses Firebase Admin SDK exclusively
 * This file should only be imported in API routes (server-side)
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getServerDb } from '@/lib/firebase-server';

const COLLECTION_NAME = 'teams';

export interface TeamData {
  teamName: string;
  members: Array<{ id: string; name: string; color: string }>;
  teamSchedules: Record<string, Record<string, 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK'>>;
  updated_at?: { seconds: number; nanoseconds: number };
}

export async function getTeamData(uid: string): Promise<TeamData | null> {
  try {
    const db = getServerDb();
    const doc = await db.collection(COLLECTION_NAME).doc(uid).get();

    if (doc.exists) {
      return doc.data() as TeamData;
    }
    return null;
  } catch (error) {
    console.error('Error getting team data:', error);
    return null;
  }
}

export async function saveTeamData(uid: string, data: TeamData): Promise<boolean> {
  try {
    const db = getServerDb();
    await db.collection(COLLECTION_NAME).doc(uid).set(
      {
        ...data,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving team data:', error);
    return false;
  }
}
