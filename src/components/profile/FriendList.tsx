'use client'

import { motion } from 'framer-motion'
import { UserPlus, Check, X, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { User, FriendRequest, Friendship } from '@/types'
import { useState } from 'react'

interface FriendListProps {
  friends: User[]
  sentRequests: FriendRequest[]
  receivedRequests: FriendRequest[]
  onAddFriend: (telegramId: string) => void
  onAcceptRequest: (requestId: string) => void
  onDeclineRequest: (requestId: string) => void
}

export function FriendList({
  friends,
  sentRequests,
  receivedRequests,
  onAddFriend,
  onAcceptRequest,
  onDeclineRequest,
}: FriendListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFriendId, setNewFriendId] = useState('')

  const filteredFriends = friends.filter(friend => 
    friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddFriend = () => {
    if (newFriendId.trim()) {
      onAddFriend(newFriendId.trim())
      setNewFriendId('')
      setShowAddForm(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pb-20"
    >
      {/* Pending requests */}
      {receivedRequests.length > 0 && (
        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Запросы в друзья
              <Badge className="bg-blue-500">{receivedRequests.length}</Badge>
            </h3>
            
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div 
                  key={request.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.sender?.avatarUrl || ''} />
                      <AvatarFallback className="bg-gray-100">
                        {request.sender?.firstName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.sender?.firstName} {request.sender?.lastName}
                      </p>
                      {request.sender?.username && (
                        <p className="text-xs text-gray-500">@{request.sender.username}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAcceptRequest(request.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeclineRequest(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Add friend */}
      <Card className="border-0 shadow-lg">
        <div className="p-4">
          {showAddForm ? (
            <div className="space-y-3">
              <Input
                placeholder="Telegram ID пользователя"
                value={newFriendId}
                onChange={(e) => setNewFriendId(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleAddFriend}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Добавить
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Добавить друга
            </Button>
          )}
        </div>
      </Card>

      {/* Friends list */}
      <Card className="border-0 shadow-lg">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск друзей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-3">
            Друзья ({friends.length})
          </h3>

          {filteredFriends.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Ничего не найдено' : 'У вас пока нет друзей'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <div 
                  key={friend.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatarUrl || ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600">
                      {friend.firstName?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">
                      {friend.firstName} {friend.lastName}
                    </p>
                    {friend.username && (
                      <p className="text-xs text-gray-500">@{friend.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Sent requests */}
      {sentRequests.length > 0 && (
        <Card className="border-0 shadow-lg">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Отправленные запросы
            </h3>
            
            <div className="space-y-2">
              {sentRequests.map((request) => (
                <div 
                  key={request.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={request.receiver?.avatarUrl || ''} />
                      <AvatarFallback className="bg-gray-100 text-xs">
                        {request.receiver?.firstName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      {request.receiver?.firstName}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Ожидание
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  )
}
