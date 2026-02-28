import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth - Authenticate or create user from Telegram data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl } = body;

    if (!telegramId || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { telegramId: String(telegramId) },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          telegramId: String(telegramId),
          username,
          firstName,
          lastName,
          avatarUrl: photoUrl,
        },
      });
    } else {
      // Update user info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          username,
          firstName,
          lastName,
          avatarUrl: photoUrl,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
