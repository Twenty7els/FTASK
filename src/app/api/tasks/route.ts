import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tasks - Get all tasks for a family
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
      return NextResponse.json(
        { error: 'familyId is required' },
        { status: 400 }
      );
    }

    const tasks = await db.task.findMany({
      where: {
        familyId,
        status: { not: 'deleted' },
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      familyId,
      createdById,
      type,
      categoryId,
      title,
      description,
      quantity,
      unit,
      assignedTo,
    } = body;

    if (!familyId || !createdById || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await db.task.create({
      data: {
        familyId,
        createdById,
        type: type || 'shopping',
        categoryId,
        title,
        description,
        quantity: quantity ? parseFloat(quantity) : null,
        unit,
        assignedTo: assignedTo?.length > 0 ? {
          create: assignedTo.map((userId: string) => ({
            userId,
          })),
        } : undefined,
      },
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

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
