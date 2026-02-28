// Types for Family App

// User types
export interface User {
  id: string;
  telegramId: string;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
  avatarUrl?: string | null;
  birthday?: string | null;
  chatId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Friend request status
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

// Family member role
export type FamilyRole = 'admin' | 'member';

// Task types
export type TaskType = 'shopping' | 'home' | 'other';
export type TaskStatus = 'active' | 'completed' | 'archived' | 'deleted';

// Event response status
export type EventResponseStatus = 'pending' | 'going' | 'not_going';

// Task category
export interface TaskCategory {
  id: string;
  name: string;
  icon: string;
  type: TaskType;
  order: number;
}

// Task with relations
export interface Task {
  id: string;
  familyId: string;
  createdById: string;
  type: TaskType;
  categoryId?: string | null;
  title: string;
  description?: string | null;
  quantity?: number | null;
  unit?: string | null;
  status: TaskStatus;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category?: TaskCategory | null;
  assignedTo?: TaskAssignment[];
  createdBy?: User;
}

// Task assignment
export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
}

// Family group
export interface FamilyGroup {
  id: string;
  name: string;
  createdById: string;
  createdAt: Date;
  members?: FamilyMember[];
  tasks?: Task[];
}

// Family member
export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  joinedAt: Date;
  user?: User;
}

// Event
export interface Event {
  id: string;
  createdById: string;
  title: string;
  description?: string | null;
  location?: string | null;
  eventDate: Date;
  createdAt: Date;
  createdBy?: User;
  participants?: EventParticipant[];
  invitations?: EventInvitation[];
}

// Event participant
export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  response: EventResponseStatus;
  updatedAt: Date;
  user?: User;
}

// Event invitation
export interface EventInvitation {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
}

// Wishlist item
export interface WishlistItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  link?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  isBooked: boolean;
  createdAt: Date;
  user?: User;
  bookings?: WishlistBooking[];
}

// Wishlist booking
export interface WishlistBooking {
  id: string;
  itemId: string;
  userId: string;
  bookedAt: Date;
  cancelledAt?: Date | null;
  user?: User;
}

// Friend request
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  sender?: User;
  receiver?: User;
}

// Friendship
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  createdAt: Date;
  friend?: User;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: string;
  payload: string;
  read: boolean;
  createdAt: Date;
}

// Telegram Web App user
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// App state
export interface AppState {
  user: User | null;
  currentFamily: FamilyGroup | null;
  families: FamilyGroup[];
  friends: User[];
  pendingRequests: FriendRequest[];
}

// Navigation tabs
export type TabId = 'tasks' | 'events' | 'wishlist' | 'profile';

// Default task categories
export const DEFAULT_CATEGORIES: Omit<TaskCategory, 'id'>[] = [
  { name: 'Молочное', icon: 'Milk', type: 'shopping', order: 1 },
  { name: 'Мясо/Рыба', icon: 'Beef', type: 'shopping', order: 2 },
  { name: 'Бакалея', icon: 'Package', type: 'shopping', order: 3 },
  { name: 'Овощи/Фрукты', icon: 'Apple', type: 'shopping', order: 4 },
  { name: 'Напитки', icon: 'CupSoda', type: 'shopping', order: 5 },
  { name: 'Маркетплейсы', icon: 'ShoppingBag', type: 'shopping', order: 6 },
  { name: 'Аптека', icon: 'Pill', type: 'shopping', order: 7 },
  { name: 'Бытовая химия', icon: 'SprayCan', type: 'shopping', order: 8 },
  { name: 'Уборка', icon: 'Home', type: 'home', order: 9 },
  { name: 'Ремонт', icon: 'Wrench', type: 'home', order: 10 },
  { name: 'Другое', icon: 'MoreHorizontal', type: 'other', order: 11 },
];
