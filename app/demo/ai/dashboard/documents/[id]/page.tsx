'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Star,
  Clock,
  FileText,
  History,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getDemoLibraryDocumentById,
  DEMO_LIBRARY_DOCUMENTS,
} from '@/lib/demo/documents-mock'

const categoryLabels: Record<string, string> = {
  all: 'All Documents',
  privacy: 'Privacy & GDPR',
  contracts: 'Contracts',
  hr: 'HR & Employment',
  corporate: 'Corporate',
  ip: 'Intellectual Property',
  compliance: 'Compliance',
  finance: 'Finance',
}

export default function DocumentDetailDemoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const doc = getDemoLibraryDocumentById(id)

  if (!doc) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-white/60">No document found for this id.</p>
        <Button variant="outline" onClick={() => router.push('/demo/ai/dashboard/documents')}>
          Back to library
        </Button>
      </div>
    )
  }

  const related = doc.relatedIds
    .map((rid) => DEMO_LIBRARY_DOCUMENTS.find((d) => d.id === rid))
    .filter(Boolean) as typeof DEMO_LIBRARY_DOCUMENTS

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-white/70">
            <Link href="/demo/ai/dashboard/documents">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{doc.title}</h1>
            <p className="text-white/50 text-sm">{doc.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="gradient"
            onClick={() => toast.success('Demo only — no file downloaded')}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button
            variant="glass"
            onClick={() => toast.success('Demo only — saved to mock workspace')}
          >
            Save to workspace
          </Button>
          {doc.accessLevel !== 'free' && (
            <Button
              variant="glass"
              asChild
            >
              <Link href="/demo/ai/dashboard/billing">Upgrade for access</Link>
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 space-y-4"
        >
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
              <CardDescription className="text-white/50">
                Sample excerpt — full document unlocks per plan (demo).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-navy-900/80 p-4 font-mono text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {doc.preview}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="size-5 text-indigo-400" />
                <CardTitle className="text-white">Version history</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {doc.versions.map((v) => (
                <div
                  key={v.version}
                  className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-mono text-white">v{v.version}</span>
                    <p className="text-sm text-white/50">{v.note}</p>
                  </div>
                  <span className="text-xs text-white/40">{v.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Category</span>
                <Badge variant="secondary">{categoryLabels[doc.category] ?? doc.category}</Badge>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Word count</span>
                <span className="text-white">{doc.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Est. read</span>
                <span className="flex items-center gap-1 text-white">
                  <Clock className="size-3.5" />
                  {doc.readMinutes} min
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Complexity</span>
                <span className="text-white">{doc.complexity}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Downloads</span>
                <span className="text-white">{doc.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Rating</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="size-3.5 fill-amber-400" />
                  {doc.rating} / 5
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Access</span>
                <Badge variant={doc.accessLevel === 'free' ? 'success' : 'info'} className="capitalize">
                  {doc.accessLevel}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Related templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/demo/ai/dashboard/documents/${r.id}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 p-3 text-sm text-white/80 transition-colors hover:border-indigo-500/40 hover:bg-white/5"
                >
                  <FileText className="size-4 shrink-0 text-indigo-400" />
                  <span className="line-clamp-2">{r.title}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
