'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Check, Trophy, Wallet, Target, Star, Users, User } from 'lucide-react'

interface User {
  id: string
  level: number
  money: number
  name: string
}

interface StudyTask {
  id: string
  title: string
  description?: string
  duration: number
  completed: boolean
}

interface WealthLevel {
  minMoney: number
  title: string
  description: string
  color: string
}

const wealthLevels: WealthLevel[] = [
  { minMoney: 0, title: '一无所有', description: '赤贫阶层，需要努力奋斗', color: 'bg-gray-500' },
  { minMoney: 10, title: '勉强糊口', description: '有点小钱，但生活拮据', color: 'bg-orange-500' },
  { minMoney: 50, title: '温饱有余', description: '基本生活无忧', color: 'bg-yellow-500' },
  { minMoney: 100, title: '小康生活', description: '可以偶尔享受一下', color: 'bg-green-500' },
  { minMoney: 500, title: '中产阶级', description: '生活品质不错', color: 'bg-blue-500' },
  { minMoney: 1000, title: '富裕阶层', description: '财务相对自由', color: 'bg-purple-500' },
  { minMoney: 5000, title: '小富翁', description: '可以买辆好车', color: 'bg-pink-500' },
  { minMoney: 10000, title: '大富翁', description: '可以投资房产', color: 'bg-red-500' },
  { minMoney: 50000, title: '富豪', description: '财务自由', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  { minMoney: 100000, title: '超级富豪', description: '可以买大房子', color: 'bg-gradient-to-r from-purple-400 to-pink-600' },
  { minMoney: 1000000, title: '人生赢家', description: '财富巅峰', color: 'bg-gradient-to-r from-red-400 to-yellow-400' }
]

export default function Home() {
  const [user, setUser] = useState<User>({ id: 'user-a', level: 1, money: 0, name: '学习者A' })
  const [currentUserId, setCurrentUserId] = useState('user-a')
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [newTask, setNewTask] = useState({ title: '', description: '', duration: 30 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const getCurrentWealthLevel = () => {
    for (let i = wealthLevels.length - 1; i >= 0; i--) {
      if (user.money >= wealthLevels[i].minMoney) {
        return wealthLevels[i]
      }
    }
    return wealthLevels[0]
  }

  const calculateNextLevelReward = () => {
    return user.level * 10
  }

  const calculateLevelProgress = () => {
    const currentLevelTasks = completedTasks.length
    const tasksNeededForNextLevel = user.level
    return Math.min((currentLevelTasks % tasksNeededForNextLevel) / tasksNeededForNextLevel * 100, 100)
  }

  const switchUser = (userId: string) => {
    setCurrentUserId(userId)
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          duration: newTask.duration,
          userId: currentUserId
        })
      })

      if (response.ok) {
        const task = await response.json()
        setTasks([...tasks, task])
        setNewTask({ title: '', description: '', duration: 30 })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('添加任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST'
      })

      if (response.ok) {
        const { updatedUser, updatedTask } = await response.json()
        setUser(updatedUser)
        setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      }
    } catch (error) {
      console.error('完成任务失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
    fetchTasks()
  }, [])

  useEffect(() => {
    fetchUserData()
    fetchTasks()
  }, [currentUserId])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?userId=${currentUserId}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?userId=${currentUserId}`)
      if (response.ok) {
        const tasksData = await response.json()
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('获取任务失败:', error)
    }
  }

  const currentWealthLevel = getCurrentWealthLevel()
  const nextLevelReward = calculateNextLevelReward()
  const completedTasks = tasks.filter(t => t.completed)
  const pendingTasks = tasks.filter(t => !t.completed)
  // API已经返回排序后的任务，但为了确保前端也正确排序，我们重新组织
  const sortedTasks = [...pendingTasks, ...completedTasks]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 头部信息 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">学习激励游戏平台</h1>
          <p className="text-gray-600 mb-4">通过学习任务赚取财富，实现人生逆袭！</p>
          
          {/* 用户切换按钮 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-5 w-5 text-gray-600" />
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <Button
                variant={currentUserId === 'user-a' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchUser('user-a')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                学习者A
              </Button>
              <Button
                variant={currentUserId === 'user-b' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => switchUser('user-b')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                学习者B
              </Button>
            </div>
          </div>
          
          {/* 当前用户信息 */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {user.name}
            </Badge>
          </div>
        </div>

        {/* 主要状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 等级卡片 */}
          <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前等级</CardTitle>
              <Trophy className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">Lv.{user.level}</div>
              <Progress value={calculateLevelProgress()} className="bg-white/20" />
              <p className="text-xs mt-2">完成 {completedTasks.length % user.level || user.level}/{user.level} 个任务升级</p>
              <p className="text-xs mt-1">升级奖励: ¥{nextLevelReward}</p>
            </CardContent>
          </Card>

          {/* 小金库卡片 */}
          <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">小金库</CardTitle>
              <Wallet className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">¥{user.money}</div>
              <Badge className={`${currentWealthLevel.color} text-white`}>
                {currentWealthLevel.title}
              </Badge>
              <p className="text-xs mt-2">{currentWealthLevel.description}</p>
            </CardContent>
          </Card>

          {/* 任务统计卡片 */}
          <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习任务</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{completedTasks.length}/{tasks.length}</div>
              <p className="text-xs">已完成/总任务</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs">待完成: {pendingTasks.length}</p>
                <p className="text-xs">完成率: {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">学习任务</TabsTrigger>
            <TabsTrigger value="wealth">财富阶层</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>我的学习任务</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      添加任务
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加新的学习任务</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">任务标题</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          placeholder="例如：阅读《深度学习》"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">任务描述</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          placeholder="详细描述你的学习内容..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">学习时间（分钟）</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newTask.duration}
                          onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 30 })}
                        />
                      </div>
                      <Button onClick={addTask} disabled={loading} className="w-full">
                        {loading ? '添加中...' : '确认添加'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sortedTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>还没有学习任务，点击上方按钮添加第一个任务吧！</p>
                    </div>
                  ) : (
                    sortedTasks.map((task) => (
                      <div key={task.id} className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                        task.completed 
                          ? 'bg-green-50 opacity-75' 
                          : 'hover:bg-gray-50'
                      }`}>
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-600' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-500' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">学习时间: {task.duration} 分钟</p>
                        </div>
                        {task.completed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            已完成
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => completeTask(task.id)}
                            disabled={loading}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Check className="h-4 w-4" />
                            完成
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wealth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>财富阶层系统</CardTitle>
                <p className="text-sm text-gray-600">通过完成学习任务赚取财富，提升你的社会阶层！</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {wealthLevels.map((level, index) => {
                    const isCurrentLevel = user.money >= level.minMoney && (index === wealthLevels.length - 1 || user.money < wealthLevels[index + 1].minMoney)
                    const isAchieved = user.money >= level.minMoney
                    
                    return (
                      <div
                        key={level.minMoney}
                        className={`p-4 border rounded-lg transition-all ${
                          isCurrentLevel ? 'border-blue-500 bg-blue-50' : 
                          isAchieved ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                            <div>
                              <h3 className="font-medium">{level.title}</h3>
                              <p className="text-sm text-gray-600">{level.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">¥{level.minMoney}</p>
                            {isCurrentLevel && (
                              <Badge className="bg-blue-500 text-white">当前阶层</Badge>
                            )}
                            {isAchieved && !isCurrentLevel && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">已达成</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}