import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramId, firstName, lastName, username, photoUrl } = body

    if (!telegramId || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { telegramId: String(telegramId) },
      include: {
        familyMemberships: {
          include: {
            family: {
              include: {
                members: {
                  include: { user: true }
                }
              }
            }
          }
        },
        friendshipsAsUser: {
          include: { friend: true }
        },
        friendshipsAsFriend: {
          include: { user: true }
        }
      }
    })

    if (!user) {
      user = await db.user.create({
        data: {
          telegramId: String(telegramId),
          firstName,
          lastName: lastName || null,
          username: username || null,
          avatarUrl: photoUrl || null,
        },
        include: {
          familyMemberships: {
            include: {
              family: {
                include: {
                  members: {
                    include: { user: true }
                  }
                }
              }
            }
          },
          friendshipsAsUser: {
            include: { friend: true }
          },
          friendshipsAsFriend: {
            include: { user: true }
          }
        }
      })
    } else {
      // Update user info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName: lastName || null,
          username: username || null,
          avatarUrl: photoUrl || null,
        },
        include: {
          familyMemberships: {
            include: {
              family: {
                include: {
                  members: {
                    include: { user: true }
                  }
                }
              }
            }
          },
          friendshipsAsUser: {
            include: { friend: true }
          },
          friendshipsAsFriend: {
            include: { user: true }
          }
        }
      })
    }

    // Get all friends
    const friends = [
      ...user.friendshipsAsUser.map(f => f.friend),
      ...user.friendshipsAsFriend.map(f => f.user)
    ]

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        friends,
        friendshipsAsUser: undefined,
        friendshipsAsFriend: undefined
      }
    })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
