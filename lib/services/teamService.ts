import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { getServerDb } from '@/lib/firebase-server';

const COLLECTION_NAME = 'teams';
const isServer = typeof window === 'undefined';

// Unified database functions that work with both SDKs
const dbGet = () => isServer ? getServerDb() : getDb();

const dbDoc = (path: string, ...pathSegments: string[]) => {
  if (isServer) {
    return (dbGet() as any).doc(pathSegments.length > 0 ? `${path}/${pathSegments.join('/')}` : path);
  }
  return doc(dbGet() as any, path, ...pathSegments);
};

const dbGetDoc = async (ref: any) => {
  if (isServer) {
    const snap = await ref.get();
    return { exists: snap.exists, data: () => snap.data(), id: snap.id };
  }
  return getDoc(ref);
};

const dbSetDoc = async (ref: any, data: any, options?: any) => {
  if (isServer) {
    await ref.set(data, options || {});
    return;
  }
  return setDoc(ref, data, options);
};

export interface TeamData {
  teamName: string;
  members: Array<{ id: string; name: string; color: string }>;
  teamSchedules: Record<string, Record<string, 'FLEX' | 'AFTERNOON' | 'VACATION' | 'WORK'>>;
  updated_at?: Timestamp;
}

export async function getTeamData(uid: string): Promise<TeamData | null> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, uid);
    const docSnap = await dbGetDoc(docRef);

    if ((docSnap as any).exists) {
      return docSnap.data() as TeamData;
    }
    return null;
  } catch (error) {
    console.error('Error getting team data:', error);
    return null;
  }
}

export async function saveTeamData(uid: string, data: TeamData): Promise<boolean> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, uid);
    await dbSetDoc(
      docRef,
      {
        ...data,
        updated_at: Timestamp.now(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving team data:', error);
    return false;
  }
}
