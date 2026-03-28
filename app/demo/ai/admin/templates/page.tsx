'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Library, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORIES = [
  { id: 'gdpr', name: 'GDPR & privacy' },
  { id: 'contracts', name: 'Contracts' },
  { id: 'hr', name: 'HR & employment' },
  { id: 'financial', name: 'Financial promotions' },
]

const PRESETS: Record<string, { title: string; body: string }> = {
  gdpr: {
    title: 'Data processing agreement (standard)',
    body: 'This DPA supplements the main services agreement...',
  },
  contracts: {
    title: 'Mutual NDA — bilateral',
    body: 'The parties wish to exchange confidential information...',
  },
  hr: {
    title: 'Remote work policy — EU',
    body: 'Employees may request remote arrangements subject to...',
  },
  financial: {
    title: 'Risk summary — retail audience',
    body: 'Capital at risk. Past performance does not predict future results...',
  },
}

export default function AdminTemplatesDemoPage() {
  const [categoryId, setCategoryId] = useState('gdpr')
  const [title, setTitle] = useState(PRESETS.gdpr.title)
  const [body, setBody] = useState(PRESETS.gdpr.body)

  const onCategoryChange = (v: string) => {
    setCategoryId(v)
    const p = PRESETS[v] ?? PRESETS.gdpr
    setTitle(p.title)
    setBody(p.body)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Template CMS</h1>
        <p className="text-white/60">
          Demo editor — saves are toasts only; nothing is written to a database.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Library className="size-5 text-rose-400" />
              <CardTitle className="text-white">Categories</CardTitle>
            </div>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              type="button"
              onClick={() => {
                toast.message('Demo — import would upload a packaged template ZIP')
              }}
            >
              <Upload className="size-4" />
              Import (fake)
            </Button>
          </div>
          <CardDescription className="text-white/50">
            Pick a category to load a prefilled sample form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label className="text-white/70">Category</Label>
            <Select value={categoryId} onValueChange={onCategoryChange}>
              <SelectTrigger className="border-white/10 bg-navy-900/80 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-title" className="text-white/70">
              Template title
            </Label>
            <Input
              id="tpl-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-body" className="text-white/70">
              Body (excerpt)
            </Label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="border-white/10 bg-white/5 text-white resize-y"
            />
          </div>
          <Button
            variant="default"
            className="bg-rose-600 hover:bg-rose-700"
            type="button"
            onClick={() => toast.success('Demo — template saved (not persisted)')}
          >
            Save template
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
