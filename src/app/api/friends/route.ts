import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/friends?userId=xxx
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

    // Get friendships
    const friendshipsAsUser = await db.friendship.findMany({
      where: { userId },
      include: { friend: true }
    })

    const friendshipsAsFriend = await db.friendship.findMany({
      where: { friendId: userId },
      include: { user: true }
    })

    const friends = [
      ...friendshipsAsUser.map(f => f.friend),
      ...friendshipsAsFriend.map(f => f.user)
    ]

    // Get pending friend requests
    const sentRequests = await db.friendRequest.findMany({
      where: { senderId: userId, status: 'pending' },
      include: { receiver: true }
    })

    const receivedRequests = await db.friendRequest.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: { sender: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        friends,
        sentRequests,
        receivedRequests
      }
    })
  } catch (error) {
    console.error('Fetch friends error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch friends' },
      { status: 500 }
    )
  }
}

// POST /api/friends - Send friend request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverTelegramId } = body

    if (!senderId || !receiverTelegramId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find receiver by telegram ID
    const receiver = await db.user.findUnique({
      where: { telegramId: String(receiverTelegramId) }
    })

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (receiver.id === senderId) {
      return NextResponse.json(
        { success: false, error: 'Cannot add yourself as friend' },
        { status: 400 }
      )
    }

    // Check if already friends
    const existingFriendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiver.id },
          { userId: receiver.id, friendId: senderId }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json(
        { success: false, error: 'Already friends' },
        { status: 400 }
      )
    }

    // Check for existing request
    const existingRequest = await db.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId: receiver.id
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Request already sent' },
        { status: 400 }
      )
    }

    const friendRequest = await db.friendRequest.create({
      data: {
        senderId,
        receiverId: receiver.id,
        status: 'pending'
      },
      include: { receiver: true }
    })

    return NextResponse.json({ success: true, data: friendRequest })
  } catch (error) {
    console.error('Send friend request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send friend request' },
      { status: 500 }
    )
  }
}
