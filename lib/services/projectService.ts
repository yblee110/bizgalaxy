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
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Project } from '@/types';

const COLLECTION_NAME = 'projects';

// Get db instance
const getDbInstance = () => getDb();

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
const docToProject = (id: string, docSnapshot: QueryDocumentSnapshot | DocumentSnapshot): Project => {
  const data = docSnapshot.data() as FirestoreProjectData | undefined;
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
    const q = query(
      collection(getDbInstance(), COLLECTION_NAME),
      where('uid', '==', uid)
    );

    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map((doc) => docToProject(doc.id, doc));

    // Sort by created_at descending (client-side)
    return projects.sort((a, b) => {
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
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
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
  projectData: Omit<Project, 'id' | 'created_at'>
): Promise<Project | null> {
  try {
    const docRef = await addDoc(collection(getDbInstance(), COLLECTION_NAME), {
      ...projectData,
      created_at: serverTimestamp(),
    });

    const result: Project = {
      id: docRef.id,
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
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
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
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
