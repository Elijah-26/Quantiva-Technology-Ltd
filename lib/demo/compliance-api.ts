/**
 * Regulatory Guardrail - Compliance API Module
 * 
 * This module provides the core compliance checking functionality for the
 * Quantiva Regulatory Guardrail feature. It handles pattern matching against
 * regulatory rulesets, quota enforcement, and audit logging.
 * 
 * Architecture Notes:
 * - Pattern matching is synchronous and fast (<100ms for typical text)
 * - AI rewrite suggestions are async and only available for Pro users
 * - Full text is NEVER logged - only first 100 chars as snippet
 * - All operations are designed to meet <500ms p95 for realtime mode
 */

import fcaRuleset from './rulesets/fca.json';
import cqcRuleset from './rulesets/cqc.json';

// ============================================================================
// TYPES
// ============================================================================

export type Severity = 'violation' | 'warning' | 'advisory';
export type CheckMode = 'realtime' | 'full';
export type Source = 'gmail' | 'linkedin' | 'manual' | 'api' | 'extension';

export interface Flag {
  phrase: string;
  start_index: number;
  end_index: number;
  severity: Severity;
  rule_id: string;
  rule_body: string;
  explanation: string;
  rewrite: string | null;
}

export interface ComplianceCheckRequest {
  text: string;
  ruleset?: string[];
  mode?: CheckMode;
  user_id: string;
  source?: Source;
}

export interface ComplianceCheckResponse {
  flags: Flag[];
  check_id: string;
  checks_remaining: number;
  disclaimer: string;
}

export interface Rule {
  rule_id: string;
  regulatory_body: string;
  rule_title: string;
  rule_text: string;
  trigger_patterns: string[];
  trigger_type: 'exact_match' | 'regex';
  severity: Severity;
  explanation_template: string;
  source_url: string;
  last_updated: string;
}

export interface Ruleset {
  ruleset_id: string;
  ruleset_name: string;
  version: string;
  last_updated: string;
  description: string;
  source_url: string;
  disclaimer: string;
  rules: Rule[];
}

export interface UserQuota {
  user_id: string;
  month: string;
  checks_used: number;
  checks_remaining: number;
  tier: 'free' | 'pro' | 'enterprise';
  reset_at: Date;
}

export interface AuditLogEntry {
  check_id: string;
  user_id: string;
  source: Source;
  text_snippet: string;
  flag_count: number;
  severity_summary: {
    violation: number;
    warning: number;
    advisory: number;
  };
  ruleset: string[];
  created_at: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_TEXT_LENGTH = 5000;
const TEXT_SNIPPET_LENGTH = 100;
const FREE_TIER_MONTHLY_LIMIT = 50;

// Default rulesets to check if none specified
const DEFAULT_RULESETS = ['FCA', 'CQC'];

function newCheckId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `chk-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// In-memory ruleset cache
const RULESET_CACHE: Map<string, Ruleset> = new Map();

// ============================================================================
// RULESET LOADER
// ============================================================================

/**
 * Initialize the ruleset cache with built-in rulesets.
 * In production, this would load from a database or file system.
 */
export function initializeRulesetCache(): void {
  RULESET_CACHE.set('FCA', fcaRuleset as Ruleset);
  RULESET_CACHE.set('CQC', cqcRuleset as Ruleset);
  if (process.env.NODE_ENV === 'development') {
    console.log('[Regulatory Guardrail] Rulesets loaded:', Array.from(RULESET_CACHE.keys()));
  }
}

/**
 * Load a ruleset by ID.
 * Returns null if ruleset not found.
 */
export function loadRuleset(rulesetId: string): Ruleset | null {
  return RULESET_CACHE.get(rulesetId.toUpperCase()) || null;
}

/**
 * Get all available rulesets.
 */
export function getAvailableRulesets(): { id: string; name: string; description: string }[] {
  return Array.from(RULESET_CACHE.entries()).map(([id, ruleset]) => ({
    id,
    name: ruleset.ruleset_name,
    description: ruleset.description,
  }));
}

// ============================================================================
// PATTERN MATCHING ENGINE
// ============================================================================

/**
 * Find all matches for a single rule in the given text.
 * Returns an array of flag objects.
 */
function findRuleMatches(text: string, rule: Rule): Flag[] {
  const flags: Flag[] = [];
  const textLower = text.toLowerCase();

  for (const pattern of rule.trigger_patterns) {
    const patternLower = pattern.toLowerCase();

    if (rule.trigger_type === 'exact_match') {
      // Exact match: find all occurrences
      let index = textLower.indexOf(patternLower);
      while (index !== -1) {
        const matchedText = text.substring(index, index + pattern.length);
        flags.push(createFlag(text, matchedText, index, rule));
        index = textLower.indexOf(patternLower, index + 1);
      }
    } else if (rule.trigger_type === 'regex') {
      // Regex match: compile and test
      try {
        const regex = new RegExp(pattern, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          flags.push(createFlag(text, match[0], match.index, rule));
          // Prevent infinite loop on zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } catch (e) {
        console.error(`[Regulatory Guardrail] Invalid regex pattern: ${pattern}`, e);
      }
    }
  }

  return flags;
}

/**
 * Create a flag object from a match.
 */
function createFlag(_text: string, phrase: string, startIndex: number, rule: Rule): Flag {
  const explanation = rule.explanation_template.replace('{phrase}', phrase);
  
  return {
    phrase,
    start_index: startIndex,
    end_index: startIndex + phrase.length,
    severity: rule.severity,
    rule_id: rule.rule_id,
    rule_body: rule.rule_text,
    explanation,
    rewrite: null, // Will be populated by AI for Pro users
  };
}

/**
 * Run pattern matching against all specified rulesets.
 * This is the core compliance check function.
 */
export function runPatternMatching(text: string, rulesetIds: string[]): Flag[] {
  const allFlags: Flag[] = [];

  for (const rulesetId of rulesetIds) {
    const ruleset = loadRuleset(rulesetId);
    if (!ruleset) {
      console.warn(`[Regulatory Guardrail] Ruleset not found: ${rulesetId}`);
      continue;
    }

    for (const rule of ruleset.rules) {
      const flags = findRuleMatches(text, rule);
      allFlags.push(...flags);
    }
  }

  // Sort by severity (violation > warning > advisory) then by position
  const severityOrder = { violation: 0, warning: 1, advisory: 2 };
  allFlags.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.start_index - b.start_index;
  });

  return allFlags;
}

// ============================================================================
// AI REWRITE GENERATION (Pro Feature)
// ============================================================================

/**
 * Generate AI-powered rewrite suggestions for flagged content.
 * This is a Pro-only feature.
 * 
 * Note: This is a mock implementation. In production, this would call
 * Claude Sonnet or GPT-4o via the Quantiva AI inference backend.
 */
export async function generateRewriteSuggestions(
  _text: string,
  flags: Flag[],
  userTier: 'free' | 'pro' | 'enterprise'
): Promise<Flag[]> {
  // Free users don't get AI rewrites
  if (userTier === 'free') {
    return flags.map(f => ({ ...f, rewrite: null }));
  }

  // In production, this would call the AI model
  // For now, return generic suggestions based on severity
  return flags.map(flag => {
    let rewrite: string | null = null;
    
    if (flag.severity === 'violation') {
      rewrite = `[REVIEW REQUIRED] The phrase "${flag.phrase}" may violate ${flag.rule_id}. Consider rephrasing to remove the problematic language while maintaining your intended meaning.`;
    } else if (flag.severity === 'warning') {
      rewrite = `[CONSIDER REVISING] The phrase "${flag.phrase}" triggered ${flag.rule_id}. You may want to add appropriate context or disclaimers.`;
    }
    // Advisory flags don't get rewrites

    return { ...flag, rewrite };
  });
}

// ============================================================================
// QUOTA MANAGEMENT
// ============================================================================

// In-memory quota cache (would be database in production)
const QUOTA_CACHE: Map<string, UserQuota> = new Map();

/**
 * Get the current month string (YYYY-MM format).
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get or initialize user quota.
 * In production, this would query the database.
 */
export function getUserQuota(userId: string, tier: 'free' | 'pro' | 'enterprise'): UserQuota {
  const month = getCurrentMonth();
  const cacheKey = `${userId}:${month}`;
  
  let quota = QUOTA_CACHE.get(cacheKey);
  
  if (!quota) {
    quota = {
      user_id: userId,
      month,
      checks_used: 0,
      checks_remaining: tier === 'free' ? FREE_TIER_MONTHLY_LIMIT : Infinity,
      tier,
      reset_at: new Date(),
    };
    QUOTA_CACHE.set(cacheKey, quota);
  }
  
  return quota;
}

/**
 * Increment the user's check count.
 * Returns the updated quota.
 */
export function incrementCheckCount(userId: string, tier: 'free' | 'pro' | 'enterprise'): UserQuota {
  const quota = getUserQuota(userId, tier);
  quota.checks_used++;
  
  if (tier === 'free') {
    quota.checks_remaining = Math.max(0, FREE_TIER_MONTHLY_LIMIT - quota.checks_used);
  }
  
  return quota;
}

/**
 * Check if user has remaining quota.
 */
export function hasQuotaRemaining(userId: string, tier: 'free' | 'pro' | 'enterprise'): boolean {
  if (tier !== 'free') return true;
  const quota = getUserQuota(userId, tier);
  return quota.checks_remaining > 0;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

// In-memory audit log (would be database in production)
const AUDIT_LOG: AuditLogEntry[] = [];

/**
 * Create a text snippet (first 100 chars) for audit logging.
 * Privacy: Never log full text.
 */
function createTextSnippet(text: string): string {
  return text.substring(0, TEXT_SNIPPET_LENGTH);
}

/**
 * Summarize flag severities for audit logging.
 */
function summarizeSeverities(flags: Flag[]): { violation: number; warning: number; advisory: number } {
  return {
    violation: flags.filter(f => f.severity === 'violation').length,
    warning: flags.filter(f => f.severity === 'warning').length,
    advisory: flags.filter(f => f.severity === 'advisory').length,
  };
}

/**
 * Log a compliance check to the audit trail.
 * In production, this would write to the database.
 */
export function logComplianceCheck(
  checkId: string,
  userId: string,
  source: Source,
  text: string,
  flags: Flag[],
  ruleset: string[]
): void {
  const entry: AuditLogEntry = {
    check_id: checkId,
    user_id: userId,
    source,
    text_snippet: createTextSnippet(text),
    flag_count: flags.length,
    severity_summary: summarizeSeverities(flags),
    ruleset,
    created_at: new Date(),
  };
  
  AUDIT_LOG.push(entry);
  
  // In production, this would be:
  // await db.insert(auditLogs).values(entry);
}

/**
 * Get audit log entries for a user.
 * In production, this would query the database with pagination.
 */
export function getAuditLogForUser(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): { entries: AuditLogEntry[]; total: number } {
  const userEntries = AUDIT_LOG.filter(e => e.user_id === userId).sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );
  
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    entries: userEntries.slice(start, end),
    total: userEntries.length,
  };
}

// ============================================================================
// MAIN COMPLIANCE CHECK FUNCTION
// ============================================================================

/**
 * Perform a compliance check on the provided text.
 * 
 * This is the main entry point for the compliance API.
 * It handles:
 * 1. Input validation
 * 2. Quota enforcement
 * 3. Pattern matching against rulesets
 * 4. AI rewrite generation (Pro users only)
 * 5. Audit logging
 * 6. Response formatting
 * 
 * Performance target: <500ms p95 for text <=500 words in realtime mode
 */
export async function performComplianceCheck(
  request: ComplianceCheckRequest,
  userTier: 'free' | 'pro' | 'enterprise' = 'free'
): Promise<ComplianceCheckResponse> {
  const startTime = performance.now();
  
  // Validate input
  if (!request.text || request.text.length === 0) {
    throw new Error('Text is required');
  }
  
  if (request.text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }
  
  // Check quota
  if (!hasQuotaRemaining(request.user_id, userTier)) {
    throw new Error('Monthly check quota exceeded. Upgrade to Pro for unlimited checks.');
  }
  
  // Determine rulesets to check
  const rulesetIds = request.ruleset || DEFAULT_RULESETS;
  
  // Generate check ID
  const checkId = newCheckId();
  
  // Run pattern matching (synchronous, fast)
  let flags = runPatternMatching(request.text, rulesetIds);
  
  // Generate AI rewrites (async, Pro only)
  // Skip in realtime mode for performance
  if (request.mode !== 'realtime' && userTier !== 'free') {
    flags = await generateRewriteSuggestions(request.text, flags, userTier);
  }
  
  // Increment check count
  const quota = incrementCheckCount(request.user_id, userTier);
  
  // Log to audit trail
  logComplianceCheck(
    checkId,
    request.user_id,
    request.source || 'api',
    request.text,
    flags,
    rulesetIds
  );
  
  // Get disclaimer from first ruleset
  const firstRuleset = loadRuleset(rulesetIds[0]);
  const disclaimer = firstRuleset?.disclaimer || 
    'This is a flag for review, not a compliance verdict. Consult a qualified compliance advisor for definitive guidance.';
  
  const duration = performance.now() - startTime;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Regulatory Guardrail] Check ${checkId} completed in ${duration.toFixed(2)}ms, ${flags.length} flags found`);
  }
  
  return {
    flags,
    check_id: checkId,
    checks_remaining: quota.checks_remaining,
    disclaimer,
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize on module load
initializeRulesetCache();
