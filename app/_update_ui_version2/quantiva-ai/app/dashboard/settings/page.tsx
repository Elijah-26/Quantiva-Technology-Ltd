"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 flex-wrap h-auto gap-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="glass" size="sm" className="mb-2">
                    Change Avatar
                  </Button>
                  <p className="text-white/40 text-sm">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white/70 mb-2 block">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    defaultValue="John"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white/70 mb-2 block">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    defaultValue="Doe"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white/70 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white/70 mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle" className="text-white/70 mb-2 block">
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    defaultValue="Compliance Officer"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="department" className="text-white/70 mb-2 block">
                    Department
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    defaultValue="Legal"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="gradient">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-white/50" />
                  <div>
                    <p className="text-white">Language</p>
                    <p className="text-white/50 text-sm">Select your preferred language</p>
                  </div>
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-white/50" />
                  <div>
                    <p className="text-white">Dark Mode</p>
                    <p className="text-white/50 text-sm">Always use dark theme</p>
                  </div>
                </div>
                <button className="w-12 h-6 rounded-full bg-indigo-500 relative">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName" className="text-white/70 mb-2 block">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    defaultValue="Acme Inc."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="companyWebsite" className="text-white/70 mb-2 block">
                    Company Website
                  </Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    defaultValue="https://acme.com"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="companySize" className="text-white/70 mb-2 block">
                    Company Size
                  </Label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm">
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="industry" className="text-white/70 mb-2 block">
                    Industry
                  </Label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm">
                    <option value="saas">SaaS / Technology</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="companyDescription" className="text-white/70 mb-2 block">
                    Company Description
                  </Label>
                  <textarea
                    id="companyDescription"
                    rows={3}
                    defaultValue="Acme Inc. is a leading provider of cloud-based solutions for small and medium businesses."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="gradient">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: Mail,
                  title: "Email Notifications",
                  description: "Receive updates about your documents and account",
                  enabled: true,
                },
                {
                  icon: Bell,
                  title: "Document Updates",
                  description: "Get notified when documents are updated or new templates are available",
                  enabled: true,
                },
                {
                  icon: Shield,
                  title: "Security Alerts",
                  description: "Receive alerts about suspicious activity",
                  enabled: true,
                },
                {
                  icon: Smartphone,
                  title: "SMS Notifications",
                  description: "Receive text messages for important updates",
                  enabled: false,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                      <p className="text-white">{item.title}</p>
                      <p className="text-white/50 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <button
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      item.enabled ? "bg-indigo-500" : "bg-white/10"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        item.enabled ? "right-1" : "left-1"
                      )}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-white/70 mb-2 block">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-white/70 mb-2 block">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white/70 mb-2 block">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <Button variant="gradient">Update Password</Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white">2FA is enabled</p>
                    <p className="text-white/50 text-sm">Your account is secured with authenticator app</p>
                  </div>
                </div>
                <Button variant="glass" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 border-rose-500/30">
            <CardHeader>
              <CardTitle className="text-rose-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Delete Account</p>
                  <p className="text-white/50 text-sm">Permanently delete your account and all data</p>
                </div>
                <Button variant="glass" className="text-rose-400 border-rose-500/30">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
