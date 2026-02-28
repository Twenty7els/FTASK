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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [telegramIdInput, setTelegramIdInput] = useState('');

  // Load data from database
  const loadDataFromDB = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Load families
      const familiesRes = await fetch(`/api/family?userId=${userId}`);
      if (familiesRes.ok) {
        const data = await familiesRes.json();
        setFamilies(data.families || []);
        if (data.families?.length > 0) {
          setCurrentFamily(data.families[0]);
          
          // Load tasks for first family
          const tasksRes = await fetch(`/api/tasks?familyId=${data.families[0].id}`);
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setTasks(tasksData.tasks || []);
          }
        }
      }

      // Load events
      const eventsRes = await fetch(`/api/events?userId=${userId}`);
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }

      // Load wishlist
      const wishlistRes = await fetch(`/api/wishlist?userId=${userId}`);
      if (wishlistRes.ok) {
        const data = await wishlistRes.json();
        setWishlist(data.items || []);
      }

      // Load friends
      const friendsRes = await fetch(`/api/friends?userId=${userId}`);
      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading data from DB:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setFamilies, setCurrentFamily, setTasks, setEvents, setWishlist, setFriends, setIsLoading]);

  // Initialize app
  useEffect(() => {
    if (!isReady || initialized) return;
    
    const initApp = async () => {
      setIsLoading(true);
      
      // Check if running in Telegram
      if (isTelegram && telegramUser) {
        try {
          // Authenticate with Telegram
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
            setIsDemoMode(false);
            await loadDataFromDB(data.user.id);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      }
      
      setIsLoading(false);
      setInitialized(true);
    };
    
    initApp();
  }, [isReady, initialized, isTelegram, telegramUser, setIsLoading, setUser, setIsDemoMode, loadDataFromDB]);

  // Login with Telegram ID (for testing)
  const handleLoginWithId = async () => {
    if (!telegramIdInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: telegramIdInput.trim(),
          username: `user_${telegramIdInput}`,
          firstName: 'Test',
          lastName: 'User',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsDemoMode(true);
        await loadDataFromDB(data.user.id);
        setShowLoginForm(false);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Not logged in - show login options
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 rounded-3xl shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Семейный Органайзер</h1>
            <p className="text-gray-500">
              {isTelegram 
                ? 'Загрузка данных...' 
                : 'Войдите для управления задачами семьи'}
            </p>
          </div>

          {isTelegram ? (
            <div className="text-center text-sm text-gray-400">
              Подождите...
            </div>
          ) : showLoginForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Введите ваш Telegram ID
                </label>
                <Input
                  type="text"
                  placeholder="Например: 123456789"
                  value={telegramIdInput}
                  onChange={(e) => setTelegramIdInput(e.target.value)}
                  className="rounded-xl"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ваш Telegram ID можно узнать у @userinfobot в Telegram
                </p>
              </div>
              <Button 
                onClick={handleLoginWithId}
                className="w-full rounded-xl h-12"
              >
                Войти
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setShowLoginForm(false)}
                className="w-full rounded-xl"
              >
                Назад
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-2xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📱 Через Telegram:</h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Найдите бота в Telegram</li>
                  <li>2. Откройте Mini App</li>
                </ol>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🧪 Для тестирования:</h3>
                <Button 
                  variant="outline"
                  onClick={() => setShowLoginForm(true)}
                  className="w-full rounded-xl"
                >
                  Войти по Telegram ID
                </Button>
              </div>
            </div>
          )}
        </Card>
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
          
          {activeTab === 'profile' && (
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
