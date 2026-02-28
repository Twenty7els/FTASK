'use client'

import { motion } from 'framer-motion'
import { Plus, Crown, User as UserIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { FamilyGroup, User } from '@/types'
import { useState } from 'react'

interface FamilyGroupProps {
  families: FamilyGroup[]
  currentUserId: string
  onCreateFamily: (name: string) => void
  onInviteMember: (familyId: string, userId: string) => void
  friends: User[]
}

export function FamilyGroupView({
  families,
  currentUserId,
  onCreateFamily,
  onInviteMember,
  friends,
}: FamilyGroupProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFamilyName, setNewFamilyName] = useState('')
  const [showInviteForm, setShowInviteForm] = useState<string | null>(null)
  const [selectedFriendId, setSelectedFriendId] = useState('')

  const handleCreateFamily = () => {
    if (newFamilyName.trim()) {
      onCreateFamily(newFamilyName.trim())
      setNewFamilyName('')
      setShowCreateForm(false)
    }
  }

  const handleInvite = (familyId: string) => {
    if (selectedFriendId) {
      onInviteMember(familyId, selectedFriendId)
      setSelectedFriendId('')
      setShowInviteForm(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 pb-20"
    >
      {/* Create family */}
      {families.length === 0 && (
        <Card className="border-0 shadow-lg">
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Создайте семью</h3>
            <p className="text-sm text-gray-500 mb-4">
              Объединитесь с близкими для управления задачами и событиями
            </p>
            
            {showCreateForm ? (
              <div className="space-y-3">
                <Input
                  placeholder="Название семьи"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCreateFamily}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Создать
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать семью
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Family list */}
      {families.map((family) => {
        const isAdmin = family.members?.some(
          m => m.userId === currentUserId && m.role === 'admin'
        )
        
        return (
          <Card key={family.id} className="border-0 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{family.name}</h3>
                {isAdmin && (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Админ
                  </Badge>
                )}
              </div>

              {/* Members */}
              <div className="space-y-2 mb-4">
                {family.members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.user?.avatarUrl || ''} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                          {member.user?.firstName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        {member.role === 'admin' && (
                          <p className="text-xs text-amber-600">Администратор</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Invite */}
              {isAdmin && (
                <>
                  {showInviteForm === family.id ? (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <select
                        value={selectedFriendId}
                        onChange={(e) => setSelectedFriendId(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="">Выберите друга</option>
                        {friends
                          .filter(f => !family.members?.some(m => m.userId === f.id))
                          .map(friend => (
                            <option key={friend.id} value={friend.id}>
                              {friend.firstName} {friend.lastName}
                            </option>
                          ))
                        }
                      </select>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInviteForm(null)}
                          className="flex-1"
                        >
                          Отмена
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleInvite(family.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Пригласить
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInviteForm(family.id)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Пригласить участника
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        )
      })}

      {/* Create additional family */}
      {families.length > 0 && (
        <Card className="border-0 shadow-lg">
          <div className="p-4">
            {showCreateForm ? (
              <div className="space-y-3">
                <Input
                  placeholder="Название новой семьи"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCreateFamily}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Создать
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать ещё семью
              </Button>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  )
}
