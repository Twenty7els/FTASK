'use client';

import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Check,
  X,
  UserPlus
} from 'lucide-react';
import { Event, EventResponseStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/components/telegram/TelegramProvider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  currentUserId?: string;
  onRespond?: (eventId: string, response: EventResponseStatus) => void;
}

const responseColors: Record<EventResponseStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  going: 'bg-emerald-100 text-emerald-700',
  not_going: 'bg-red-100 text-red-700',
};

const responseLabels: Record<EventResponseStatus, string> = {
  pending: 'Ожидает',
  going: 'Пойду',
  not_going: 'Не пойду',
};

export function EventCard({ event, currentUserId, onRespond }: EventCardProps) {
  const { impactOccurred, notificationOccurred } = useHaptic();

  // Find current user's participation
  const userParticipation = event.participants?.find(
    p => p.userId === currentUserId
  );
  const userResponse = userParticipation?.response || 'pending';

  // Count responses
  const goingCount = event.participants?.filter(p => p.response === 'going').length || 0;
  const notGoingCount = event.participants?.filter(p => p.response === 'not_going').length || 0;
  const pendingCount = event.participants?.filter(p => p.response === 'pending').length || 0;

  const handleRespond = (response: EventResponseStatus) => {
    impactOccurred('medium');
    notificationOccurred('success');
    onRespond?.(event.id, response);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const eventDate = new Date(event.eventDate);
  const isPast = eventDate < new Date();

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
        isPast && "opacity-60"
      )}>
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-br from-violet-500 to-purple-600 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Date badge */}
          <div className="absolute top-3 right-3 bg-white/90 rounded-xl px-3 py-1.5 text-center backdrop-blur-sm">
            <p className="text-xs font-medium text-violet-600">
              {format(eventDate, 'MMM', { locale: ru })}
            </p>
            <p className="text-xl font-bold text-violet-700">
              {format(eventDate, 'd')}
            </p>
          </div>

          {/* Event icon */}
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <Calendar className="w-7 h-7 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 pb-4 px-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {event.title}
          </h3>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Date and time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              {format(eventDate, "d MMMM, HH:mm", { locale: ru })}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {/* Participants */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Участники</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  {goingCount}
                </Badge>
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                    {pendingCount} жду
                  </Badge>
                )}
              </div>
            </div>

            {/* Participant avatars */}
            <div className="flex items-center gap-1">
              {event.participants?.slice(0, 5).map((participant) => (
                <Avatar 
                  key={participant.id} 
                  className={cn(
                    "w-8 h-8 border-2 border-white",
                    participant.response === 'going' && "ring-2 ring-emerald-400",
                    participant.response === 'not_going' && "opacity-50"
                  )}
                >
                  <AvatarImage src={participant.user?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
                    {participant.user ? getInitials(participant.user.firstName) : '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {event.participants && event.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                  <span className="text-[10px] text-gray-600">+{event.participants.length - 5}</span>
                </div>
              )}
            </div>
          </div>

          {/* Response buttons (for participants) */}
          {userParticipation && !isPast && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={userResponse === 'going' ? 'default' : 'outline'}
                onClick={() => handleRespond('going')}
                className={cn(
                  "flex-1 rounded-xl",
                  userResponse === 'going' && "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                <Check className="w-4 h-4 mr-1" />
                Пойду
              </Button>
              <Button
                size="sm"
                variant={userResponse === 'not_going' ? 'destructive' : 'outline'}
                onClick={() => handleRespond('not_going')}
                className="flex-1 rounded-xl"
              >
                <X className="w-4 h-4 mr-1" />
                Не пойду
              </Button>
            </div>
          )}

          {/* Past event badge */}
          {isPast && (
            <div className="text-center py-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                Мероприятие завершилось
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
