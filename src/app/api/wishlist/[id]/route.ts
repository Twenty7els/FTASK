import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/wishlist/[id] - Book or unbook a wishlist item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, action } = body; // action: 'book' or 'unbook'

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    if (action === 'book') {
      // Check if already booked
      const existingBooking = await db.wishlistBooking.findFirst({
        where: {
          itemId: id,
          cancelledAt: null,
        },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: 'Item already booked' },
          { status: 400 }
        );
      }

      // Create booking
      const booking = await db.wishlistBooking.create({
        data: {
          itemId: id,
          userId,
        },
      });

      return NextResponse.json({ booking, booked: true });
    }

    if (action === 'unbook') {
      // Cancel booking
      const booking = await db.wishlistBooking.updateMany({
        where: {
          itemId: id,
          userId,
          cancelledAt: null,
        },
        data: {
          cancelledAt: new Date(),
        },
      });

      return NextResponse.json({ booking, booked: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error booking wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to book item' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist/[id] - Delete a wishlist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.wishlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
