import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/services/projectService.server';
import { extractTasksFromDocument } from '@/lib/vertex-ai';
import { createTasks } from '@/lib/services/taskService.server';

export const runtime = 'nodejs';
export const maxDuration = 60; // Increase timeout to 60 seconds

/**
 * GET /api/projects?uid=xxx
 * Get all projects for a user
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'uid is required' },
        { status: 400 }
      );
    }

    const projects = await getProjects(uid);

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project, optionally with document-based task extraction
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, title, category, scale, documentText } = body;

    if (!uid || !title) {
      return NextResponse.json(
        { error: 'uid and title are required' },
        { status: 400 }
      );
    }

    // Extract summary and tasks from document if provided
    let summary = '';
    let extractedTasks: any[] = [];

    if (documentText && documentText.trim().length > 0) {
      try {
        const result = await extractTasksFromDocument(documentText);
        summary = result.summary;
        extractedTasks = result.tasks;
      } catch (error) {
        console.error('Error extracting tasks:', error);
        // Continue without task extraction
      }
    }

    // Create project
    const project = await createProject({
      uid,
      title: title.trim(),
      category: category || 'General',
      scale: scale || 5,
      summary,
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    // Create tasks if any were extracted
    if (extractedTasks.length > 0) {
      const tasksToCreate = extractedTasks.map((task) => ({
        ...task,
        project_id: project.id,
      }));

      console.log('[DEBUG] Creating tasks:', JSON.stringify(tasksToCreate, null, 2));
      const createResult = await createTasks(tasksToCreate);
      console.log('[DEBUG] Tasks created successfully:', createResult);
    }

    return NextResponse.json({
      success: true,
      project,
      tasksCreated: extractedTasks.length,
    });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
