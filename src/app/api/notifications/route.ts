import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notifications?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Mark as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, markAllRead, userId } = body

    if (markAllRead && userId) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      })
      return NextResponse.json({ success: true })
    }

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { read: true }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
