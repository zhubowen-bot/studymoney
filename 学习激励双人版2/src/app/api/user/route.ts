import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-a'

    // 获取或创建用户
    let user = await db.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        rewards: true
      }
    })

    if (!user) {
      const userData = {
        id: userId,
        email: `${userId}@example.com`,
        name: userId === 'user-a' ? '学习者A' : '学习者B',
        level: 1,
        money: 0
      }

      user = await db.user.create({
        data: userData,
        include: {
          tasks: true,
          rewards: true
        }
      })
    }

    return NextResponse.json({
      id: user.id,
      level: user.level,
      money: user.money,
      name: user.name
    })
  } catch (error) {
    console.error('获取用户数据失败:', error)
    return NextResponse.json({ error: '获取用户数据失败' }, { status: 500 })
  }
}