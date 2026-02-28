'use client';

import { motion } from 'framer-motion';
import { Menu, Settings, Users, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { useTelegram } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showFamilySelector?: boolean;
}

export function Header({ title, showFamilySelector = true }: HeaderProps) {
  const { user, currentFamily, families, setCurrentFamily, isDemoMode } = useAppStore();
  const { isTelegram } = useTelegram();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 safe-area-top">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Menu or Avatar */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user ? getInitials(`${user.firstName} ${user.lastName || ''}`) : '?'}
                </AvatarFallback>
              </Avatar>
              {isDemoMode && (
                <span className="absolute -bottom-1 -right-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full font-medium">
                  Demo
                </span>
              )}
            </motion.div>
            
            {title ? (
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            ) : showFamilySelector && families.length > 0 ? (
              <FamilySelector 
                families={families} 
                currentFamily={currentFamily}
                onSelect={setCurrentFamily}
              />
            ) : (
              <div>
                <p className="text-sm text-gray-500">Добро пожаловать!</p>
                <h1 className="text-lg font-semibold text-gray-900">
                  {user?.firstName || 'Гость'}
                </h1>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface FamilySelectorProps {
  families: { id: string; name: string }[];
  currentFamily: { id: string; name: string } | null;
  onSelect: (family: { id: string; name: string } | null) => void;
}

function FamilySelector({ families, currentFamily, onSelect }: FamilySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-400" />
      <select
        value={currentFamily?.id || ''}
        onChange={(e) => {
          const family = families.find((f) => f.id === e.target.value);
          onSelect(family || null);
        }}
        className="bg-transparent text-lg font-semibold text-gray-900 border-none outline-none cursor-pointer"
      >
        {families.map((family) => (
          <option key={family.id} value={family.id}>
            {family.name}
          </option>
        ))}
      </select>
    </div>
  );
}
