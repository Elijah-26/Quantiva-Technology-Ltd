"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Check,
  X,
  Eye,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const documents = [
  { id: 1, title: "GDPR Privacy Policy Template", type: "Privacy", category: "GDPR", status: "published", access: "free", author: "Admin", date: "Mar 26, 2024", downloads: 12543 },
  { id: 2, title: "Terms of Service - SaaS", type: "Legal", category: "Contracts", status: "published", access: "pro", author: "Admin", date: "Mar 25, 2024", downloads: 8932 },
  { id: 3, title: "Employment Contract Template", type: "HR", category: "HR", status: "draft", access: "pro", author: "John Doe", date: "Mar 24, 2024", downloads: 0 },
  { id: 4, title: "Cookie Policy Template", type: "Privacy", category: "GDPR", status: "published", access: "free", author: "Admin", date: "Mar 22, 2024", downloads: 9876 },
  { id: 5, title: "NDA Template", type: "Legal", category: "Contracts", status: "published", access: "business", author: "Admin", date: "Mar 20, 2024", downloads: 6543 },
  { id: 6, title: "Software License Agreement", type: "Legal", category: "IP", status: "review", access: "business", author: "Jane Smith", date: "Mar 18, 2024", downloads: 0 },
]

export default function AdminDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-white/60">
            Manage document templates, review submissions, and control access.
          </p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-5 gap-4"
      >
        {[
          { label: "Total Documents", value: 12543 },
          { label: "Published", value: 11234 },
          { label: "Drafts", value: 876 },
          { label: "Pending Review", value: 234 },
          { label: "Total Downloads", value: 284756 },
        ].map((stat, index) => (
          <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-white/50 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
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
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "published", "draft", "review"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
                selectedStatus === status
                  ? "bg-rose-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-white/5 border-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Document</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Category</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Access</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Author</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Downloads</th>
                    <th className="text-right p-4 text-white/50 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-rose-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{doc.title}</p>
                            <p className="text-white/50 text-sm">{doc.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            doc.status === "published"
                              ? "success"
                              : doc.status === "draft"
                              ? "warning"
                              : "info"
                          }
                          className="text-xs capitalize"
                        >
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={doc.access === "free" ? "success" : "info"}
                          className="text-xs capitalize"
                        >
                          {doc.access}
                        </Badge>
                      </td>
                      <td className="p-4 text-white/70 text-sm">{doc.author}</td>
                      <td className="p-4 text-white/70 text-sm">{doc.downloads.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {doc.status === "review" && (
                            <>
                              <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-emerald-400 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                              <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
