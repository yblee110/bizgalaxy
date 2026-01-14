/**
 * SERVER-ONLY Project Service
 * Uses Firebase Admin SDK exclusively
 * This file should only be imported in API routes (server-side)
 */

import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getServerDb } from '@/lib/firebase-server';
import { Project } from '@/types';

const COLLECTION_NAME = 'projects';

// Convert Firestore document to Project
const docToProject = (id: string, data: any): Project => {
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id,
    uid: data.uid || '',
    title: data.title || '',
    scale: data.scale ?? 5,
    category: data.category || 'General',
    color: data.color,
    summary: data.summary || '',
    created_at: data.created_at || { seconds: 0, nanoseconds: 0 },
  };
};

// Get all projects for a user
export async function getProjects(uid: string): Promise<Project[]> {
  try {
    console.log('[projectService] Getting projects for uid:', uid);
    const db = getServerDb();
    console.log('[projectService] DB obtained, collection:', COLLECTION_NAME);
    const snapshot = await db.collection(COLLECTION_NAME).where('uid', '==', uid).get();
    console.log('[projectService] Query executed, docs found:', snapshot.docs.length);

    const projects = snapshot.docs.map((doc) => docToProject(doc.id, doc.data()));

    // Sort by created_at descending (client-side)
    return projects.sort((a, b) => {
      const aTime = a.created_at && typeof a.created_at === 'object' && 'seconds' in a.created_at
        ? a.created_at.seconds * 1000
        : 0;
      const bTime = b.created_at && typeof b.created_at === 'object' && 'seconds' in b.created_at
        ? b.created_at.seconds * 1000
        : 0;
      return bTime - aTime;
    });
  } catch (error: any) {
    console.error('[projectService] Error getting projects:', error.message);
    console.error('[projectService] Error code:', error.code);
    console.error('[projectService] Full error:', error);
    return [];
  }
}

// Get a single project by ID
export async function getProject(id: string): Promise<Project | null> {
  try {
    const db = getServerDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (doc.exists) {
      return docToProject(id, doc.data());
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
    console.log('[projectService] Creating project:', projectData.title);
    const db = getServerDb();
    console.log('[projectService] DB obtained for create');
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...projectData,
      created_at: FieldValue.serverTimestamp(),
    });
    console.log('[projectService] Project created with ID:', docRef.id);

    const result: Project = {
      id: docRef.id,
      uid: String(projectData.uid),
      title: String(projectData.title),
      scale: Number(projectData.scale),
      category: String(projectData.category),
      summary: String(projectData.summary || ''),
      created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
    };
    return result;
  } catch (error: any) {
    console.error('[projectService] Error creating project:', error.message);
    console.error('[projectService] Error code:', error.code);
    console.error('[projectService] Full error:', error);
    return null;
  }
}

// Update a project
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at'>>
): Promise<boolean> {
  try {
    const db = getServerDb();
    await db.collection(COLLECTION_NAME).doc(id).update(updates);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const db = getServerDb();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
