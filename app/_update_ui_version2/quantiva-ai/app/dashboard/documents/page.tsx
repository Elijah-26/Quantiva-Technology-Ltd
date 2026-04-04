"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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

// Mock data
const categories = [
  { id: "all", name: "All Documents", count: 1247 },
  { id: "privacy", name: "Privacy & GDPR", count: 156 },
  { id: "contracts", name: "Contracts", count: 234 },
  { id: "hr", name: "HR & Employment", count: 189 },
  { id: "corporate", name: "Corporate", count: 145 },
  { id: "ip", name: "Intellectual Property", count: 98 },
  { id: "compliance", name: "Compliance", count: 267 },
  { id: "finance", name: "Finance", count: 158 },
]

const jurisdictions = [
  { id: "uk", name: "United Kingdom", code: "GB" },
  { id: "us", name: "United States", code: "US" },
  { id: "eu", name: "European Union", code: "EU" },
  { id: "ca", name: "Canada", code: "CA" },
  { id: "au", name: "Australia", code: "AU" },
]

const accessLevels = [
  { id: "all", name: "All Access Levels" },
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "business", name: "Business" },
]

const documents = [
  {
    id: 1,
    title: "GDPR Privacy Policy Template",
    description: "Comprehensive privacy policy compliant with GDPR regulations",
    category: "privacy",
    jurisdiction: "eu",
    accessLevel: "free",
    wordCount: 2500,
    downloadCount: 12543,
    rating: 4.8,
    isFavorite: false,
    lastUpdated: "2024-03-15",
  },
  {
    id: 2,
    title: "Employment Contract Template",
    description: "Standard employment contract with customizable clauses",
    category: "hr",
    jurisdiction: "uk",
    accessLevel: "pro",
    wordCount: 3200,
    downloadCount: 8932,
    rating: 4.7,
    isFavorite: true,
    lastUpdated: "2024-03-10",
  },
  {
    id: 3,
    title: "Non-Disclosure Agreement",
    description: "Mutual NDA template for business partnerships",
    category: "contracts",
    jurisdiction: "us",
    accessLevel: "free",
    wordCount: 1800,
    downloadCount: 15678,
    rating: 4.9,
    isFavorite: false,
    lastUpdated: "2024-03-12",
  },
  {
    id: 4,
    title: "Terms of Service - SaaS",
    description: "Terms of service specifically for SaaS businesses",
    category: "corporate",
    jurisdiction: "us",
    accessLevel: "pro",
    wordCount: 4500,
    downloadCount: 7234,
    rating: 4.6,
    isFavorite: true,
    lastUpdated: "2024-03-08",
  },
  {
    id: 5,
    title: "Cookie Policy Template",
    description: "Cookie consent policy compliant with ePrivacy Directive",
    category: "privacy",
    jurisdiction: "eu",
    accessLevel: "free",
    wordCount: 1200,
    downloadCount: 9876,
    rating: 4.5,
    isFavorite: false,
    lastUpdated: "2024-03-14",
  },
  {
    id: 6,
    title: "Software License Agreement",
    description: "End-user license agreement for software products",
    category: "ip",
    jurisdiction: "us",
    accessLevel: "business",
    wordCount: 3800,
    downloadCount: 5432,
    rating: 4.7,
    isFavorite: false,
    lastUpdated: "2024-03-05",
  },
]

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([])
  const [selectedAccessLevel, setSelectedAccessLevel] = useState("all")

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
    return matchesCategory && matchesSearch && matchesJurisdiction && matchesAccessLevel
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Document Library</h1>
        <p className="text-white/60">
          Browse and search our collection of {categories[0].count}+ regulatory document templates.
        </p>
      </motion.div>

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
            {(selectedJurisdictions.length > 0 || selectedAccessLevel !== "all") && (
              <span className="ml-2 w-5 h-5 rounded-full bg-indigo-500 text-xs flex items-center justify-center">
                {selectedJurisdictions.length + (selectedAccessLevel !== "all" ? 1 : 0)}
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
        </motion.div>
      )}

      {/* Active Filters */}
      {(selectedJurisdictions.length > 0 || selectedAccessLevel !== "all") && (
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
                className="glass-card border-0 hover:bg-white/[0.06] transition-colors cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1">
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
                  <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-3 line-clamp-2">{doc.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find((c) => c.id === doc.category)?.name}
                    </Badge>
                    <Badge
                      variant={doc.accessLevel === "free" ? "success" : "info"}
                      className="text-xs capitalize"
                    >
                      {doc.accessLevel}
                    </Badge>
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === doc.category)?.name}
                      </Badge>
                      <Badge
                        variant={doc.accessLevel === "free" ? "success" : "info"}
                        className="text-xs capitalize"
                      >
                        {doc.accessLevel}
                      </Badge>
                      <span className="text-white/40 text-xs">
                        {doc.wordCount.toLocaleString()} words
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
