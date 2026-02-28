import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wishlist - Get wishlist items
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

    const items = await db.wishlistItem.findMany({
      where: { userId },
      include: {
        bookings: {
          where: { cancelledAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Create a wishlist item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, link, price } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const item = await db.wishlistItem.create({
      data: {
        userId,
        title,
        description,
        link,
        price: price ? parseFloat(price) : null,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating wishlist item:', error);
    return NextResponse.json(
      { error: 'Failed to create wishlist item' },
      { status: 500 }
    );
  }
}
