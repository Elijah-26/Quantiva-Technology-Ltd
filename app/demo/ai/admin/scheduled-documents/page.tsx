"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ScheduledRow = {
  id: string
  title: string
  description: string
  category: string
  jurisdiction: string
  preview: string
  word_count: number
  created_at: string
  updated_at: string
  generation_metadata: Record<string, unknown> | null
  source: string
}

type DetailDoc = ScheduledRow & {
  full_content: string
  versions: unknown
}

export default function AdminScheduledDocumentsPage() {
  const [rows, setRows] = useState<ScheduledRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailDoc | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/scheduled-documents?limit=100", {
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to load")
        setRows([])
        return
      }
      setRows(data.documents || [])
      setTotal(data.total ?? 0)
    } catch {
      setError("Network error")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openDetail = async (id: string) => {
    setDetailId(id)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/scheduled-documents/${id}`, {
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.document) {
        setDetail(data.document as DetailDoc)
      }
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const pipelineLabel = (m: Record<string, unknown> | null) =>
    typeof m?.pipeline === "string" ? m.pipeline : "—"

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Scheduled documents</h1>
          <p className="text-white/60">
            Auto-generated library entries from the daily cron (taxonomy, on-demand simulation,
            academic single-shot, hybrid). Includes generation metadata and exports.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-white/15 bg-white/5 text-white"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </motion.div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title…"
            className="pl-9 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Badge variant="secondary" className="text-white/80">
          {total} total
        </Badge>
      </div>

      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/10 text-white/50">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Pipeline</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Jurisdiction</th>
                <th className="p-4 font-medium">Words</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-white/50">
                    No scheduled documents yet.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="p-4 text-white font-medium max-w-xs truncate">{r.title}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                        {pipelineLabel(r.generation_metadata)}
                      </Badge>
                    </td>
                    <td className="p-4 text-white/70">{r.category}</td>
                    <td className="p-4 text-white/70">{r.jurisdiction}</td>
                    <td className="p-4 text-white/70">{r.word_count}</td>
                    <td className="p-4 text-white/50 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {r.created_at?.slice(0, 10) || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-indigo-300 h-8"
                          onClick={() => void openDetail(r.id)}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/80 h-8" asChild>
                          <a
                            href={`/api/admin/scheduled-documents/${r.id}/export?format=docx`}
                            download
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            DOCX
                          </a>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white/80 h-8" asChild>
                          <a
                            href={`/api/admin/scheduled-documents/${r.id}/export?format=pdf`}
                            download
                          >
                            PDF
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {detail?.title || "Document details"}
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : detail ? (
            <div className="space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-2 text-white/70">
                <p>
                  <span className="text-white/40">Category:</span> {detail.category}
                </p>
                <p>
                  <span className="text-white/40">Jurisdiction:</span> {detail.jurisdiction}
                </p>
                <p>
                  <span className="text-white/40">Words:</span> {detail.word_count}
                </p>
                <p>
                  <span className="text-white/40">Created:</span> {detail.created_at}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Generation metadata</p>
                <pre
                  className={cn(
                    "rounded-lg bg-black/40 border border-white/10 p-3 text-xs overflow-x-auto",
                    "text-emerald-200/90"
                  )}
                >
                  {JSON.stringify(detail.generation_metadata ?? {}, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600" asChild>
                  <a href={`/api/admin/scheduled-documents/${detail.id}/export?format=docx`} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download DOCX
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href={`/api/admin/scheduled-documents/${detail.id}/export?format=pdf`} download>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              </div>
              <div>
                <p className="text-white/50 mb-1">Preview / body (markdown)</p>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 max-h-64 overflow-y-auto text-white/80 whitespace-pre-wrap text-xs">
                  {(detail.full_content || detail.preview || "").slice(0, 12000)}
                  {(detail.full_content || "").length > 12000 ? "…" : ""}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
