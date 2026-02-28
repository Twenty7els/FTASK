import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/family?userId=xxx
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

    const memberships = await db.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: { user: true }
            }
          }
        }
      }
    })

    const families = memberships.map(m => m.family)

    return NextResponse.json({ families })
  } catch (error) {
    console.error('Fetch family error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch family' },
      { status: 500 }
    )
  }
}

// POST /api/family - Create family
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, createdById, memberIds } = body

    if (!name || !createdById) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const family = await db.familyGroup.create({
      data: {
        name,
        createdById,
        members: {
          create: [
            { userId: createdById, role: 'admin' },
            ...(memberIds || []).map((userId: string) => ({
              userId,
              role: 'member' as const
            }))
          ]
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: family })
  } catch (error) {
    console.error('Create family error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create family' },
      { status: 500 }
    )
  }
}
