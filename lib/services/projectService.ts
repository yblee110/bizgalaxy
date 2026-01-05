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
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project } from '@/types';

const COLLECTION_NAME = 'projects';

// Convert Firestore document to Project
const docToProject = (id: string, doc: any): Project => {
  const data = doc.data();
  return {
    id,
    uid: data.uid || '',
    title: data.title || '',
    scale: data.scale || 5,
    category: data.category || 'General',
    summary: data.summary || '',
    created_at: data.created_at || Timestamp.now(),
  };
};

// Get all projects for a user
export async function getProjects(uid: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('uid', '==', uid),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => docToProject(doc.id, doc));
  } catch (error) {
    console.error('Error getting projects:', error);
    return [];
  }
}

// Get a single project by ID
export async function getProject(id: string): Promise<Project | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docToProject(docSnap.id, docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
}

// Create a new project
export async function createProject(
  project: Omit<Project, 'id' | 'created_at'>
): Promise<Project | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...project,
      created_at: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...project,
      created_at: Timestamp.now(),
    } as unknown as Project;
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
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
