'use client';

import { motion } from 'framer-motion';
import { 
  Gift, 
  ExternalLink, 
  Lock,
  Unlock,
  Sparkles,
  Star
} from 'lucide-react';
import { WishlistItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';

interface WishlistCardProps {
  item: WishlistItem;
  isOwner: boolean;
  bookedByMe?: boolean;
  onBook?: (itemId: string) => void;
  onUnbook?: (itemId: string) => void;
}

export function WishlistCard({ 
  item, 
  isOwner, 
  bookedByMe = false,
  onBook,
  onUnbook 
}: WishlistCardProps) {
  const { impactOccurred, notificationOccurred } = useHaptic();

  const handleBook = () => {
    impactOccurred('medium');
    notificationOccurred('success');
    onBook?.(item.id);
  };

  const handleUnbook = () => {
    impactOccurred('light');
    onUnbook?.(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card className={cn(
        "overflow-hidden rounded-3xl border-0 shadow-lg",
        item.isBooked && !isOwner && !bookedByMe && "opacity-60"
      )}>
        {/* Header with gradient */}
        <div className="h-28 bg-gradient-to-br from-pink-500 to-rose-500 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Gift icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          
          {/* Booked badge */}
          {item.isBooked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3"
            >
              <Badge className="bg-white/90 text-pink-700 border-0">
                <Lock className="w-3 h-3 mr-1" />
                Забронирован
              </Badge>
            </motion.div>
          )}
          
          {/* Star decoration */}
          <div className="absolute top-2 left-2">
            <Star className="w-4 h-4 text-white/30" />
          </div>
          <div className="absolute bottom-2 right-2">
            <Sparkles className="w-4 h-4 text-white/30" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Price */}
          {item.price && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                {item.price.toLocaleString('ru-RU')} ₽
              </Badge>
            </div>
          )}

          {/* Link */}
          {item.link && !isOwner && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Ссылка на товар
            </a>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            {/* Owner view */}
            {isOwner && (
              <div className="text-center py-2">
                {item.isBooked ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Кто-то забронировал этот подарок</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <Unlock className="w-4 h-4" />
                    <span className="text-sm">Доступен для бронирования</span>
                  </div>
                )}
              </div>
            )}

            {/* Non-owner view */}
            {!isOwner && (
              <>
                {item.isBooked ? (
                  bookedByMe ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUnbook}
                      className="w-full rounded-xl text-gray-600"
                    >
                      <Unlock className="w-4 h-4 mr-1" />
                      Отменить бронь
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="w-full rounded-xl bg-gray-100 text-gray-400"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      Уже забронирован
                    </Button>
                  )
                ) : (
                  <Button
                    size="sm"
                    onClick={handleBook}
                    className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Забронировать
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
