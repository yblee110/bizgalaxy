/**
 * SERVER-ONLY Task Service
 * Uses Firebase Admin SDK exclusively
 * This file should only be imported in API routes (server-side)
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getServerDb } from '@/lib/firebase-server';
import { Task, TaskStatus } from '@/types';

const COLLECTION_NAME = 'tasks';

// Convert Firestore document to Task
const docToTask = (id: string, data: any): Task => {
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
    created_at: data.created_at || { seconds: 0, nanoseconds: 0 },
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
    const db = getServerDb();
    const snapshot = await db.collection(COLLECTION_NAME).where('project_id', '==', projectId).get();

    const tasks = snapshot.docs.map((doc) => docToTask(doc.id, doc.data()));

    // Sort by order ascending
    return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Get a single task by ID
export async function getTask(id: string): Promise<Task | null> {
  try {
    const db = getServerDb();
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();

    if (doc.exists) {
      return docToTask(id, doc.data());
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
    const db = getServerDb();
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...task,
      created_at: FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...task,
      created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
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
    const db = getServerDb();
    const batch = db.batch();

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
        continue;
      }

      const docRef = db.collection(COLLECTION_NAME).doc();
      batch.set(docRef, {
        ...sanitizedTask,
        created_at: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
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
    const db = getServerDb();
    await db.collection(COLLECTION_NAME).doc(id).update(updates);
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
    const db = getServerDb();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Delete all tasks for a project
export async function deleteProjectTasks(projectId: string): Promise<boolean> {
  try {
    const db = getServerDb();
    const snapshot = await db.collection(COLLECTION_NAME).where('project_id', '==', projectId).get();
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
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
    const db = getServerDb();
    const batch = db.batch();

    updates.forEach(({ id, order }) => {
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      batch.update(docRef, { order });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return false;
  }
}
