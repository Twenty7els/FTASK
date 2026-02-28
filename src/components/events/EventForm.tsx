'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const eventSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.date(),
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => Promise<boolean>
}

export function EventForm({ open, onClose, onSubmit }: EventFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState('12:00')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventDate: new Date(),
    },
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      const [hours, minutes] = selectedTime.split(':')
      date.setHours(parseInt(hours), parseInt(minutes))
      setValue('eventDate', date)
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    const [hours, minutes] = time.split(':')
    const newDate = new Date(selectedDate)
    newDate.setHours(parseInt(hours), parseInt(minutes))
    setValue('eventDate', newDate)
  }

  const handleFormSubmit = async (data: EventFormData) => {
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
          <DialogTitle>Новое мероприятие</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Название мероприятия"
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
              placeholder="О чём мероприятие?"
              rows={2}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Место</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Где пройдёт мероприятие?"
              className="w-full"
            />
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <Label>Дата</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Время</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
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
