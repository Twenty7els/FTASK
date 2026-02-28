'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskFormData, ApiResponse } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  createTask: (data: TaskFormData) => Promise<boolean>
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>
  completeTask: (id: string) => Promise<boolean>
  archiveTask: (id: string) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  refreshTasks: () => Promise<void>
  progress: number
}

export function useTasks(familyId: string | null): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    if (!familyId) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/tasks?familyId=${familyId}`)
      const data: ApiResponse<Task[]> = await response.json()
      
      if (data.success && data.data) {
        setTasks(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch tasks')
      }
    } catch {
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (taskData: TaskFormData): Promise<boolean> => {
    if (!familyId) return false

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, familyId }),
      })
      const data: ApiResponse<Task> = await response.json()
      
      if (data.success && data.data) {
        setTasks(prev => [...prev, data.data!])
        toast({ title: 'Задача создана', description: 'Новая задача добавлена' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось создать задачу', variant: 'destructive' })
      return false
    }
  }, [familyId, toast])

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      const data: ApiResponse<Task> = await response.json()
      
      if (data.success && data.data) {
        setTasks(prev => prev.map(t => t.id === id ? data.data! : t))
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось обновить задачу', variant: 'destructive' })
      return false
    }
  }, [toast])

  const completeTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}/complete`, {
        method: 'POST',
      })
      const data: ApiResponse<Task> = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== id))
        toast({ title: 'Задача выполнена', description: 'Отличная работа!' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить задачу', variant: 'destructive' })
      return false
    }
  }, [toast])

  const archiveTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}/archive`, {
        method: 'POST',
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== id))
        toast({ title: 'Задача в архиве' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось архивировать задачу', variant: 'destructive' })
      return false
    }
  }, [toast])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setTasks(prev => prev.filter(t => t.id !== id))
        toast({ title: 'Задача удалена' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить задачу', variant: 'destructive' })
      return false
    }
  }, [toast])

  // Calculate progress (completed today)
  const progress = 0 // Will be calculated based on archived tasks for today

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    completeTask,
    archiveTask,
    deleteTask,
    refreshTasks: fetchTasks,
    progress,
  }
}
