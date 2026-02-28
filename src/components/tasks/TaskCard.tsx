'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Archive, 
  Trash2, 
  Clock, 
  Users,
  ShoppingBag,
  Home,
  MoreHorizontal,
  Package,
  Beef,
  Milk,
  Apple,
  CupSoda,
  Pill,
  SprayCan,
  Wrench
} from 'lucide-react';
import { Task, TaskStatus, TaskType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  isAnimating?: boolean;
}

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

const categoryColors: Record<string, string> = {
  'Молочное': 'bg-blue-100 text-blue-700',
  'Мясо/Рыба': 'bg-red-100 text-red-700',
  'Бакалея': 'bg-amber-100 text-amber-700',
  'Овощи/Фрукты': 'bg-green-100 text-green-700',
  'Напитки': 'bg-cyan-100 text-cyan-700',
  'Маркетплейсы': 'bg-purple-100 text-purple-700',
  'Аптека': 'bg-pink-100 text-pink-700',
  'Бытовая химия': 'bg-teal-100 text-teal-700',
  'Уборка': 'bg-indigo-100 text-indigo-700',
  'Ремонт': 'bg-orange-100 text-orange-700',
  'Другое': 'bg-gray-100 text-gray-700',
};

const typeColors: Record<TaskType, string> = {
  shopping: 'from-blue-500 to-cyan-500',
  home: 'from-emerald-500 to-teal-500',
  other: 'from-purple-500 to-pink-500',
};

export function TaskCard({ 
  task, 
  onComplete, 
  onArchive, 
  onDelete,
  isAnimating = false 
}: TaskCardProps) {
  const { impactOccurred, notificationOccurred } = useHaptic();
  
  const isCompleted = task.status === 'completed';
  const isArchived = task.status === 'archived';
  
  const CategoryIcon = task.category?.name ? 
    categoryIcons[task.category.name] || MoreHorizontal : 
    task.type === 'shopping' ? ShoppingBag : task.type === 'home' ? Home : MoreHorizontal;

  const handleComplete = () => {
    impactOccurred('medium');
    notificationOccurred('success');
    onComplete?.();
  };

  const handleArchive = () => {
    impactOccurred('light');
    onArchive?.();
  };

  const handleDelete = () => {
    impactOccurred('heavy');
    onDelete?.();
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className={cn(
        "relative overflow-hidden rounded-3xl border-0 shadow-lg",
        isCompleted && "opacity-80",
        isArchived && "opacity-60"
      )}>
        {/* Header gradient */}
        <div className={cn(
          "h-32 bg-gradient-to-br relative",
          typeColors[task.type]
        )}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Category icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <CategoryIcon className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          
          {/* Status badge */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3"
            >
              <Badge className="bg-white/90 text-emerald-700 border-0">
                <Check className="w-3 h-3 mr-1" />
                Выполнено
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and category */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg font-semibold text-gray-900 truncate",
                isCompleted && "line-through text-gray-500"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                  {task.description}
                </p>
              )}
            </div>
            {task.category && (
              <Badge 
                variant="secondary"
                className={cn(
                  "shrink-0 border-0",
                  categoryColors[task.category.name] || 'bg-gray-100 text-gray-700'
                )}
              >
                {task.category.name}
              </Badge>
            )}
          </div>

          {/* Quantity and unit */}
          {task.type === 'shopping' && task.quantity && task.unit && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span className="font-medium">
                {task.quantity} {task.unit}
              </span>
            </div>
          )}

          {/* Assigned users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <div className="flex -space-x-2">
                {task.assignedTo.slice(0, 4).map((assignment, i) => (
                  <Avatar key={assignment.id} className="w-6 h-6 border-2 border-white">
                    <AvatarImage src={assignment.user?.avatarUrl || undefined} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {assignment.user ? getInitials(assignment.user.firstName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.assignedTo.length > 4 && (
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-[10px] text-gray-600">+{task.assignedTo.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(task.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            {!isCompleted && !isArchived && (
              <>
                <Button
                  size="sm"
                  onClick={handleComplete}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Выполнено
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {isCompleted && !isArchived && (
              <>
                <Button
                  size="sm"
                  onClick={handleArchive}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  <Archive className="w-4 h-4 mr-1" />
                  В архив
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {isArchived && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="w-full text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Удалить навсегда
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
