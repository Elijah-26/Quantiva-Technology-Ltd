'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { 
  LayoutDashboard, 
  FileSearch, 
  FileText, 
  Calendar, 
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth/auth-context'
import { getCurrentUserProfile, UserProfile } from '@/lib/auth/user-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { name: 'New Research', href: '/dashboard/new-research', icon: FileSearch, adminOnly: false },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, adminOnly: false },
  { name: 'Schedules', href: '/dashboard/schedules', icon: Calendar, adminOnly: false },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, adminOnly: true },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut, updateProfile } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [activeProfileTab, setActiveProfileTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    company_name: '',
  })
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await getCurrentUserProfile()
      if (data) {
        setUserProfile(data)
        setProfileForm({
          full_name: data.full_name || '',
          company_name: data.company_name || '',
        })
      }
    }
    if (user) {
      loadProfile()
    }
  }, [user])

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut()
    }
  }

  // Get user initials
  const getUserInitials = () => {
    if (userProfile?.full_name) {
      const names = userProfile.full_name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  // Get display name
  const getDisplayName = () => {
    return userProfile?.full_name || user?.email?.split('@')[0] || 'User'
  }

  // Get page title based on current route
  const getPageTitle = () => {
    const currentNav = navigation.find(item => item.href === pathname)
    return currentNav ? currentNav.name : 'Dashboard'
  }

  // Filter navigation based on user role
  const navigation = baseNavigation.filter(item => 
    !item.adminOnly || userProfile?.role === 'admin'
  )

  // Sidebar content component (reused for desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <img 
            src="/quantiva.png" 
            alt="Quantiva" 
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-bold text-gray-900">Quantiva</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            setIsProfileDialogOpen(true)
            setIsMobileMenuOpen(false)
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </button>
      </div>
    </>
  )

  // Handle profile update
  const handleSaveProfile = async () => {
    setProfileLoading(true)
    try {
      const { error } = await updateProfile(profileForm)
      
      if (error) {
        toast.error('Failed to update profile', {
          description: error.message
        })
      } else {
        toast.success('Profile updated successfully')
        // Reload profile
        const { data } = await getCurrentUserProfile()
        if (data) setUserProfile(data)
      }
    } catch (err) {
      toast.error('An error occurred while updating profile')
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setProfileLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      toast.success('Password changed successfully', {
        description: 'Your password has been updated.'
      })
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      
      // Switch back to profile tab
      setActiveProfileTab('profile')
    } catch (error: any) {
      console.error('Password change error:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle email change
  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (newEmail === user?.email) {
      toast.error('This is your current email address')
      return
    }

    setEmailChangeLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      }, {
        emailRedirectTo: `${window.location.origin}/auth/confirm-email`
      })

      if (error) throw error

      toast.success('Confirmation email sent!', {
        description: 'Please check both email addresses to confirm the change.'
      })
      
      setNewEmail('')
      setActiveProfileTab('profile')
    } catch (error: any) {
      console.error('Email change error:', error)
      toast.error(error.message || 'Failed to change email')
    } finally {
      setEmailChangeLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex md:w-64 lg:w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] max-w-[85vw] p-0 flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Hamburger Menu Button - Only visible on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
            
            {/* Page Title */}
            <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 truncate">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            {/* User Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 sm:gap-2 md:gap-3 hover:bg-gray-100 px-1.5 sm:px-2 md:px-3 py-2 rounded-lg transition-colors min-h-[44px]">
                  <Avatar className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500 capitalize">{userProfile?.role || 'User'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                  <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl">Account Settings</DialogTitle>
            <DialogDescription>
              Manage your profile, security, and account preferences
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email Address</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    To change your email, go to the Email tab
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name</Label>
                  <Input
                    id="profile-name"
                    type="text"
                    placeholder="John Doe"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-company">Company Name (Optional)</Label>
                  <Input
                    id="profile-company"
                    type="text"
                    placeholder="Your Company Inc."
                    value={profileForm.company_name}
                    onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t space-y-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Role:</span>{' '}
                    <span className="capitalize">{userProfile?.role}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Member since:</span>{' '}
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Last login:</span>{' '}
                    {userProfile?.last_login ? new Date(userProfile.last_login).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsProfileDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab - Password Change */}
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">Password Requirements</p>
                      <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordForm.newPassword && passwordForm.confirmPassword && 
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                      setActiveProfileTab('profile')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={profileLoading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    {profileLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Email Tab - Email Change */}
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-amber-900">Email Change Process</p>
                      <p className="text-xs text-amber-800">
                        A confirmation email will be sent to both your current and new email addresses. 
                        You must verify the change before it takes effect.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email Address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewEmail('')
                      setActiveProfileTab('profile')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleChangeEmail} 
                    disabled={emailChangeLoading || !newEmail}
                  >
                    {emailChangeLoading ? 'Sending...' : 'Send Confirmation'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Toaster richColors position="top-right" />
    </div>
  )
}

