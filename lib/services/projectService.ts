import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { getServerDb } from '@/lib/firebase-server';
import { Project } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'projects';
const isServer = typeof window === 'undefined';

// Unified database functions that work with both SDKs
const dbGet = () => isServer ? getServerDb() : getDb();

const dbCollection = (path: string) => {
  if (isServer) {
    return (dbGet() as any).collection(path);
  }
  return collection(dbGet() as any, path);
};

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

const dbGetDocs = async (ref: any) => {
  if (isServer) {
    const snap = await ref.get();
    return { docs: snap.docs.map((d: any) => ({ id: d.id, data: () => d.data() })) };
  }
  return getDocs(ref);
};

const dbAddDoc = async (ref: any, data: any) => {
  if (isServer) {
    const snap = await ref.add(data);
    return { id: snap.id };
  }
  return addDoc(ref, data);
};

const dbUpdateDoc = async (ref: any, data: any) => {
  if (isServer) {
    await ref.update(data);
    return;
  }
  return updateDoc(ref, data);
};

const dbDeleteDoc = async (ref: any) => {
  if (isServer) {
    await ref.delete();
    return;
  }
  return deleteDoc(ref);
};

const dbQuery = (ref: any, ...constraints: any[]) => {
  if (isServer) {
    return ref; // Admin SDK의 where는 체이닝으로 처리
  }
  return query(ref, ...constraints);
};

const dbWhere = (field: string, op: any, value: any) => {
  if (isServer) {
    const adminFirestore = require('firebase-admin/firestore');
    return adminFirestore.where(field, op, value);
  }
  return where(field, op, value);
};

// Unified serverTimestamp that works with both SDKs
const dbServerTimestamp = () => {
  if (isServer) {
    return FieldValue.serverTimestamp();
  }
  return serverTimestamp();
};

// Firestore document data type
interface FirestoreProjectData {
  uid: string;
  title: string;
  scale: number;
  category: string;
  summary: string;
  created_at: Timestamp;
}

// Convert Firestore document to Project
const docToProject = (id: string, docSnapshot: any): Project => {
  const data = docSnapshot.data ? docSnapshot.data() : docSnapshot as any;
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id,
    uid: data.uid || '',
    title: data.title || '',
    scale: data.scale ?? 5,
    category: data.category || 'General',
    summary: data.summary || '',
    created_at: data.created_at || Timestamp.now(),
  };
};

// Get all projects for a user
export async function getProjects(uid: string): Promise<Project[]> {
  try {
    const coll = dbCollection(COLLECTION_NAME);
    let queryRef: any;

    if (isServer) {
      queryRef = coll.where('uid', '==', uid);
    } else {
      queryRef = query(coll, where('uid', '==', uid));
    }

    const querySnapshot = await dbGetDocs(queryRef);
    const projects = querySnapshot.docs.map((doc: any) => docToProject(doc.id, doc));

    // Sort by created_at descending (client-side)
    return projects.sort((a: any, b: any) => {
      const aTime = a.created_at instanceof Date
        ? a.created_at.getTime()
        : (a.created_at?.seconds ? (a.created_at.seconds * 1000 + (a.created_at.nanoseconds || 0) / 1000000) : 0);
      const bTime = b.created_at instanceof Date
        ? b.created_at.getTime()
        : (b.created_at?.seconds ? (b.created_at.seconds * 1000 + (b.created_at.nanoseconds || 0) / 1000000) : 0);
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

// Get a single project by ID
export async function getProject(id: string): Promise<Project | null> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    const docSnap = await dbGetDoc(docRef);

    if ((docSnap as any).exists) {
      return docToProject(id, docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}

// Create a new project
export async function createProject(
  projectData: Omit<Project, 'id' | 'created_at'>
): Promise<Project | null> {
  try {
    const collRef = dbCollection(COLLECTION_NAME);
    const docRef = await dbAddDoc(collRef, {
      ...projectData,
      created_at: dbServerTimestamp(),
    });

    const result: Project = {
      id: (docRef as any).id,
      uid: String(projectData.uid),
      title: String(projectData.title),
      scale: Number(projectData.scale),
      category: String(projectData.category),
      summary: String(projectData.summary || ''),
      created_at: Timestamp.now(),
    };
    return result;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

// Update a project
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at'>>
): Promise<boolean> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    await dbUpdateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    await dbDeleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
