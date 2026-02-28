'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, CalendarDays, Sparkles } from 'lucide-react';
import { Event, EventResponseStatus } from '@/types';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventFormDialog } from './EventFormDialog';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: Event[];
  currentUserId?: string;
  onRespond: (eventId: string, response: EventResponseStatus) => void;
  onCreateEvent?: (data: any) => void;
}

export function EventList({ 
  events, 
  currentUserId,
  onRespond,
  onCreateEvent 
}: EventListProps) {
  const [showPast, setShowPast] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentFamily, friends } = useAppStore();

  const now = new Date();
  
  // Separate upcoming and past events
  const upcomingEvents = events
    .filter(e => new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  
  const pastEvents = events
    .filter(e => new Date(e.eventDate) < now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const displayedEvents = showPast ? pastEvents : upcomingEvents;

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="px-4 flex items-center gap-2">
        <Button
          variant={!showPast ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowPast(false)}
          className="rounded-xl"
        >
          <Calendar className="w-4 h-4 mr-1" />
          Предстоящие
          {upcomingEvents.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {upcomingEvents.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={showPast ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowPast(true)}
          className="rounded-xl"
        >
          <CalendarDays className="w-4 h-4 mr-1" />
          Прошедшие
          {pastEvents.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20">
              {pastEvents.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Events list */}
      <div className="px-4 space-y-3 pb-4">
        <AnimatePresence mode="popLayout">
          {displayedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {showPast ? (
                  <CalendarDays className="w-8 h-8 text-gray-400" />
                ) : (
                  <Sparkles className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {showPast ? 'Нет прошедших мероприятий' : 'Нет предстоящих мероприятий'}
              </h3>
              <p className="text-sm text-gray-500">
                {showPast 
                  ? 'Здесь будут показаны прошедшие мероприятия' 
                  : 'Создайте мероприятие и пригласите друзей'}
              </p>
              {!showPast && (
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Создать мероприятие
                </Button>
              )}
            </motion.div>
          ) : (
            displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={currentUserId}
                onRespond={onRespond}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* FAB - Add event button */}
      {!showPast && displayedEvents.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            size="lg"
            onClick={() => setIsFormOpen(true)}
            className="w-14 h-14 rounded-full shadow-lg bg-violet-500 hover:bg-violet-600"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Event form dialog */}
      <EventFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSubmit={onCreateEvent}
        friends={friends}
      />
    </div>
  );
}
