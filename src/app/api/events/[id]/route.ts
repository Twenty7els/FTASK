import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/events/[id] - Update event participation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, response } = body;

    if (!userId || !response) {
      return NextResponse.json(
        { error: 'Missing userId or response' },
        { status: 400 }
      );
    }

    // Upsert participant
    const participant = await db.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
      update: {
        response,
      },
      create: {
        eventId: id,
        userId,
        response,
      },
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
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error('Error updating event participation:', error);
    return NextResponse.json(
      { error: 'Failed to update participation' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
