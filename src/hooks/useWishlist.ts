'use client'

import { useState, useEffect, useCallback } from 'react'
import type { WishlistItem, WishlistFormData, ApiResponse } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface UseWishlistReturn {
  items: WishlistItem[]
  loading: boolean
  error: string | null
  createItem: (data: WishlistFormData) => Promise<boolean>
  updateItem: (id: string, data: Partial<WishlistItem>) => Promise<boolean>
  deleteItem: (id: string) => Promise<boolean>
  bookItem: (id: string) => Promise<boolean>
  unbookItem: (id: string) => Promise<boolean>
  refreshItems: () => Promise<void>
}

export function useWishlist(userId: string | null, viewMode: 'own' | 'friends' = 'own'): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const url = viewMode === 'own' 
        ? `/api/wishlist?userId=${userId}` 
        : `/api/wishlist/friends?userId=${userId}`
      const response = await fetch(url)
      const data: ApiResponse<WishlistItem[]> = await response.json()
      
      if (data.success && data.data) {
        setItems(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch wishlist')
      }
    } catch {
      setError('Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }, [userId, viewMode])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = useCallback(async (itemData: WishlistFormData): Promise<boolean> => {
    if (!userId) return false

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemData, userId }),
      })
      const data: ApiResponse<WishlistItem> = await response.json()
      
      if (data.success && data.data) {
        setItems(prev => [...prev, data.data!])
        toast({ title: 'Желание добавлено', description: 'Новое желание в вашем списке' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось добавить желание', variant: 'destructive' })
      return false
    }
  }, [userId, toast])

  const updateItem = useCallback(async (id: string, itemData: Partial<WishlistItem>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })
      const data: ApiResponse<WishlistItem> = await response.json()
      
      if (data.success && data.data) {
        setItems(prev => prev.map(i => i.id === id ? data.data! : i))
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось обновить желание', variant: 'destructive' })
      return false
    }
  }, [toast])

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setItems(prev => prev.filter(i => i.id !== id))
        toast({ title: 'Желание удалено' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить желание', variant: 'destructive' })
      return false
    }
  }, [toast])

  const bookItem = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false

    try {
      const response = await fetch(`/api/wishlist/${id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setItems(prev => prev.map(i => 
          i.id === id ? { ...i, isBooked: true } : i
        ))
        toast({ title: 'Забронировано', description: 'Желание забронировано анонимно' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось забронировать', variant: 'destructive' })
      return false
    }
  }, [userId, toast])

  const unbookItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/wishlist/${id}/unbook`, {
        method: 'POST',
      })
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setItems(prev => prev.map(i => 
          i.id === id ? { ...i, isBooked: false } : i
        ))
        toast({ title: 'Бронь снята' })
        return true
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' })
        return false
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось снять бронь', variant: 'destructive' })
      return false
    }
  }, [toast])

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    bookItem,
    unbookItem,
    refreshItems: fetchItems,
  }
}
