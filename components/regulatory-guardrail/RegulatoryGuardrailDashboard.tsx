'use client'

/**
 * Regulatory Guardrail Dashboard
 * 
 * Main dashboard component for the Regulatory Guardrail feature.
 * Provides overview stats, compliance history, ruleset status, and settings.
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  ExternalLink,
  Download,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  FileText,
  Mail,
  Linkedin,
  Globe,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

interface AuditLogEntry {
  check_id: string;
  source: 'gmail' | 'linkedin' | 'manual' | 'api' | 'extension';
  text_snippet: string;
  flag_count: number;
  severity_summary: {
    violation: number;
    warning: number;
    advisory: number;
  };
  ruleset: string[];
  created_at: string;
}

interface UserQuota {
  checks_used: number;
  checks_remaining: number;
  tier: 'free' | 'pro' | 'enterprise';
}

interface Ruleset {
  id: string;
  name: string;
  description: string;
  version: string;
  last_updated: string;
  rule_count: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    check_id: 'chk-001',
    source: 'gmail',
    text_snippet: 'Our investment strategy guarantees returns of up to 15% annually...',
    flag_count: 2,
    severity_summary: { violation: 1, warning: 1, advisory: 0 },
    ruleset: ['FCA'],
    created_at: '2026-03-26T10:30:00Z',
  },
  {
    check_id: 'chk-002',
    source: 'linkedin',
    text_snippet: 'Past performance shows consistent growth over the last 5 years...',
    flag_count: 1,
    severity_summary: { violation: 0, warning: 1, advisory: 0 },
    ruleset: ['FCA'],
    created_at: '2026-03-25T14:22:00Z',
  },
  {
    check_id: 'chk-003',
    source: 'manual',
    text_snippet: 'This tax-free investment opportunity is available for a limited time...',
    flag_count: 3,
    severity_summary: { violation: 1, warning: 2, advisory: 0 },
    ruleset: ['FCA'],
    created_at: '2026-03-24T09:15:00Z',
  },
  {
    check_id: 'chk-004',
    source: 'extension',
    text_snippet: 'Join our collective investment scheme for exclusive returns...',
    flag_count: 2,
    severity_summary: { violation: 1, warning: 0, advisory: 1 },
    ruleset: ['FCA', 'CQC'],
    created_at: '2026-03-23T16:45:00Z',
  },
  {
    check_id: 'chk-005',
    source: 'gmail',
    text_snippet: 'The patient showed guaranteed improvement after treatment...',
    flag_count: 1,
    severity_summary: { violation: 1, warning: 0, advisory: 0 },
    ruleset: ['CQC'],
    created_at: '2026-03-22T11:20:00Z',
  },
];

const MOCK_RULESETS: Ruleset[] = [
  {
    id: 'FCA',
    name: 'Financial Conduct Authority (UK)',
    description: 'FCA financial promotion rules for investment communications',
    version: '1.0.0',
    last_updated: '2026-03-26',
    rule_count: 26,
  },
  {
    id: 'CQC',
    name: 'Care Quality Commission (UK)',
    description: 'CQC regulations for health and social care communications',
    version: '1.0.0',
    last_updated: '2026-03-26',
    rule_count: 16,
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Overview Panel with stats and charts
 */
function OverviewPanel({ quota }: { quota: UserQuota }) {
  // Calculate stats from mock data
  const totalChecks = MOCK_AUDIT_LOG.length;
  const totalFlags = MOCK_AUDIT_LOG.reduce((sum, entry) => sum + entry.flag_count, 0);
  const violations = MOCK_AUDIT_LOG.reduce((sum, entry) => sum + entry.severity_summary.violation, 0);
  const warnings = MOCK_AUDIT_LOG.reduce((sum, entry) => sum + entry.severity_summary.warning, 0);
  const advisories = MOCK_AUDIT_LOG.reduce((sum, entry) => sum + entry.severity_summary.advisory, 0);

  // Severity distribution data
  const severityData = [
    { name: 'Violations', value: violations, color: '#EF4444' },
    { name: 'Warnings', value: warnings, color: '#F59E0B' },
    { name: 'Advisories', value: advisories, color: '#3B82F6' },
  ];

  // Source distribution data
  const sourceData = [
    { name: 'Gmail', count: MOCK_AUDIT_LOG.filter(e => e.source === 'gmail').length },
    { name: 'LinkedIn', count: MOCK_AUDIT_LOG.filter(e => e.source === 'linkedin').length },
    { name: 'Manual', count: MOCK_AUDIT_LOG.filter(e => e.source === 'manual').length },
    { name: 'Extension', count: MOCK_AUDIT_LOG.filter(e => e.source === 'extension').length },
  ];

  // Ruleset distribution data
  const rulesetData = [
    { name: 'FCA', count: MOCK_AUDIT_LOG.filter(e => e.ruleset.includes('FCA')).length },
    { name: 'CQC', count: MOCK_AUDIT_LOG.filter(e => e.ruleset.includes('CQC')).length },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Checks</p>
                <p className="text-3xl font-bold text-white mt-1">{totalChecks}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <BarChart3 className="text-indigo-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Flags</p>
                <p className="text-3xl font-bold text-white mt-1">{totalFlags}</p>
                <p className="text-xs text-gray-500 mt-1">Across all checks</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="text-amber-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Violations</p>
                <p className="text-3xl font-bold text-rose-400 mt-1">{violations}</p>
                <p className="text-xs text-gray-500 mt-1">Require attention</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertOctagon className="text-rose-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">AI Rewrites</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {quota.tier === 'free' ? '—' : '87%'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {quota.tier === 'free' ? 'Pro feature' : 'Acceptance rate'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="text-emerald-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white text-lg">Flags by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#05060B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white text-lg">Checks by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#A7ACB8" fontSize={12} />
                  <YAxis stroke="#A7ACB8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#05060B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ruleset Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white text-lg">Checks by Ruleset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rulesetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#A7ACB8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#A7ACB8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#05060B',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Free Tier Banner */}
      {quota.tier === 'free' && (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Unlock Unlimited Checks & AI Rewrites
                </h3>
                <p className="text-gray-400 text-sm">
                  Upgrade to Pro for unlimited compliance checks and AI-powered rewrite suggestions.
                </p>
              </div>
              <Button className="btn-primary whitespace-nowrap">
                Upgrade to Pro
                <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Compliance History Panel
 */
function ComplianceHistoryPanel() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'gmail':
        return <Mail size={16} className="text-blue-400" />;
      case 'linkedin':
        return <Linkedin size={16} className="text-blue-600" />;
      case 'manual':
        return <FileText size={16} className="text-gray-400" />;
      case 'extension':
        return <Globe size={16} className="text-indigo-400" />;
      default:
        return <Globe size={16} className="text-gray-400" />;
    }
  };

  const getSeverityBadge = (summary: AuditLogEntry['severity_summary']) => {
    if (summary.violation > 0) {
      return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">{summary.violation} Violation{summary.violation > 1 ? 's' : ''}</Badge>;
    }
    if (summary.warning > 0) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{summary.warning} Warning{summary.warning > 1 ? 's' : ''}</Badge>;
    }
    if (summary.advisory > 0) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{summary.advisory} Advisory</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Clear</Badge>;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Compliance History</CardTitle>
            <CardDescription className="text-gray-400">
              View all your compliance checks and flagged issues
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="btn-secondary">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Source</TableHead>
              <TableHead className="text-gray-400">Text Snippet</TableHead>
              <TableHead className="text-gray-400">Flags</TableHead>
              <TableHead className="text-gray-400">Severity</TableHead>
              <TableHead className="text-gray-400"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_AUDIT_LOG.map((entry) => (
              <React.Fragment key={entry.check_id}>
                <TableRow
                  className="border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedRow(expandedRow === entry.check_id ? null : entry.check_id)}
                >
                  <TableCell className="text-white">
                    {new Date(entry.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    <div className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSourceIcon(entry.source)}
                      <span className="text-white capitalize">{entry.source}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 max-w-xs truncate">
                    "{entry.text_snippet}"
                  </TableCell>
                  <TableCell className="text-white">{entry.flag_count}</TableCell>
                  <TableCell>{getSeverityBadge(entry.severity_summary)}</TableCell>
                  <TableCell>
                    {expandedRow === entry.check_id ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </TableCell>
                </TableRow>
                {expandedRow === entry.check_id && (
                  <TableRow className="border-white/5 bg-white/5">
                    <TableCell colSpan={6} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Check ID</span>
                          <p className="text-white font-mono text-sm">{entry.check_id}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Rulesets Checked</span>
                          <div className="flex gap-2 mt-1">
                            {entry.ruleset.map((r) => (
                              <Badge key={r} variant="outline" className="border-white/20 text-gray-300">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">Full Text Snippet</span>
                          <p className="text-gray-300 text-sm mt-1">"{entry.text_snippet}"</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Ruleset Status Panel
 */
function RulesetStatusPanel() {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Active Rulesets</CardTitle>
          <CardDescription className="text-gray-400">
            Rulesets currently active for compliance checking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_RULESETS.map((ruleset) => (
              <div
                key={ruleset.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Shield className="text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{ruleset.name}</h4>
                    <p className="text-gray-400 text-sm">{ruleset.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">Version {ruleset.version}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{ruleset.rule_count} rules</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Last updated</p>
                  <p className="text-white text-sm">
                    {new Date(ruleset.last_updated).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <a
                    href="#"
                    className="text-indigo-400 text-xs hover:text-indigo-300 inline-flex items-center gap-1 mt-2"
                  >
                    View Rules
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Regulation Update Log</CardTitle>
          <CardDescription className="text-gray-400">
            Recent changes to compliance rulesets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-emerald-400" size={16} />
              </div>
              <div>
                <p className="text-white text-sm">FCA ruleset updated</p>
                <p className="text-gray-400 text-xs">Added 3 new rules for cryptoasset promotions</p>
                <p className="text-gray-500 text-xs mt-1">26 Mar 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Info className="text-blue-400" size={16} />
              </div>
              <div>
                <p className="text-white text-sm">CQC ruleset updated</p>
                <p className="text-gray-400 text-xs">Modified rule CQC-002 for clarity</p>
                <p className="text-gray-500 text-xs mt-1">25 Mar 2026</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-emerald-400" size={16} />
              </div>
              <div>
                <p className="text-white text-sm">FCA ruleset updated</p>
                <p className="text-gray-400 text-xs">Initial release with 26 rules</p>
                <p className="text-gray-500 text-xs mt-1">24 Mar 2026</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Extension Install Banner
 */
function ExtensionInstallBanner() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if extension is installed via heartbeat
    // This would be implemented with actual extension detection
    const checkExtension = () => {
      // Mock check - in production, this would check for extension heartbeat
      setIsInstalled(false);
    };
    checkExtension();
  }, []);

  if (isInstalled) return null;

  return (
    <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Zap className="text-indigo-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Install the Chrome Extension
              </h3>
              <p className="text-gray-400 text-sm">
                Get real-time compliance checking in Gmail, LinkedIn, and across the web.
              </p>
            </div>
          </div>
          <Button className="btn-primary whitespace-nowrap">
            Install Extension
            <ExternalLink size={16} className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Free Tier Quota Banner
 */
function QuotaBanner({ quota }: { quota: UserQuota }) {
  if (quota.tier !== 'free') return null;

  const percentage = (quota.checks_used / (quota.checks_used + quota.checks_remaining)) * 100;

  return (
    <Card className="glass-card mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Monthly Check Quota</span>
              <span className="text-gray-400 text-sm">
                {quota.checks_used} / {quota.checks_used + quota.checks_remaining} used
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-gray-400 text-xs mt-2">
              Free tier includes 50 checks per month. Resets on the 1st of each month.
            </p>
          </div>
          <Button className="btn-primary whitespace-nowrap">
            Upgrade to Pro
            <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Upgrade Modal
 */
function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card-strong border-white/10 max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-indigo-400" size={32} />
          </div>
          <DialogTitle className="text-white text-center text-xl">
            AI Rewrite is a Pro Feature
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Upgrade to Pro for AI-powered rewrite suggestions and unlimited compliance checks.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>Unlimited compliance checks</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>AI-powered rewrite suggestions</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle size={18} className="text-emerald-400" />
            <span>API access</span>
          </div>
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-3xl font-bold text-white">£19</span>
              <span className="text-gray-400">/month</span>
            </div>
            <Button className="btn-primary w-full">Upgrade to Pro</Button>
            <Button variant="ghost" className="w-full mt-2 text-gray-400" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function RegulatoryGuardrailDashboard() {
  const [quota] = useState<UserQuota>({
    checks_used: 12,
    checks_remaining: 38,
    tier: 'free',
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // In production, this would fetch from the API
  useEffect(() => {
    // Mock data loading
    const loadQuota = async () => {
      // const response = await fetch('/api/v1/compliance/quota');
      // const data = await response.json();
      // setQuota(data);
    };
    loadQuota();
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Shield className="text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-white">
                Regulatory Guardrail
              </h1>
              <p className="text-gray-400 text-sm">
                AI-powered compliance checking for your communications
              </p>
            </div>
          </div>
        </div>

        {/* Extension Install Banner */}
        <ExtensionInstallBanner />

        {/* Quota Banner (Free users only) */}
        <QuotaBanner quota={quota} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <BarChart3 size={16} className="mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Clock size={16} className="mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="rulesets"
              className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Shield size={16} className="mr-2" />
              Rulesets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewPanel quota={quota} />
          </TabsContent>

          <TabsContent value="history">
            <ComplianceHistoryPanel />
          </TabsContent>

          <TabsContent value="rulesets">
            <RulesetStatusPanel />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-gray-500 text-center">
            <Info size={14} className="inline mr-1" />
            This is a flag for review, not a compliance verdict. Consult a qualified compliance advisor for definitive guidance.
          </p>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
