'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { X, ShoppingBag, Home, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  type: z.enum(['shopping', 'home', 'other']),
  quantity: z.number().optional(),
  unit: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<boolean>
}

const taskTypes = [
  { id: 'shopping', label: 'Покупки', icon: ShoppingBag },
  { id: 'home', label: 'Дом', icon: Home },
  { id: 'other', label: 'Другое', icon: MoreHorizontal },
] as const

export function TaskForm({ open, onClose, onSubmit }: TaskFormProps) {
  const [selectedType, setSelectedType] = useState<'shopping' | 'home' | 'other'>('shopping')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'shopping',
    },
  })

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)
    const success = await onSubmit(data)
    setIsSubmitting(false)
    if (success) {
      reset()
      onClose()
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          {/* Task type selector */}
          <div className="flex gap-2">
            {taskTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id)
                    setValue('type', type.id)
                  }}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                    selectedType === type.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    selectedType === type.id ? 'text-emerald-600' : 'text-gray-400'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    selectedType === type.id ? 'text-emerald-600' : 'text-gray-500'
                  )}>
                    {type.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Что нужно сделать?"
              className="w-full"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Дополнительная информация..."
              rows={2}
              className="w-full"
            />
          </div>

          {/* Quantity and Unit */}
          {selectedType === 'shopping' && (
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="unit">Единица</Label>
                <Input
                  id="unit"
                  {...register('unit')}
                  placeholder="шт, кг, л..."
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
