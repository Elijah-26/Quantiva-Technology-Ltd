'use client'

import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AdminSettingsDemoPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Admin settings</h1>
        <p className="text-white/60">
          Demo placeholder — feature flags, integrations, and moderation policy
          would live here.
        </p>
      </div>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-rose-400" />
            <CardTitle className="text-white">Platform</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Static copy for client demos only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <p>• Maintenance mode: Off (demo)</p>
          <p>• Default document retention: 90 days (example)</p>
          <p>• API rate limits: Standard tier (example)</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
