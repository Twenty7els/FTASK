'use client';

import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Calendar, 
  Gift, 
  LogOut,
  UserPlus,
  UserCheck,
  Home,
  Edit2
} from 'lucide-react';
import { User, FamilyGroup } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
  user: User;
  families: FamilyGroup[];
  friendsCount: number;
  isOwner: boolean;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
  onAddFriend?: () => void;
  onAcceptFriend?: () => void;
  onCreateFamily?: () => void;
}

export function ProfileView({
  user,
  families,
  friendsCount,
  isOwner,
  isFriend,
  hasPendingRequest,
  onAddFriend,
  onAcceptFriend,
  onCreateFamily
}: ProfileViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="px-4">
        <Card className="overflow-hidden rounded-3xl border-0 shadow-lg">
          {/* Gradient background */}
          <div className="h-24 bg-gradient-to-br from-primary to-primary/70 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          </div>

          {/* Avatar and info */}
          <div className="px-4 pb-4 -mt-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="relative inline-block"
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                  {getInitials(`${user.firstName} ${user.lastName || ''}`)}
                </AvatarFallback>
              </Avatar>
              {isOwner && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </motion.div>

            <div className="mt-3">
              <h2 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName || ''}
              </h2>
              {user.username && (
                <p className="text-sm text-gray-500">@{user.username}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{friendsCount} друзей</span>
              </div>
              {user.birthday && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatBirthday(user.birthday)}</span>
                </div>
              )}
            </div>

            {/* Action buttons for non-owner */}
            {!isOwner && (
              <div className="mt-4 flex gap-2">
                {isFriend ? (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    disabled
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Друзья
                  </Button>
                ) : hasPendingRequest ? (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    disabled
                  >
                    Запрос отправлен
                  </Button>
                ) : (
                  <Button
                    className="flex-1 rounded-xl"
                    onClick={onAddFriend}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Добавить в друзья
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Families section (for owner) */}
      {isOwner && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Мои семьи</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCreateFamily}
              className="rounded-xl"
            >
              <Home className="w-4 h-4 mr-1" />
              Создать
            </Button>
          </div>

          {families.length === 0 ? (
            <Card className="p-4 rounded-2xl bg-gray-50 border-0">
              <div className="text-center">
                <Home className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Создайте семейную группу для совместных задач
                </p>
                <Button
                  size="sm"
                  onClick={onCreateFamily}
                  className="mt-3 rounded-xl"
                >
                  Создать семью
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {families.map((family) => (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{family.name}</h4>
                      <p className="text-xs text-gray-500">
                        {family.members?.length || 0} участников
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">
                      {family.members?.find(m => m.userId === user.id)?.role === 'admin' ? 'Админ' : 'Участник'}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick actions (for owner) */}
      {isOwner && (
        <div className="px-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-auto py-4 rounded-2xl flex-col gap-1"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Друзья</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 rounded-2xl flex-col gap-1"
            >
              <Gift className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Вишлист</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 rounded-2xl flex-col gap-1"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Настройки</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 rounded-2xl flex-col gap-1 text-red-500 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Выйти</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatBirthday(birthday: string): string {
  const date = new Date(birthday);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
