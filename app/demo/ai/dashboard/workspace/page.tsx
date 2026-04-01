"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FolderOpen,
  FileText,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Star,
  Clock,
  Download,
  Edit3,
  Trash2,
  FolderPlus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type WsDoc = {
  id: string
  title: string
  type: string
  folder: string
  date: string
  isFavorite: boolean
  status: string
  generationJobId?: string | null
  hasStoredContent?: boolean
}

export default function WorkspacePage() {
  const pathname = usePathname()
  const wsBase = pathname.startsWith("/dashboard") ? "/dashboard/workspace" : "/demo/ai/dashboard/workspace"
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [selectedFolder, setSelectedFolder] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<WsDoc[]>([])
  const [folderRows, setFolderRows] = useState<
    { id: string; name: string; slug: string; icon_emoji: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [fr, ir] = await Promise.all([
          fetch("/api/workspace/folders", { credentials: "include" }),
          fetch("/api/workspace/items", { credentials: "include" }),
        ])
        const fj = await fr.json().catch(() => ({}))
        const ij = await ir.json().catch(() => ({}))
        if (!cancelled) {
          setFolderRows(fj.folders || [])
          setDocuments(ij.items || [])
        }
      } catch {
        if (!cancelled) setDocuments([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function downloadStoredContent(docId: string, title: string) {
    try {
      const res = await fetch(`/api/workspace/items/${encodeURIComponent(docId)}`, {
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.item?.contentText) return
      const blob = new Blob([data.item.contentText], { type: "text/markdown" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${title.replace(/[^\w\-]+/g, "_").slice(0, 80) || "document"}.md`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      /* ignore */
    }
  }

  const folders = useMemo(() => {
    const favCount = documents.filter((d) => d.isFavorite).length
    const bySlug = (slug: string) => documents.filter((d) => d.folder === slug).length
    const base = [
      { id: "all", name: "All Documents", count: documents.length, icon: "📁" },
      { id: "favorites", name: "Favorites", count: favCount, icon: "⭐" },
    ]
    const dynamic = folderRows.map((f) => ({
      id: f.slug,
      name: f.name,
      count: bySlug(f.slug),
      icon: f.icon_emoji || "📁",
    }))
    return [...base, ...dynamic]
  }, [documents, folderRows])

  const stats = useMemo(() => {
    const drafts = documents.filter((d) => d.status === "draft").length
    const completed = documents.filter((d) => d.status === "completed" || d.status === "saved").length
    const fav = documents.filter((d) => d.isFavorite).length
    return [
      { label: "Total Documents", value: documents.length },
      { label: "Favorites", value: fav },
      { label: "Drafts", value: drafts },
      { label: "Completed", value: completed },
    ]
  }, [documents])

  const filteredDocuments = documents.filter((doc) => {
    const matchesFolder =
      selectedFolder === "all" ||
      (selectedFolder === "favorites" ? doc.isFavorite : doc.folder === selectedFolder)
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Workspace</h1>
        <p className="text-white/60">
          {loading ? "Loading workspace from Supabase…" : "Manage saved templates and generated items."}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-4">
            <p className="text-white/50 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search your documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="glass">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Folders
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                      selectedFolder === folder.id
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{folder.icon}</span>
                      <span className="text-sm">{folder.name}</span>
                    </span>
                    <span className="text-xs text-white/40">{folder.count}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <Link
                            href={`${wsBase}/${doc.id}`}
                            className="text-white font-medium group-hover:text-indigo-400 transition-colors block"
                          >
                            {doc.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {doc.type}
                            </Badge>
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {doc.date}
                            </span>
                            <Badge
                              variant={doc.status === "completed" ? "success" : "warning"}
                              className="text-xs"
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors">
                          <Star
                            className={cn("w-4 h-4", doc.isFavorite && "fill-amber-400 text-amber-400")}
                          />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={!doc.hasStoredContent}
                          title={doc.hasStoredContent ? "Download draft (.md)" : "No stored draft"}
                          onClick={() => downloadStoredContent(doc.id, doc.title)}
                          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors disabled:opacity-30"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors">
                          <Star
                            className={cn("w-4 h-4", doc.isFavorite && "fill-amber-400 text-amber-400")}
                          />
                        </button>
                      </div>
                      <Link
                        href={`${wsBase}/${doc.id}`}
                        className="text-white font-medium mb-1 group-hover:text-indigo-400 transition-colors block"
                      >
                        {doc.title}
                      </Link>
                      <p className="text-white/50 text-sm mb-2">{doc.type}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">{doc.date}</span>
                        <Badge
                          variant={doc.status === "completed" ? "success" : "warning"}
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
