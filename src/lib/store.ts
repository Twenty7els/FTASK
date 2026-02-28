'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  FamilyGroup, 
  Task, 
  Event, 
  WishlistItem, 
  FriendRequest,
  TabId 
} from '@/types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Current family
  currentFamily: FamilyGroup | null;
  setCurrentFamily: (family: FamilyGroup | null) => void;
  
  // Families
  families: FamilyGroup[];
  setFamilies: (families: FamilyGroup[]) => void;
  addFamily: (family: FamilyGroup) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Events
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;
  
  // Wishlist
  wishlist: WishlistItem[];
  setWishlist: (items: WishlistItem[]) => void;
  addWishlistItem: (item: WishlistItem) => void;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => void;
  removeWishlistItem: (id: string) => void;
  
  // Friends
  friends: User[];
  setFriends: (friends: User[]) => void;
  
  // Friend requests
  friendRequests: FriendRequest[];
  setFriendRequests: (requests: FriendRequest[]) => void;
  
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Demo mode
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  currentFamily: null,
  families: [],
  tasks: [],
  events: [],
  wishlist: [],
  friends: [],
  friendRequests: [],
  activeTab: 'tasks' as TabId,
  isLoading: true,
  isDemoMode: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUser: (user) => set({ user }),
      
      setCurrentFamily: (family) => set({ currentFamily: family }),
      
      setFamilies: (families) => set({ families }),
      addFamily: (family) => set((state) => ({ 
        families: [...state.families, family] 
      })),
      
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? { ...t, ...updates } : t
        ),
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      })),
      
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((e) => 
          e.id === id ? { ...e, ...updates } : e
        ),
      })),
      removeEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      })),
      
      setWishlist: (items) => set({ wishlist: items }),
      addWishlistItem: (item) => set((state) => ({ 
        wishlist: [...state.wishlist, item] 
      })),
      updateWishlistItem: (id, updates) => set((state) => ({
        wishlist: state.wishlist.map((item) => 
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
      removeWishlistItem: (id) => set((state) => ({
        wishlist: state.wishlist.filter((item) => item.id !== id),
      })),
      
      setFriends: (friends) => set({ friends }),
      
      setFriendRequests: (requests) => set({ friendRequests: requests }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setIsDemoMode: (demo) => set({ isDemoMode: demo }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'family-app-storage',
      partialize: (state) => ({
        user: state.user,
        currentFamily: state.currentFamily,
        families: state.families,
        activeTab: state.activeTab,
      }),
    }
  )
);
