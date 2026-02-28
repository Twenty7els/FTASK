'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gift, Link2, DollarSign, FileText } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useHaptic } from '@/components/telegram/TelegramProvider';

const wishlistSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  link: z.string().url('Неверный формат ссылки').optional().or(z.literal('')),
  price: z.number().min(0).optional(),
});

type WishlistFormData = z.infer<typeof wishlistSchema>;

interface WishlistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: WishlistFormData) => void;
}

export function WishlistFormDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: WishlistFormDialogProps) {
  const { impactOccurred, notificationOccurred } = useHaptic();

  const form = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
      price: undefined,
    },
  });

  const handleSubmit = (data: WishlistFormData) => {
    impactOccurred('medium');
    notificationOccurred('success');
    
    onSubmit?.(data);
    
    // Reset and close
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Новое желание
          </DialogTitle>
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
                      placeholder="Например: Беспроводные наушники" 
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
                      placeholder="Добавьте детали, размер, цвет..."
                      className="rounded-xl min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Link */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        {...field} 
                        placeholder="https://..." 
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Примерная цена</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        {...field}
                        type="number"
                        placeholder="5000"
                        className="rounded-xl pl-10"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full rounded-xl h-12 bg-pink-500 hover:bg-pink-600"
            >
              <Gift className="w-4 h-4 mr-2" />
              Добавить желание
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
