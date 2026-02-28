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
import { Task, Event, WishlistItem, EventResponseStatus, User } from '@/types';

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

  // Load data from database
  const loadDataFromDB = useCallback(async (userId: string) => {
    try {
      // Load families
      const familiesRes = await fetch(`/api/family?userId=${userId}`);
      if (familiesRes.ok) {
        const data = await familiesRes.json();
        setFamilies(data.families || []);
        if (data.families?.length > 0) {
          setCurrentFamily(data.families[0]);
        }
      }

      // Load tasks for first family
      if (currentFamily?.id) {
        const tasksRes = await fetch(`/api/tasks?familyId=${currentFamily.id}`);
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.tasks || []);
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
    }
  }, [setFamilies, setCurrentFamily, setTasks, setEvents, setWishlist, setFriends, currentFamily?.id]);

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
            // Load data from DB
            await loadDataFromDB(data.user.id);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        // Not in Telegram - show login screen or demo
        setIsDemoMode(true);
        // You can redirect to login page here if needed
      }
      
      setIsLoading(false);
      setInitialized(true);
    };
    
    initApp();
  }, [isReady, initialized, isTelegram, telegramUser, setIsLoading, setUser, setIsDemoMode, loadDataFromDB]);

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

  // Not in Telegram - show message
  if (!isTelegram && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Семейный Органайзер</h1>
          <p className="text-gray-500 mb-6">
            Откройте это приложение через Telegram для полноценной работы с вашими данными.
          </p>
          <div className="bg-blue-50 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Как открыть:</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li>1. Найдите бота в Telegram</li>
              <li>2. Нажмите кнопку &quot;Открыть приложение&quot;</li>
              <li>3. Приложение загрузит ваши данные</li>
            </ol>
          </div>
        </div>
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
