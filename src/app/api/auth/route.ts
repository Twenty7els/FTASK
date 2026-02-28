import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/auth - Authenticate or create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, username, firstName, lastName, photoUrl } = body;

    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
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
          username: username || null,
          firstName: firstName || 'User',
          lastName: lastName || null,
          avatarUrl: photoUrl || null,
        },
      });
    } else {
      // Update user info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          username: username || user.username,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          avatarUrl: photoUrl || user.avatarUrl,
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
