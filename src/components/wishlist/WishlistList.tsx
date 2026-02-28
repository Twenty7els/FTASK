'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Gift, Sparkles } from 'lucide-react';
import { WishlistItem } from '@/types';
import { WishlistCard } from './WishlistCard';
import { Button } from '@/components/ui/button';
import { WishlistFormDialog } from './WishlistFormDialog';
import { useAppStore } from '@/lib/store';

interface WishlistListProps {
  items: WishlistItem[];
  isOwner: boolean;
  currentUserId?: string;
  onBook: (itemId: string) => void;
  onUnbook: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onCreateItem?: (data: any) => void;
}

export function WishlistList({ 
  items, 
  isOwner,
  currentUserId,
  onBook, 
  onUnbook,
  onDelete,
  onCreateItem 
}: WishlistListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAppStore();

  // Check which items are booked by current user
  const getBookedByMe = (item: WishlistItem) => {
    if (isOwner) return false;
    return item.bookings?.some(
      b => b.userId === currentUserId && !b.cancelledAt
    ) || false;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isOwner ? 'Мой вишлист' : 'Вишлист'}
            </h2>
            <p className="text-sm text-gray-500">
              {items.length} {getItemsWord(items.length)}
            </p>
          </div>
          {isOwner && (
            <Button
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="rounded-xl bg-pink-500 hover:bg-pink-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
          )}
        </div>
      </div>

      {/* Items grid */}
      <div className="px-4 space-y-3 pb-4">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Вишлист пуст
              </h3>
              <p className="text-sm text-gray-500">
                {isOwner 
                  ? 'Добавьте желанные подарки в ваш список' 
                  : 'У этого пользователя пока нет желаний'}
              </p>
              {isOwner && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 rounded-xl bg-pink-500 hover:bg-pink-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить желание
                </Button>
              )}
            </motion.div>
          ) : (
            items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                isOwner={isOwner}
                bookedByMe={getBookedByMe(item)}
                onBook={onBook}
                onUnbook={onUnbook}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB - Add item button (for owner) */}
      {isOwner && items.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            size="lg"
            onClick={() => setIsFormOpen(true)}
            className="w-14 h-14 rounded-full shadow-lg bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Wishlist form dialog */}
      <WishlistFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSubmit={onCreateItem}
      />
    </div>
  );
}

function getItemsWord(count: number): string {
  if (count === 1) return 'желание';
  if (count >= 2 && count <= 4) return 'желания';
  return 'желаний';
}
