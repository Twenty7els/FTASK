'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'lucide-react'
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

const wishlistSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  link: z.string().url('Неверный формат URL').optional().or(z.literal('')),
  price: z.number().min(0).optional(),
  imageUrl: z.string().url('Неверный формат URL').optional().or(z.literal('')),
})

type WishlistFormData = z.infer<typeof wishlistSchema>

interface WishlistFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: WishlistFormData) => Promise<boolean>
}

export function WishlistForm({ open, onClose, onSubmit }: WishlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
  })

  const handleFormSubmit = async (data: WishlistFormData) => {
    setIsSubmitting(true)
    const success = await onSubmit({
      ...data,
      link: data.link || undefined,
      imageUrl: data.imageUrl || undefined,
    })
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
          <DialogTitle>Новое желание</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Что вы хотите?"
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
              placeholder="Подробнее о желании..."
              rows={2}
              className="w-full"
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Ссылка</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="link"
                {...register('link')}
                placeholder="https://..."
                className="pl-10"
              />
            </div>
            {errors.link && (
              <p className="text-sm text-red-500">{errors.link.message}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Примерная цена (₽)</Label>
            <Input
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              placeholder="0"
              className="w-full"
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Ссылка на изображение</Label>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://..."
              className="w-full"
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

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
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              {isSubmitting ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
