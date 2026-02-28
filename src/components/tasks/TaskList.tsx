'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Archive, ListTodo, Sparkles } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskFormDialog } from './TaskFormDialog';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  showArchived?: boolean;
}

export function TaskList({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask,
  showArchived = false 
}: TaskListProps) {
  const [showArchivedTasks, setShowArchivedTasks] = useState(showArchived);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentFamily } = useAppStore();

  // Filter tasks
  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const archivedTasks = tasks.filter(t => t.status === 'archived');

  // Stats
  const todayCompleted = completedTasks.filter(t => {
    const today = new Date();
    const completedDate = t.completedAt ? new Date(t.completedAt) : null;
    return completedDate && 
      completedDate.getDate() === today.getDate() &&
      completedDate.getMonth() === today.getMonth() &&
      completedDate.getFullYear() === today.getFullYear();
  }).length;

  const todayTotal = activeTasks.length + todayCompleted;

  const handleComplete = (taskId: string) => {
    onUpdateTask(taskId, { 
      status: 'completed' as TaskStatus,
      completedAt: new Date()
    });
  };

  const handleArchive = (taskId: string) => {
    onUpdateTask(taskId, { status: 'archived' as TaskStatus });
  };

  const displayedTasks = showArchivedTasks ? archivedTasks : [...completedTasks, ...activeTasks];

  return (
    <div className="space-y-4">
      {/* Progress section */}
      {!showArchivedTasks && (
        <div className="px-4">
          <ProgressBar completed={todayCompleted} total={todayTotal} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="px-4 flex items-center gap-2">
        <Button
          variant={!showArchivedTasks ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowArchivedTasks(false)}
          className="rounded-xl"
        >
          <ListTodo className="w-4 h-4 mr-1" />
          Активные
          {activeTasks.length + completedTasks.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {activeTasks.length + completedTasks.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={showArchivedTasks ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowArchivedTasks(true)}
          className="rounded-xl"
        >
          <Archive className="w-4 h-4 mr-1" />
          Архив
          {archivedTasks.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {archivedTasks.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Tasks grid */}
      <div className="px-4 space-y-3 pb-4">
        <AnimatePresence mode="popLayout">
          {displayedTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {showArchivedTasks ? (
                  <Archive className="w-8 h-8 text-gray-400" />
                ) : (
                  <Sparkles className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {showArchivedTasks ? 'Архив пуст' : 'Нет задач'}
              </h3>
              <p className="text-sm text-gray-500">
                {showArchivedTasks 
                  ? 'Выполненные задачи будут появляться здесь' 
                  : 'Добавьте первую задачу для вашей семьи'}
              </p>
              {!showArchivedTasks && currentFamily && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить задачу
                </Button>
              )}
            </motion.div>
          ) : (
            displayedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task.id)}
                onArchive={() => handleArchive(task.id)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB - Add task button */}
      {!showArchivedTasks && currentFamily && displayedTasks.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            size="lg"
            onClick={() => setIsFormOpen(true)}
            className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Task form dialog */}
      <TaskFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        familyId={currentFamily?.id}
      />
    </div>
  );
}
