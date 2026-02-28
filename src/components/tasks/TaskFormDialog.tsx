'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Home, 
  MoreHorizontal, 
  Package,
  Milk,
  Beef,
  Apple,
  CupSoda,
  Pill,
  SprayCan,
  Wrench
} from 'lucide-react';
import { TaskType, DEFAULT_CATEGORIES } from '@/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  type: z.enum(['shopping', 'home', 'other']),
  categoryId: z.string().optional(),
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  quantity: z.number().min(0.1).optional(),
  unit: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId?: string;
  onSubmit?: (data: TaskFormData) => void;
}

const taskTypes: { id: TaskType; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'shopping', label: 'Покупки', icon: ShoppingBag },
  { id: 'home', label: 'Домашнее', icon: Home },
  { id: 'other', label: 'Другое', icon: MoreHorizontal },
];

const units = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'бут', 'бан'];

const categoryIcons: Record<string, typeof ShoppingBag> = {
  'Молочное': Milk,
  'Мясо/Рыба': Beef,
  'Бакалея': Package,
  'Овощи/Фрукты': Apple,
  'Напитки': CupSoda,
  'Маркетплейсы': ShoppingBag,
  'Аптека': Pill,
  'Бытовая химия': SprayCan,
  'Уборка': Home,
  'Ремонт': Wrench,
  'Другое': MoreHorizontal,
};

export function TaskFormDialog({ 
  open, 
  onOpenChange, 
  familyId,
  onSubmit 
}: TaskFormDialogProps) {
  const [selectedType, setSelectedType] = useState<TaskType>('shopping');
  const { impactOccurred, notificationOccurred } = useHaptic();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'shopping',
      title: '',
      description: '',
      quantity: undefined,
      unit: 'шт',
    },
  });

  const watchType = form.watch('type');

  const handleTypeSelect = (type: TaskType) => {
    impactOccurred('light');
    setSelectedType(type);
    form.setValue('type', type);
    if (type !== 'shopping') {
      form.setValue('categoryId', undefined);
      form.setValue('quantity', undefined);
      form.setValue('unit', undefined);
    }
  };

  const handleSubmit = (data: TaskFormData) => {
    impactOccurred('medium');
    notificationOccurred('success');
    
    // Call API or callback
    onSubmit?.(data);
    
    // Reset and close
    form.reset();
    onOpenChange(false);
  };

  const shoppingCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'shopping');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Новая задача</DialogTitle>
        </DialogHeader>

        {/* Task type selector */}
        <div className="flex gap-2 mb-4">
          {taskTypes.map((type) => {
            const Icon = type.icon;
            const isActive = watchType === type.id;
            
            return (
              <motion.button
                key={type.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTypeSelect(type.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all",
                  isActive 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{type.label}</span>
              </motion.button>
            );
          })}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Shopping category selector */}
            {watchType === 'shopping' && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <div className="grid grid-cols-4 gap-2">
                      {shoppingCategories.map((category) => {
                        const Icon = categoryIcons[category.name] || MoreHorizontal;
                        const isSelected = field.value === category.name;
                        
                        return (
                          <motion.button
                            key={category.name}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => field.onChange(category.name)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <Icon className={cn(
                              "w-5 h-5",
                              isSelected ? "text-primary" : "text-gray-400"
                            )} />
                            <span className={cn(
                              "text-[10px] leading-tight text-center",
                              isSelected ? "text-primary font-medium" : "text-gray-500"
                            )}>
                              {category.name}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {watchType === 'shopping' ? 'Название продукта' : 'Описание задачи'}
                  </FormLabel>
                  <FormControl>
                    {watchType === 'shopping' ? (
                      <Input 
                        {...field} 
                        placeholder="Например: Молоко" 
                        className="rounded-xl"
                      />
                    ) : (
                      <Textarea 
                        {...field} 
                        placeholder="Опишите задачу..."
                        className="rounded-xl min-h-[80px]"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity and unit (for shopping) */}
            {watchType === 'shopping' && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Количество</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="1"
                          className="rounded-xl"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Единица</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full rounded-xl h-12"
              disabled={!form.formState.isValid}
            >
              Добавить задачу
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
