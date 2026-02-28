'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/components/telegram/TelegramProvider';

const eventSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.date({
    required_error: 'Дата обязательна',
  }),
  eventTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  invitedUsers: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: EventFormData) => void;
  friends?: User[];
}

export function EventFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  friends = []
}: EventFormDialogProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const { impactOccurred, notificationOccurred } = useHaptic();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      eventTime: '18:00',
      invitedUsers: [],
    },
  });

  const handleSubmit = (data: EventFormData) => {
    impactOccurred('medium');
    notificationOccurred('success');
    
    // Combine date and time
    const eventDate = new Date(data.eventDate);
    const [hours, minutes] = data.eventTime.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);
    
    onSubmit?.({ ...data, eventDate });
    
    // Reset and close
    form.reset();
    setSelectedFriends([]);
    onOpenChange(false);
  };

  const toggleFriend = (friendId: string) => {
    impactOccurred('light');
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Новое мероприятие</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Например: День рождения" 
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Добавьте описание..."
                      className="rounded-xl min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Место</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        {...field} 
                        placeholder="Адрес или название места" 
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full rounded-xl justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "d MMM", { locale: ru }) : "Выберите"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          {...field} 
                          type="time"
                          className="rounded-xl pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invite friends */}
            {friends.length > 0 && (
              <div>
                <FormLabel className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  Пригласить друзей
                </FormLabel>
                <div className="flex flex-wrap gap-2">
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.includes(friend.id);
                    
                    return (
                      <motion.button
                        key={friend.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleFriend(friend.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all",
                          isSelected 
                            ? "border-violet-500 bg-violet-50" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={friend.avatarUrl || undefined} />
                          <AvatarFallback className="text-[8px] bg-violet-100 text-violet-700">
                            {getInitials(friend.firstName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                          "text-sm",
                          isSelected ? "text-violet-700 font-medium" : "text-gray-600"
                        )}>
                          {friend.firstName}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
                {selectedFriends.length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Если никого не выбрать, мероприятие увидят все ваши друзья
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full rounded-xl h-12 bg-violet-500 hover:bg-violet-600"
            >
              Создать мероприятие
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
