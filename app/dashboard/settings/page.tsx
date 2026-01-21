'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Settings, 
  Plus, 
  Webhook, 
  Edit, 
  Trash2, 
  TestTube2,
  Loader2,
  Zap,
  Repeat,
  Users,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react'
import { WebhookConfig, WebhookType, getWebhooks } from '@/lib/webhooks'
import { toast } from 'sonner'
import { withAuth } from '@/lib/auth/protected-route'
import { getCurrentUserProfile, getAllUsers, createUser, updateUser, deleteUser, UserProfile } from '@/lib/auth/user-service'

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  
  // User management state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    role: 'user' as 'admin' | 'user',
  })

  // Load current user profile
  useEffect(() => {
    async function loadProfile() {
      const { data } = await getCurrentUserProfile()
      if (data) {
        setCurrentUser(data)
      }
    }
    loadProfile()
  }, [])

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setUsersLoading(true)
    const { data, error } = await getAllUsers()
    
    if (error) {
      toast.error('Failed to load users', {
        description: error
      })
    } else if (data) {
      setUsers(data)
    }
    
    setUsersLoading(false)
  }


  // User management handlers
  const handleOpenUserDialog = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        email: user.email,
        password: '',
        full_name: user.full_name || '',
        company_name: user.company_name || '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setUserFormData({
        email: '',
        password: '',
        full_name: '',
        company_name: '',
        role: 'user',
      })
    }
    setIsUserDialogOpen(true)
  }

  const handleCloseUserDialog = () => {
    setIsUserDialogOpen(false)
    setEditingUser(null)
    setUserFormData({
      email: '',
      password: '',
      full_name: '',
      company_name: '',
      role: 'user',
    })
  }

  const handleSaveUser = async () => {
    // Validate
    if (!userFormData.email) {
      toast.error('Email is required')
      return
    }

    if (!editingUser && !userFormData.password) {
      toast.error('Password is required for new users')
      return
    }

    setFormLoading(true)

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          full_name: userFormData.full_name,
          company_name: userFormData.company_name,
        }

        // Only include role if changed and not editing self
        if (userFormData.role !== editingUser.role && editingUser.id !== currentUser?.id) {
          updateData.role = userFormData.role
        }

        // Only include email if changed
        if (userFormData.email !== editingUser.email) {
          updateData.email = userFormData.email
        }

        const { error } = await updateUser(editingUser.id, updateData)

        if (error) {
          toast.error('Failed to update user', {
            description: typeof error === 'string' ? error : error.message
          })
        } else {
          toast.success('User updated successfully')
          handleCloseUserDialog()
          await loadUsers()
        }
      } else {
        // Create new user
        const { error } = await createUser({
          email: userFormData.email,
          password: userFormData.password,
          full_name: userFormData.full_name,
          company_name: userFormData.company_name,
          role: userFormData.role,
        })

        if (error) {
          toast.error('Failed to create user', {
            description: typeof error === 'string' ? error : error.message
          })
        } else {
          toast.success('User created successfully')
          handleCloseUserDialog()
          await loadUsers()
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Cannot delete your own account')
      return
    }

    setFormLoading(true)

    const { error } = await deleteUser(userId)

    if (error) {
      toast.error('Failed to delete user', {
        description: typeof error === 'string' ? error : error.message
      })
    } else {
      toast.success('User deleted successfully')
      setDeleteConfirmId(null)
      await loadUsers()
    }

    setFormLoading(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-600">
            Manage webhooks, users, and application configuration
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Total Users
                        </CardTitle>
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">
                        {users.length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Administrators
                        </CardTitle>
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'admin').length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          Regular Users
                        </CardTitle>
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">
                        {users.filter(u => u.role === 'user').length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Users Table */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                          View and manage all user accounts
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleOpenUserDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add User
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      </div>
                    ) : (
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead>Last Login</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                  No users found
                                </TableCell>
                              </TableRow>
                            ) : (
                              users.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium text-gray-900 flex items-center gap-2">
                                        {user.full_name || 'No name'}
                                        {user.id === currentUser?.id && (
                                          <Badge variant="outline" className="text-xs">You</Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">
                                      {user.company_name || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                                      className={user.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : ''}
                                    >
                                      {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                      {user.role === 'user' && <User className="w-3 h-3 mr-1" />}
                                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-gray-600">
                                      {user.last_login 
                                        ? new Date(user.last_login).toLocaleDateString()
                                        : 'Never'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenUserDialog(user)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      {user.id !== currentUser?.id && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setDeleteConfirmId(user.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and role'
                  : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address *</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    disabled={formLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="user-full_name">Full Name</Label>
                <Input
                  id="user-full_name"
                  type="text"
                  placeholder="John Doe"
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-company_name">Company Name (Optional)</Label>
                <Input
                  id="user-company_name"
                  type="text"
                  placeholder="Company Inc."
                  value={userFormData.company_name}
                  onChange={(e) => setUserFormData({ ...userFormData, company_name: e.target.value })}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-role">Role *</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value: 'admin' | 'user') => setUserFormData({ ...userFormData, role: value })}
                  disabled={formLoading || (editingUser?.id === currentUser?.id)}
                >
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>User</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editingUser?.id === currentUser?.id && (
                  <p className="text-xs text-amber-600">Cannot change your own role</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseUserDialog} disabled={formLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser} disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingUser ? 'Save Changes' : 'Create User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={formLoading}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDeleteUser(deleteConfirmId)}
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default withAuth(SettingsPage)
