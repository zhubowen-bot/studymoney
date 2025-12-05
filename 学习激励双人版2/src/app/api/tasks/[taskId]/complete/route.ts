import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params

    // 获取任务
    const task = await db.studyTask.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    if (task.completed) {
      return NextResponse.json({ error: '任务已完成' }, { status: 400 })
    }

    // 获取用户
    const user = await db.user.findUnique({
      where: { id: task.userId }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 更新任务状态
    const updatedTask = await db.studyTask.update({
      where: { id: taskId },
      data: { completed: true }
    })

    // 计算升级逻辑
    let newLevel = user.level
    let newMoney = user.money
    let rewardAmount = 0

    // 获取用户已完成的任务数
    const completedTasksCount = await db.studyTask.count({
      where: {
        userId: user.id,
        completed: true
      }
    })

    // 检查是否可以升级（每完成level个任务升一级）
    if (completedTasksCount > 0 && completedTasksCount % user.level === 0) {
      newLevel = user.level + 1
      rewardAmount = user.level * 10 // 升级奖励 = 当前等级 * 10
      newMoney = user.money + rewardAmount

      // 记录奖励
      await db.reward.create({
        data: {
          fromLevel: user.level,
          toLevel: newLevel,
          amount: rewardAmount,
          userId: user.id
        }
      })
    }

    // 更新用户信息
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        level: newLevel,
        money: newMoney
      }
    })

    return NextResponse.json({
      updatedUser: {
        id: updatedUser.id,
        level: updatedUser.level,
        money: updatedUser.money
      },
      updatedTask,
      reward: rewardAmount > 0 ? {
        amount: rewardAmount,
        fromLevel: user.level,
        toLevel: newLevel
      } : null
    })
  } catch (error) {
    console.error('完成任务失败:', error)
    return NextResponse.json({ error: '完成任务失败' }, { status: 500 })
  }
}