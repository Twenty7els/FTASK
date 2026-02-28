'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  completed: number;
  total: number;
  showText?: boolean;
}

export function ProgressBar({ completed, total, showText = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  if (total === 0) {
    return (
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">Все задачи выполнены!</p>
            <p className="text-xs text-emerald-600">Новых задач на сегодня нет</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
      {showText && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <span className="text-sm font-bold text-primary">{completed}</span>
            </motion.div>
            <span className="text-sm text-gray-600">из {total} выполнено</span>
          </div>
          <span className="text-lg font-bold text-primary">{percentage}%</span>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-2 bg-gray-200/50"
        />
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      {/* Mini progress dots */}
      <div className="flex items-center gap-1 mt-3 justify-center">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            {i < completed ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
