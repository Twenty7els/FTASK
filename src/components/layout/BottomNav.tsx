'use client';

import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  Gift, 
  User,
  LayoutList
} from 'lucide-react';
import { TabId } from '@/types';
import { useAppStore } from '@/lib/store';
import { useHaptic } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';

const tabs: { id: TabId; label: string; icon: typeof CheckSquare }[] = [
  { id: 'tasks', label: 'Задачи', icon: CheckSquare },
  { id: 'events', label: 'События', icon: Calendar },
  { id: 'wishlist', label: 'Вишлист', icon: Gift },
  { id: 'profile', label: 'Профиль', icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  const { impactOccurred } = useHaptic();

  const handleTabClick = (tabId: TabId) => {
    impactOccurred('light');
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 safe-area-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-2 top-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
                <Icon className={cn(
                  "w-6 h-6 mb-1 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
