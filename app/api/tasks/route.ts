import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, createTasks, updateTaskStatus, deleteTask } from '@/lib/services/taskService';

export const runtime = 'nodejs';

/**
 * GET /api/tasks?projectId=xxx
 * Get all tasks for a project
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const tasks = await getTasks(projectId);

    return NextResponse.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task or multiple tasks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle batch creation
    if (Array.isArray(body.tasks)) {
      const success = await createTasks(body.tasks);
      return NextResponse.json({
        success,
        count: body.tasks.length,
      });
    }

    // Single task creation
    const { project_id, content, desc, status, is_ai_generated, order } = body;

    if (!project_id || !content) {
      return NextResponse.json(
        { error: 'project_id and content are required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      project_id,
      content,
      desc: desc || '',
      status: status || 'TODO',
      is_ai_generated: is_ai_generated || false,
      order: order || 0,
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks
 * Bulk update tasks (for reordering)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      );
    }

    const success = await Promise.all(
      updates.map(({ id, status, order }: { id: string; status?: string; order?: number }) =>
        updateTaskStatus(id, status as any)
      )
    );

    return NextResponse.json({
      success: success.every((s) => s),
    });
  } catch (error) {
    console.error('Error in PATCH /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update tasks' },
      { status: 500 }
    );
  }
}
