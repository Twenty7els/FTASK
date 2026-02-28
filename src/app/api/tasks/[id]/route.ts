import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tasks/[id] - Get a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        category: true,
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, completedAt, completedBy } = body;

    // If marking as archived, create archive record
    if (status === 'archived' && completedBy) {
      const task = await db.task.update({
        where: { id },
        data: {
          status: 'archived',
        },
      });

      // Create archive record
      await db.archive.create({
        data: {
          taskId: id,
          completedBy,
          completedAt: completedAt || new Date(),
        },
      });

      return NextResponse.json({ task });
    }

    const task = await db.task.update({
      where: { id },
      data: body,
      include: {
        category: true,
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete by setting status to 'deleted'
    const task = await db.task.update({
      where: { id },
      data: { status: 'deleted' },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
