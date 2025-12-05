import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'user-a'

    const tasks = await db.studyTask.findMany({
      where: {
        userId: userId
      },
      orderBy: [
        { completed: 'asc' }, // 未完成的在前
        { createdAt: 'desc' } // 最新的在前
      ]
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('获取任务失败:', error)
    return NextResponse.json({ error: '获取任务失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, duration, userId } = await request.json()

    if (!title || !duration) {
      return NextResponse.json({ error: '任务标题和学习时间不能为空' }, { status: 400 })
    }

    const targetUserId = userId || 'user-a'

    // 确保用户存在
    let user = await db.user.findUnique({
      where: { id: targetUserId }
    })
    
    if (!user) {
      user = await db.user.create({
        data: {
          id: targetUserId,
          email: `${targetUserId}@example.com`,
          name: targetUserId === 'user-a' ? '学习者A' : '学习者B',
          level: 1,
          money: 0
        }
      })
    }

    const task = await db.studyTask.create({
      data: {
        title,
        description: description || '',
        duration: parseInt(duration),
        userId: targetUserId
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('创建任务失败:', error)
    return NextResponse.json({ error: '创建任务失败' }, { status: 500 })
  }
}