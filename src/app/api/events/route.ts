import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/events - Get all events for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get events where user is creator or participant
    const events = await db.event.findMany({
      where: {
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } },
          { invitations: { some: { userId } } },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        participants: {
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
        invitations: {
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
      orderBy: {
        eventDate: 'asc',
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      createdById,
      title,
      description,
      location,
      eventDate,
      invitedUsers,
    } = body;

    if (!createdById || !title || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await db.event.create({
      data: {
        createdById,
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        participants: {
          create: {
            userId: createdById,
            response: 'going',
          },
        },
        invitations: invitedUsers?.length > 0 ? {
          create: invitedUsers.map((userId: string) => ({ userId })),
        } : undefined,
      },
      include: {
        participants: {
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

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
