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
  writeBatch,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { getServerDb } from '@/lib/firebase-server';
import { Task, TaskStatus } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'tasks';
const isServer = typeof window === 'undefined';

// Unified database functions that work with both SDKs
const dbGet = () => isServer ? getServerDb() : getDb();

const dbServerTimestamp = () => {
  if (isServer) {
    return FieldValue.serverTimestamp();
  }
  return serverTimestamp();
};

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
    return { docs: snap.docs.map((d: any) => ({ id: d.id, data: () => d.data(), ref: d })) };
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

const dbWriteBatch = () => {
  if (isServer) {
    return (dbGet() as any).batch();
  }
  return writeBatch(dbGet() as any);
};

// Firestore document data type
interface FirestoreTaskData {
  project_id: string;
  status: TaskStatus;
  content: string;
  desc: string;
  is_ai_generated: boolean;
  order: number;
  created_at: Timestamp;
  priority?: string;
  due_date?: Timestamp;
  dependencies?: string[];
  assignee?: string;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
}

// Convert Firestore document to Task
const docToTask = (id: string, docSnapshot: any): Task => {
  const data = docSnapshot.data ? docSnapshot.data() : docSnapshot as any;
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id,
    project_id: data.project_id || '',
    status: data.status || 'TODO',
    content: data.content || '',
    desc: data.desc || '',
    is_ai_generated: data.is_ai_generated || false,
    order: data.order ?? 0,
    created_at: data.created_at || Timestamp.now(),
    priority: data.priority as any,
    due_date: data.due_date,
    dependencies: data.dependencies,
    assignee: data.assignee,
    tags: data.tags,
    estimated_hours: data.estimated_hours,
    actual_hours: data.actual_hours,
  };
};

// Get all tasks for a project
export async function getTasks(projectId: string): Promise<Task[]> {
  try {
    const coll = dbCollection(COLLECTION_NAME);
    let queryRef: any;

    if (isServer) {
      queryRef = coll.where('project_id', '==', projectId);
    } else {
      queryRef = query(coll, where('project_id', '==', projectId));
    }

    const querySnapshot = await dbGetDocs(queryRef);
    const tasks = querySnapshot.docs.map((doc: any) => docToTask(doc.id, doc));

    // Sort by order ascending (client-side)
    return tasks.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Get a single task by ID
export async function getTask(id: string): Promise<Task | null> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    const docSnap = await dbGetDoc(docRef);

    if ((docSnap as any).exists) {
      return docToTask(id, docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

// Create a new task
export async function createTask(
  task: Omit<Task, 'id' | 'created_at'>
): Promise<Task | null> {
  try {
    const collRef = dbCollection(COLLECTION_NAME);
    const docRef = await dbAddDoc(collRef, {
      ...task,
      created_at: dbServerTimestamp(),
    });

    return {
      id: (docRef as any).id,
      ...task,
      created_at: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

// Create multiple tasks
export async function createTasks(
  tasks: Omit<Task, 'id' | 'created_at'>[]
): Promise<boolean> {
  try {
    // Use individual writes instead of batch for better error handling
    for (const task of tasks) {
      // Sanitize task object to remove undefined values
      const sanitizedTask = Object.entries(task).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Ensure required fields have defaults
      if (!sanitizedTask.desc) sanitizedTask.desc = '';
      if (!sanitizedTask.content) sanitizedTask.content = '';
      if (!sanitizedTask.project_id) {
        console.error('[ERROR] Task missing project_id:', sanitizedTask);
        continue; // Skip this task
      }

      await dbAddDoc(dbCollection(COLLECTION_NAME), {
        ...sanitizedTask,
        created_at: dbServerTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating tasks:', error);
    console.error('[ERROR] Tasks data:', JSON.stringify(tasks, null, 2));
    return false;
  }
}

// Update a task
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'created_at'>>
): Promise<boolean> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    await dbUpdateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
}

// Update task status
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<boolean> {
  return updateTask(id, { status });
}

// Delete a task
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const docRef = dbDoc(COLLECTION_NAME, id);
    await dbDeleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Delete all tasks for a project
export async function deleteProjectTasks(projectId: string): Promise<boolean> {
  try {
    const coll = dbCollection(COLLECTION_NAME);
    let queryRef: any;

    if (isServer) {
      queryRef = coll.where('project_id', '==', projectId);
    } else {
      queryRef = query(coll, where('project_id', '==', projectId));
    }

    const querySnapshot = await dbGetDocs(queryRef);
    const batch = dbWriteBatch();

    querySnapshot.docs.forEach((docSnapshot: any) => {
      batch.delete(docSnapshot.ref || docSnapshot);
    });

    await (batch as any).commit();
    return true;
  } catch (error) {
    console.error('Error deleting project tasks:', error);
    return false;
  }
}

// Reorder tasks (update order field for multiple tasks)
export async function reorderTasks(
  updates: Array<{ id: string; order: number }>
): Promise<boolean> {
  try {
    const batch = dbWriteBatch();

    updates.forEach(({ id, order }) => {
      const docRef = dbDoc(COLLECTION_NAME, id);
      batch.update(docRef, { order });
    });

    await (batch as any).commit();
    return true;
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return false;
  }
}
