"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Download,
  Star,
  Clock,
  ChevronDown,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LibraryDoc = {
  id: string
  title: string
  description: string
  category: string
  jurisdiction: string
  accessLevel: string
  wordCount: number
  downloadCount: number
  rating: number
  isFavorite: boolean
  lastUpdated: string
  preview: string
  readMinutes: number
  complexity: "Low" | "Moderate" | "High"
  versions: { version: string; date: string; note: string }[]
  relatedIds: string[]
  source?: string
  createdByUserId?: string | null
  /** When academic, deep-link to Academic Research session instead of library detail. */
  documentKind?: "library" | "academic"
}

const accessLevels = [
  { id: "all", name: "All Access Levels" },
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "business", name: "Business" },
]

export default function DocumentsPage() {
  const pathname = usePathname()
  const docBase =
    pathname.startsWith("/dashboard") ? "/dashboard/documents" : "/demo/ai/dashboard/documents"

  const hrefForDoc = (doc: LibraryDoc) => {
    if (doc.documentKind === "academic") {
      return "/dashboard/ai-research/session/" + doc.id
    }
    return `${docBase}/${doc.id}`
  }

  const [documents, setDocuments] = useState<LibraryDoc[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([])
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("all")
  /** Filter library rows by how they were created (curated / scheduled auto / user on-demand). */
  const [selectedSource, setSelectedSource] = useState<
    "all" | "curated" | "scheduled" | "on_demand"
  >("all")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/library-documents", { credentials: "include" })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || "Failed to load documents")
        if (!cancelled) setDocuments(data.documents || [])
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of documents) {
      counts[d.category] = (counts[d.category] || 0) + 1
    }
    const rest = Object.entries(counts).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }))
    return [{ id: "all", name: "All Documents", count: documents.length }, ...rest]
  }, [documents])

  const jurisdictions = useMemo(() => {
    const ids = [...new Set(documents.map((d) => d.jurisdiction))].filter(Boolean)
    return ids.map((id) => ({
      id,
      name: id.toUpperCase(),
      code: id,
    }))
  }, [documents])

  const toggleJurisdiction = (id: string) => {
    setSelectedJurisdictions((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    )
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJurisdiction =
      selectedJurisdictions.length === 0 || selectedJurisdictions.includes(doc.jurisdiction)
    const matchesAccessLevel =
      selectedAccessLevel === "all" || doc.accessLevel === selectedAccessLevel
    const src =
      doc.documentKind === "academic"
        ? "academic_research"
        : doc.source ?? "curated"
    const matchesSource =
      selectedSource === "all" ||
      (selectedSource === "curated" && src === "curated") ||
      (selectedSource === "scheduled" && src === "scheduled") ||
      (selectedSource === "on_demand" && src === "on_demand")
    return (
      matchesCategory &&
      matchesSearch &&
      matchesJurisdiction &&
      matchesAccessLevel &&
      matchesSource
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Document Library</h1>
          <p className="text-white/60">
            {loading
              ? "Loading templates from your workspace…"
              : `Browse and search ${documents.length} items: library templates, on-demand drafts, and your Academic Research sessions.`}
          </p>
        </div>
      </motion.div>

      {loadError && (
        <p className="text-rose-400 text-sm rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
          {loadError}. Apply{" "}
          <code className="text-xs">supabase/migrations/20260401120000_core_product_tables.sql</code> if
          needed.
        </p>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="glass"
            className={cn(showFilters && "bg-white/10")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(selectedJurisdictions.length > 0 ||
              selectedAccessLevel !== "all" ||
              selectedSource !== "all") && (
              <span className="ml-2 w-5 h-5 rounded-full bg-indigo-500 text-xs flex items-center justify-center">
                {selectedJurisdictions.length +
                  (selectedAccessLevel !== "all" ? 1 : 0) +
                  (selectedSource !== "all" ? 1 : 0)}
              </span>
            )}
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

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Filters</h3>
            <button
              onClick={() => {
                setSelectedJurisdictions([])
                setSelectedAccessLevel("all")
                setSelectedSource("all")
              }}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Clear all
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white/60 text-sm mb-2">Jurisdictions</h4>
              <div className="flex flex-wrap gap-2">
                {jurisdictions.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => toggleJurisdiction(j.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      selectedJurisdictions.includes(j.id)
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {j.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white/60 text-sm mb-2">Access Level</h4>
              <div className="flex flex-wrap gap-2">
                {accessLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedAccessLevel(level.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      selectedAccessLevel === level.id
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {level.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white/60 text-sm mb-2">Origin</h4>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "all" as const, name: "All origins" },
                  { id: "curated" as const, name: "Curated library" },
                  { id: "scheduled" as const, name: "Auto (scheduled cron)" },
                  { id: "on_demand" as const, name: "My on-demand drafts" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSource(opt.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm transition-colors",
                    selectedSource === opt.id
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {opt.name}
                </button>
              ))}
            </div>
            <p className="text-white/35 text-xs mt-2">
              Academic Research sessions appear when &quot;All origins&quot; is selected.
            </p>
          </div>
        </motion.div>
      )}

      {/* Active Filters */}
      {(selectedJurisdictions.length > 0 ||
        selectedAccessLevel !== "all" ||
        selectedSource !== "all") && (
        <div className="flex flex-wrap gap-2">
          {selectedJurisdictions.map((j) => (
            <span
              key={j}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm"
            >
              {jurisdictions.find((jur) => jur.id === j)?.name}
              <button onClick={() => toggleJurisdiction(j)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedAccessLevel !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm">
              {accessLevels.find((l) => l.id === selectedAccessLevel)?.name}
              <button onClick={() => setSelectedAccessLevel("all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSource !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm">
              {selectedSource === "curated"
                ? "Curated library"
                : selectedSource === "scheduled"
                  ? "Auto (cron)"
                  : "On-demand drafts"}
              <button type="button" onClick={() => setSelectedSource("all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              selectedCategory === category.id
                ? "bg-indigo-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {category.name}
            <span className="ml-2 text-xs opacity-60">{category.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Documents Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="glass-card border-0 hover:bg-white/[0.06] transition-colors group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={cn("w-4 h-4", doc.isFavorite && "fill-amber-400 text-amber-400")}
                        />
                      </button>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Link
                    href={hrefForDoc(doc)}
                    className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                  >
                    <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">{doc.description}</p>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find((c) => c.id === doc.category)?.name}
                    </Badge>
                    <Badge
                      variant={doc.accessLevel === "free" ? "success" : "info"}
                      className="text-xs capitalize"
                    >
                      {doc.accessLevel}
                    </Badge>
                    {doc.documentKind === "academic" && (
                      <Badge variant="outline" className="text-xs border-emerald-400/40 text-emerald-300">
                        Academic
                      </Badge>
                    )}
                    {doc.source === "on_demand" && (
                      <Badge variant="outline" className="text-xs border-indigo-400/40 text-indigo-300">
                        On demand
                      </Badge>
                    )}
                    {doc.source === "scheduled" && (
                      <Badge variant="outline" className="text-xs border-violet-400/40 text-violet-300">
                        Auto
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/40">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {doc.downloadCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {doc.rating}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <Link
                    href={hrefForDoc(doc)}
                    className="mt-3 inline-flex text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    {doc.documentKind === "academic" ? "Open session" : "View template details"}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <Link
                    href={hrefForDoc(doc)}
                    className="min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                  >
                    <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === doc.category)?.name}
                      </Badge>
                      <Badge
                        variant={doc.accessLevel === "free" ? "success" : "info"}
                        className="text-xs capitalize"
                      >
                        {doc.accessLevel}
                      </Badge>
                      {doc.documentKind === "academic" && (
                        <Badge variant="outline" className="text-xs border-emerald-400/40 text-emerald-300">
                          Academic
                        </Badge>
                      )}
                      {doc.source === "on_demand" && (
                        <Badge variant="outline" className="text-xs border-indigo-400/40 text-indigo-300">
                          On demand
                        </Badge>
                      )}
                      {doc.source === "scheduled" && (
                        <Badge variant="outline" className="text-xs border-violet-400/40 text-violet-300">
                          Auto
                        </Badge>
                      )}
                      <span className="text-white/40 text-xs">
                        {doc.wordCount.toLocaleString()} words
                      </span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-3 text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {doc.downloadCount.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {doc.rating}
                    </span>
                  </div>
                  <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors">
                    <Star
                      className={cn("w-4 h-4", doc.isFavorite && "fill-amber-400 text-amber-400")}
                    />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
