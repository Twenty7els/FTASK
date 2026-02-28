'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Event, EventFormData, ApiResponse } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface UseEventsReturn {
  events: Event[]
  loading: boolean
  error: string | null
  createEvent: (data: EventFormData) => Promise<boolean>
  updateEvent: (id: string, data: Partial<Event>) => Promise<boolean>
  deleteEvent: (id: string) => Promise<boolean>
  respondToEvent: (eventId: string, response: 'going' | 'not_going') => Promise<boolean>
  refreshEvents: () => Promise<void>
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      const data: ApiResponse<Event[]> = await response.json()
      
      if (data.success && data.data) {
        setTasks(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch events')
      }
    } catch {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fix: renamed setTasks to setEvents
  const fetchEventsData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      const data: ApiResponse<Event[]> = await response.json()
      
      if (data.success && data.data) {
        setEvents(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch events')
      }
    } catch {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEventsData()
  }, [fetchEventsData])

  const createEvent = useCallback(async (eventData: EventFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      const data: ApiResponse<Event> = await response.json()
      
      if (data.success && data.data) {
        setEvents(prev => [...prev, data.data!])
        toast({ title: 'Мероприятие создано', description: 'Приглашения отправлены' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось создать мероприятие', variant: 'destructive' })
      return false
    }
  }, [toast])

  const updateEvent = useCallback(async (id: string, eventData: Partial<Event>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      const data: ApiResponse<Event> = await response.json()
      
      if (data.success && data.data) {
        setEvents(prev => prev.map(e => e.id === id ? data.data! : e))
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось обновить мероприятие', variant: 'destructive' })
      return false
    }
  }, [toast])

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.filter(e => e.id !== id))
        toast({ title: 'Мероприятие удалено' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить мероприятие', variant: 'destructive' })
      return false
    }
  }, [toast])

  const respondToEvent = useCallback(async (eventId: string, responseStatus: 'going' | 'not_going'): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseStatus }),
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setEvents(prev => prev.map(e => {
          if (e.id === eventId && e.participants) {
            return {
              ...e,
              participants: e.participants.map(p => 
                p.response = responseStatus
              )
            }
          }
          return e
        }))
        toast({ title: responseStatus === 'going' ? 'Вы идёте!' : 'Вы не пойдёте' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось ответить', variant: 'destructive' })
      return false
    }
  }, [toast])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    respondToEvent,
    refreshEvents: fetchEventsData,
  }
}
