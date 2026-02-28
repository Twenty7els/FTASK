'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TelegramProvider, useTelegram } from '@/components/telegram/TelegramProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { TaskList } from '@/components/tasks/TaskList';
import { EventList } from '@/components/events/EventList';
import { WishlistList } from '@/components/wishlist/WishlistList';
import { ProfileView } from '@/components/profile/ProfileView';
import { useAppStore } from '@/lib/store';
import { Task, Event, WishlistItem, EventResponseStatus } from '@/types';

function AppContent() {
  const { 
    user, 
    setUser, 
    activeTab, 
    tasks, 
    setTasks,
    events,
    setEvents,
    wishlist,
    setWishlist,
    families,
    setFamilies,
    currentFamily,
    setCurrentFamily,
    friends,
    setFriends,
    isLoading,
    setIsLoading,
    setIsDemoMode
  } = useAppStore();
  
  const { telegramUser, isTelegram, isReady } = useTelegram();
  const [initialized, setInitialized] = useState(false);

  // Load demo data function - defined with useCallback
  const loadDemoData = useCallback(() => {
    setIsDemoMode(true);
    
    // Create demo user if not in Telegram
    if (!isTelegram) {
      const demoUser = {
        id: 'demo-user-id',
        telegramId: '123456789',
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setUser(demoUser);
    }
    
    // Demo family
    const demoFamily = {
      id: 'demo-family-1',
      name: 'Семья Ивановых',
      createdById: 'demo-user-id',
      createdAt: new Date(),
      members: [
        { id: 'm1', familyId: 'demo-family-1', userId: 'demo-user-id', role: 'admin', joinedAt: new Date() },
        { id: 'm2', familyId: 'demo-family-1', userId: 'demo-user-2', role: 'member', joinedAt: new Date() },
      ],
    };
    
    setFamilies([demoFamily]);
    setCurrentFamily(demoFamily);
    
    // Demo tasks
    const demoTasks: Task[] = [
      {
        id: 't1',
        familyId: 'demo-family-1',
        createdById: 'demo-user-id',
        type: 'shopping',
        categoryId: 'cat1',
        title: 'Молоко 3.2%',
        description: 'Свежее молоко для завтрака',
        quantity: 2,
        unit: 'л',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'cat1', name: 'Молочное', icon: 'Milk', type: 'shopping', order: 1 },
        assignedTo: [],
      },
      {
        id: 't2',
        familyId: 'demo-family-1',
        createdById: 'demo-user-id',
        type: 'shopping',
        categoryId: 'cat2',
        title: 'Куриное филе',
        quantity: 1,
        unit: 'кг',
        status: 'active',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(),
        category: { id: 'cat2', name: 'Мясо/Рыба', icon: 'Beef', type: 'shopping', order: 2 },
        assignedTo: [],
      },
      {
        id: 't3',
        familyId: 'demo-family-1',
        createdById: 'demo-user-id',
        type: 'shopping',
        categoryId: 'cat3',
        title: 'Хлеб цельнозерновой',
        quantity: 1,
        unit: 'шт',
        status: 'completed',
        completedAt: new Date(),
        createdAt: new Date(Date.now() - 7200000),
        updatedAt: new Date(),
        category: { id: 'cat3', name: 'Бакалея', icon: 'Package', type: 'shopping', order: 3 },
        assignedTo: [],
      },
      {
        id: 't4',
        familyId: 'demo-family-1',
        createdById: 'demo-user-id',
        type: 'home',
        title: 'Помыть посуду',
        description: 'После ужина',
        status: 'active',
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(),
        assignedTo: [],
      },
      {
        id: 't5',
        familyId: 'demo-family-1',
        createdById: 'demo-user-id',
        type: 'shopping',
        categoryId: 'cat4',
        title: 'Яблоки Голден',
        quantity: 1,
        unit: 'кг',
        status: 'archived',
        completedAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
        category: { id: 'cat4', name: 'Овощи/Фрукты', icon: 'Apple', type: 'shopping', order: 4 },
        assignedTo: [],
      },
    ];
    
    setTasks(demoTasks);
    
    // Demo events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);
    
    const demoEvents: Event[] = [
      {
        id: 'e1',
        createdById: 'demo-user-id',
        title: 'Семейный ужин',
        description: 'Встречаемся всей семьёй на ужин',
        location: 'Ресторан "Домашний"',
        eventDate: tomorrow,
        createdAt: new Date(),
        participants: [
          { id: 'p1', eventId: 'e1', userId: 'demo-user-id', response: 'going', updatedAt: new Date() },
          { id: 'p2', eventId: 'e1', userId: 'demo-user-2', response: 'pending', updatedAt: new Date() },
        ],
      },
      {
        id: 'e2',
        createdById: 'demo-user-id',
        title: 'День рождения мамы',
        description: 'Празднуем день рождения!',
        location: 'Дома',
        eventDate: nextWeek,
        createdAt: new Date(Date.now() - 86400000),
        participants: [
          { id: 'p3', eventId: 'e2', userId: 'demo-user-id', response: 'going', updatedAt: new Date() },
          { id: 'p4', eventId: 'e2', userId: 'demo-user-2', response: 'going', updatedAt: new Date() },
        ],
      },
    ];
    
    setEvents(demoEvents);
    
    // Demo wishlist
    const demoWishlist: WishlistItem[] = [
      {
        id: 'w1',
        userId: 'demo-user-id',
        title: 'Беспроводные наушники',
        description: 'Предпочтительно Sony или Bose',
        link: 'https://example.com/headphones',
        price: 15000,
        isBooked: false,
        createdAt: new Date(),
        bookings: [],
      },
      {
        id: 'w2',
        userId: 'demo-user-id',
        title: 'Книга по программированию',
        description: 'Clean Code Роберта Мартина',
        price: 1500,
        isBooked: true,
        createdAt: new Date(Date.now() - 86400000),
        bookings: [{ id: 'b1', itemId: 'w2', userId: 'demo-user-2', bookedAt: new Date() }],
      },
      {
        id: 'w3',
        userId: 'demo-user-id',
        title: 'Сертификат в магазин спорта',
        price: 3000,
        isBooked: false,
        createdAt: new Date(Date.now() - 172800000),
        bookings: [],
      },
    ];
    
    setWishlist(demoWishlist);
    
    // Demo friends
    setFriends([
      { id: 'demo-user-2', telegramId: '987654321', username: 'ivan_petrov', firstName: 'Иван', lastName: 'Петров', createdAt: new Date(), updatedAt: new Date() },
      { id: 'demo-user-3', telegramId: '987654322', username: 'anna_smirnova', firstName: 'Анна', lastName: 'Смирнова', createdAt: new Date(), updatedAt: new Date() },
    ]);
  }, [setIsDemoMode, setUser, isTelegram, setFamilies, setCurrentFamily, setTasks, setEvents, setWishlist, setFriends]);

  // Initialize app with demo data
  useEffect(() => {
    if (!isReady || initialized) return;
    
    const initApp = async () => {
      setIsLoading(true);
      
      // If in Telegram, authenticate user
      if (isTelegram && telegramUser) {
        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: telegramUser.id,
              username: telegramUser.username,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              photoUrl: telegramUser.photo_url,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
      
      // Load demo data
      loadDemoData();
      
      setIsLoading(false);
      setInitialized(true);
    };
    
    initApp();
  }, [isReady, initialized, isTelegram, telegramUser, setIsLoading, setUser, loadDemoData]);

  // Task handlers
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, completedBy: user?.id }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Event handlers
  const handleEventRespond = async (eventId: string, response: EventResponseStatus) => {
    setEvents(events.map(e => {
      if (e.id === eventId && e.participants) {
        const updatedParticipants = e.participants.map(p => 
          p.userId === user?.id ? { ...p, response } : p
        );
        return { ...e, participants: updatedParticipants };
      }
      return e;
    }));
    
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, response }),
      });
    } catch (error) {
      console.error('Error responding to event:', error);
    }
  };

  // Wishlist handlers
  const handleBookItem = async (itemId: string) => {
    setWishlist(wishlist.map(item => 
      item.id === itemId ? { ...item, isBooked: true } : item
    ));
    
    try {
      await fetch(`/api/wishlist/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, action: 'book' }),
      });
    } catch (error) {
      console.error('Error booking item:', error);
    }
  };

  const handleUnbookItem = async (itemId: string) => {
    setWishlist(wishlist.map(item => 
      item.id === itemId ? { ...item, isBooked: false } : item
    ));
    
    try {
      await fetch(`/api/wishlist/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, action: 'unbook' }),
      });
    } catch (error) {
      console.error('Error unbooking item:', error);
    }
  };

  const handleDeleteWishlistItem = async (itemId: string) => {
    setWishlist(wishlist.filter(item => item.id !== itemId));
    
    try {
      await fetch(`/api/wishlist/${itemId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
    }
  };

  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={activeTab === 'tasks' ? 'Задачи' : 
               activeTab === 'events' ? 'Мероприятия' : 
               activeTab === 'wishlist' ? 'Вишлист' : 'Профиль'}
        showFamilySelector={activeTab === 'tasks'}
      />
      
      <main className="max-w-lg mx-auto pt-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TaskList
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </motion.div>
          )}
          
          {activeTab === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <EventList
                events={events}
                currentUserId={user?.id}
                onRespond={handleEventRespond}
              />
            </motion.div>
          )}
          
          {activeTab === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <WishlistList
                items={wishlist}
                isOwner={true}
                currentUserId={user?.id}
                onBook={handleBookItem}
                onUnbook={handleUnbookItem}
                onDelete={handleDeleteWishlistItem}
              />
            </motion.div>
          )}
          
          {activeTab === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileView
                user={user}
                families={families}
                friendsCount={friends.length}
                isOwner={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <BottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <TelegramProvider>
      <AppContent />
    </TelegramProvider>
  );
}
