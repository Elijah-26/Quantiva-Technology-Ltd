'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowLeft, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Project = {
  id: string
  name: string
  status: 'active' | 'archived'
  updated: string
}

const SEED: Project[] = [
  { id: 'p1', name: 'PhD — RegTech adoption', status: 'active', updated: '2026-03-20' },
  { id: 'p2', name: 'Lit review — GDPR enforcement', status: 'active', updated: '2026-03-18' },
]

export default function ResearchProjectsDemoPage() {
  const [projects, setProjects] = useState<Project[]>(SEED)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const add = () => {
    if (!name.trim()) {
      toast.error('Enter a project name')
      return
    }
    const id = `p-${Date.now()}`
    setProjects((prev) => [
      {
        id,
        name: name.trim(),
        status: 'active',
        updated: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setName('')
    setOpen(false)
    toast.success('Demo — project added locally only')
  }

  const remove = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    toast.message('Demo — removed from list')
  }

  const toggleArchive = (id: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'active' ? 'archived' : 'active',
            }
          : p
      )
    )
    toast.message('Demo — status toggled')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-white/70">
            <Link href="/demo/ai/dashboard/research">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Research projects</h1>
            <p className="text-white/60">Demo list — stored only in this session.</p>
          </div>
        </div>
        <Button variant="gradient" type="button" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </motion.div>

      <div className="grid gap-3">
        {projects.map((p) => (
          <Card key={p.id} className="border-white/10 bg-white/5">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-500/20 p-2">
                  <FolderOpen className="size-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-xs text-white/50">
                    Updated {p.updated} · {p.status}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="glass" size="sm" type="button" onClick={() => toggleArchive(p.id)}>
                  {p.status === 'active' ? 'Archive' : 'Restore'}
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  type="button"
                  className="text-rose-400"
                  onClick={() => remove(p.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-navy-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New research project</DialogTitle>
            <DialogDescription className="text-white/50">
              Demo only — not persisted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="proj-name">Project name</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Thesis chapter 3"
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="glass" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="button" onClick={add}>
              Add project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
