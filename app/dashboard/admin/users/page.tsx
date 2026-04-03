'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Shield, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserProfile,
} from '@/lib/auth/user-service'

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    role: 'user' as 'admin' | 'user',
  })

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setForbidden(false)
    const { data, error } = await getAllUsers()
    if (error) {
      const msg =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || 'Failed to load'
      if (/forbidden|403/i.test(String(msg))) {
        setForbidden(true)
      } else {
        toast.error('Failed to load users', { description: msg })
      }
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filtered = useMemo(() => {
    let list = users
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter)
    }
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.company_name || '').toLowerCase().includes(q)
    )
  }, [users, searchQuery, roleFilter])

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      regular: users.filter((u) => u.role === 'user').length,
    }
  }, [users])

  function openCreate() {
    setEditing(null)
    setForm({
      email: '',
      password: '',
      full_name: '',
      company_name: '',
      role: 'user',
    })
    setDialogOpen(true)
  }

  function openEdit(u: UserProfile) {
    setEditing(u)
    setForm({
      email: u.email,
      password: '',
      full_name: u.full_name || '',
      company_name: u.company_name || '',
      role: u.role,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.email.trim() && !editing) {
      toast.error('Email is required')
      return
    }
    if (!editing && !form.password) {
      toast.error('Password is required for new users')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const updateData: Parameters<typeof updateUser>[1] = {
          full_name: form.full_name,
          company_name: form.company_name,
        }
        if (form.email !== editing.email) updateData.email = form.email
        if (form.role !== editing.role) updateData.role = form.role
        const { error } = await updateUser(editing.id, updateData)
        if (error) {
          toast.error('Update failed', {
            description: typeof error === 'string' ? error : (error as Error).message,
          })
          return
        }
        toast.success('User updated')
      } else {
        const { error } = await createUser({
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name,
          company_name: form.company_name,
          role: form.role,
        })
        if (error) {
          toast.error('Create failed', {
            description: typeof error === 'string' ? error : (error as Error).message,
          })
          return
        }
        toast.success('User created')
      }
      setDialogOpen(false)
      await loadUsers()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(u: UserProfile) {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return
    const { error } = await deleteUser(u.id)
    if (error) {
      toast.error('Delete failed', {
        description: typeof error === 'string' ? error : (error as Error).message,
      })
      return
    }
    toast.success('User deleted')
    await loadUsers()
  }

  if (forbidden) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-white/60">You do not have permission to manage users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-white/60">Manage accounts and roles (Supabase).</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="size-4" />
          Add user
        </Button>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total users', value: stats.total },
          { label: 'Administrators', value: stats.admins },
          { label: 'Regular users', value: stats.regular },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/50 text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            placeholder="Search by name, email, or company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'admin', 'user'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize',
                roleFilter === r
                  ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
              )}
            >
              {r === 'all' ? 'All roles' : r}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All users</CardTitle>
          <CardDescription className="text-white/50">
            Showing {filtered.length} of {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/60 gap-2">
              <Loader2 className="size-6 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/50 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Company</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Role</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Joined</th>
                    <th className="text-right p-4 text-white/50 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                            <span className="text-rose-400 font-medium text-xs">
                              {(u.full_name || u.email || '?')
                                .split(/\s+/)
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">
                              {u.full_name?.trim() || '—'}
                            </p>
                            <p className="text-white/50 text-sm truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/70 text-sm max-w-[160px] truncate">
                        {u.company_name?.trim() || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {u.role === 'admin' ? (
                            <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                          ) : (
                            <User className="w-4 h-4 text-white/40 shrink-0" />
                          )}
                          <span className="text-white/80 text-sm capitalize">{u.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/60 text-sm whitespace-nowrap">
                        {formatJoined(u.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                            onClick={() => openEdit(u)}
                            aria-label="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-rose-400"
                            onClick={() => void handleDelete(u)}
                            aria-label="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="p-8 text-center text-white/50 text-sm">No users match your filters.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit user' : 'Create user'}</DialogTitle>
            <DialogDescription className="text-white/50">
              {editing ? 'Update profile and role.' : 'Creates a confirmed auth user and public.users row.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-white/80">Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            {!editing && (
              <div className="space-y-1">
                <Label className="text-white/80">Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-white/80">Full name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Company</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as 'admin' | 'user' }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/20" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
