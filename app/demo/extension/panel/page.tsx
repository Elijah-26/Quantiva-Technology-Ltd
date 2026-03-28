'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const STATIC_SUGGESTIONS = [
  {
    title: 'Tone — more cautious',
    body: 'Replace “guaranteed” with “target” and add a risk disclaimer referencing FCA COBS.',
  },
  {
    title: 'Missing disclosure',
    body: 'Add past-performance wording: past performance is not a reliable indicator of future results.',
  },
  {
    title: 'Audience check',
    body: 'This copy reads like a financial promotion; confirm approver and MiFID categorisation.',
  },
]

export default function ExtensionPanelDemoPage() {
  const [text, setText] = useState(
    'We expect strong returns this quarter for all subscribers...'
  )
  const [showCards, setShowCards] = useState(false)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/demo/extension" aria-label="Back to extension hub">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extension panel (demo)</h1>
          <p className="text-gray-600 text-sm">
            Fake capture flow — suggestions are static cards.
          </p>
        </div>
      </motion.div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Captured text</CardTitle>
          <CardDescription>Paste or edit sample content, then request suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="resize-y"
          />
          <Button
            type="button"
            onClick={() => {
              setShowCards(true)
              toast.message('Demo — loaded static suggestions')
            }}
          >
            <Sparkles className="size-4" />
            Get suggestions
          </Button>
        </CardContent>
      </Card>

      {showCards ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {STATIC_SUGGESTIONS.map((s) => (
            <Card key={s.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">{s.body}</CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => toast.success('Demo — sent to workspace (toast only)')}
          >
            <Send className="size-4" />
            Send to workspace
          </Button>
        </motion.div>
      ) : null}
    </div>
  )
}
