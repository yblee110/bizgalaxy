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
  writeBatch,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Task, TaskStatus } from '@/types';

const COLLECTION_NAME = 'tasks';

// Get db instance
const getDbInstance = () => getDb();

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
const docToTask = (id: string, docSnapshot: QueryDocumentSnapshot | DocumentSnapshot): Task => {
  const data = docSnapshot.data() as FirestoreTaskData | undefined;
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
    const q = query(
      collection(getDbInstance(), COLLECTION_NAME),
      where('project_id', '==', projectId)
    );

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => docToTask(doc.id, doc));

    // Sort by order ascending (client-side)
    return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Get a single task by ID
export async function getTask(id: string): Promise<Task | null> {
  try {
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docToTask(docSnap.id, docSnap);
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
    const docRef = await addDoc(collection(getDbInstance(), COLLECTION_NAME), {
      ...task,
      created_at: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...task,
      created_at: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

// Create multiple tasks in batch
export async function createTasks(
  tasks: Omit<Task, 'id' | 'created_at'>[]
): Promise<boolean> {
  try {
    const db = getDbInstance();
    const batch = writeBatch(db);
    const tasksRef = collection(db, COLLECTION_NAME);

    tasks.forEach((task) => {
      const newDocRef = doc(tasksRef);
      batch.set(newDocRef, {
        ...task,
        created_at: serverTimestamp(),
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error creating tasks in batch:', error);
    return false;
  }
}

// Update a task
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'created_at'>>
): Promise<boolean> {
  try {
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
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
    const docRef = doc(getDbInstance(), COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Delete all tasks for a project
export async function deleteProjectTasks(projectId: string): Promise<boolean> {
  try {
    const db = getDbInstance();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('project_id', '==', projectId)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((docSnapshot) => {
      batch.delete(docSnapshot.ref);
    });

    await batch.commit();
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
    const db = getDbInstance();
    const batch = writeBatch(db);

    updates.forEach(({ id, order }) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      batch.update(docRef, { order });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return false;
  }
}
