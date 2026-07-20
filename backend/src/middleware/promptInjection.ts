/**
 * Atlas Sanctum — Prompt Injection Filter
 *
 * Detects and blocks prompt injection attacks before user input reaches any LLM.
 * Used as Express middleware on all AI endpoints AND as a standalone sanitizer
 * callable from agent tool execution paths.
 *
 * Threat model:
 *   - Direct injection: "Ignore previous instructions and..."
 *   - Indirect injection: malicious content in retrieved documents
 *   - Jailbreak attempts: role-play, hypothetical framing, encoding tricks
 *   - Data exfiltration: attempts to extract system prompts or user data
 *
 * On detection:
 *   - Severity LOW/MEDIUM: sanitize and continue with warning header
 *   - Severity HIGH/CRITICAL: block request, log security event, publish domain event
 */

import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logSecurityEvent } from '../utils/logger';
import { eventBus } from '../events/bus';
import { EventTypes } from '../events/catalog';
import type { InjectionBlockedPayload } from '../events/catalog';

// ─── Pattern Definitions ──────────────────────────────────────────────────────

interface InjectionPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const INJECTION_PATTERNS: InjectionPattern[] = [
  // Direct instruction override
  { name: 'ignore_instructions',    severity: 'critical', pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)/i },
  { name: 'disregard_instructions', severity: 'critical', pattern: /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)/i },
  { name: 'forget_instructions',    severity: 'critical', pattern: /forget\s+(everything|all|your|the)\s+(previous|prior|above|earlier|system)/i },
  { name: 'new_instructions',       severity: 'high',     pattern: /your\s+(new|actual|real|true)\s+(instructions?|task|role|purpose|goal)\s+(is|are|will be)/i },
  { name: 'override_system',        severity: 'critical', pattern: /override\s+(the\s+)?(system\s+)?(prompt|instructions?|context|rules?)/i },

  // Role / persona hijacking
  { name: 'act_as_jailbreak',       severity: 'high',     pattern: /\b(act|pretend|behave|respond)\s+as\s+(if\s+you\s+(are|were)|a\s+)(DAN|jailbreak|unrestricted|unfiltered|evil|malicious)/i },
  { name: 'dan_jailbreak',          severity: 'critical', pattern: /\bDAN\b.*\b(mode|enabled|activated|jailbreak)/i },
  { name: 'developer_mode',         severity: 'high',     pattern: /developer\s+mode\s+(enabled|activated|on)/i },
  { name: 'system_role_injection',  severity: 'critical', pattern: /^(system|assistant|user)\s*:/im },

  // Prompt extraction
  { name: 'reveal_prompt',          severity: 'high',     pattern: /\b(reveal|show|print|output|display|repeat|tell me)\s+(your\s+)?(system\s+)?(prompt|instructions?|context|rules?)/i },
  { name: 'what_are_instructions',  severity: 'medium',   pattern: /what\s+(are|were)\s+your\s+(original\s+)?(instructions?|system\s+prompt|rules?|guidelines?)/i },

  // Encoding / obfuscation tricks
  { name: 'base64_injection',       severity: 'medium',   pattern: /aWdub3Jl|aWdub3Jl|SW5zdHJ1Y3Rpb24|aW5zdHJ1Y3Rpb24/i }, // base64 "ignore", "Instruction"
  { name: 'unicode_bypass',         severity: 'medium',   pattern: /[\u202e\u200b\u200c\u200d\ufeff]/ }, // RTL override, zero-width chars
  { name: 'html_injection',         severity: 'medium',   pattern: /<\s*(script|iframe|object|embed|form|input|button|link|meta|style)[^>]*>/i },

  // Data exfiltration
  { name: 'exfil_user_data',        severity: 'high',     pattern: /\b(send|email|transmit|exfiltrate|leak|expose)\s+(all\s+)?(user|customer|private|sensitive|confidential)\s+(data|information|records?|details?)/i },
  { name: 'exfil_api_keys',         severity: 'critical', pattern: /\b(show|reveal|print|output)\s+(all\s+)?(api\s+keys?|secrets?|credentials?|passwords?|tokens?)/i },

  // Indirect injection markers
  { name: 'injection_delimiter',    severity: 'high',     pattern: /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]|\[USER\]|\[ASSISTANT\]/i },
  { name: 'prompt_boundary',        severity: 'medium',   pattern: /---+\s*(system|user|assistant|instruction|prompt)\s*---+/i },

  // Hypothetical framing (lower severity — may be legitimate)
  { name: 'hypothetical_bypass',    severity: 'low',      pattern: /hypothetically\s+(speaking\s+)?,?\s+(if\s+you\s+(had\s+no|were\s+without|could\s+ignore)\s+(restrictions?|rules?|guidelines?|ethics?))/i },
  { name: 'fictional_bypass',       severity: 'low',      pattern: /in\s+a\s+fictional\s+(world|scenario|story)\s+where\s+(you\s+have\s+no|there\s+are\s+no)\s+(restrictions?|rules?|ethics?)/i },
];

// ─── Sanitizer ────────────────────────────────────────────────────────────────

export interface InjectionScanResult {
  clean: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  patterns: string[];
  sanitized: string;
}

/**
 * Scan a string for injection patterns.
 * Returns the scan result including a sanitized version of the input.
 * Safe to call from agent tool execution paths.
 */
export function scanForInjection(input: string): InjectionScanResult {
  if (typeof input !== 'string' || input.length === 0) {
    return { clean: true, severity: null, patterns: [], sanitized: input };
  }

  // Truncate extremely long inputs before scanning (DoS protection)
  const truncated = input.length > 50_000 ? input.slice(0, 50_000) : input;

  const matched: InjectionPattern[] = [];

  for (const p of INJECTION_PATTERNS) {
    if (p.pattern.test(truncated)) {
      matched.push(p);
    }
  }

  if (matched.length === 0) {
    return { clean: true, severity: null, patterns: [], sanitized: truncated };
  }

  // Highest severity wins
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const maxSeverity = matched.reduce((max, p) =>
    severityOrder[p.severity] > severityOrder[max] ? p.severity : max,
    'low' as InjectionScanResult['severity'] & string
  );

  // Sanitize: replace matched patterns with [FILTERED]
  let sanitized = truncated;
  for (const p of matched) {
    sanitized = sanitized.replace(p.pattern, '[FILTERED]');
  }

  return {
    clean: false,
    severity: maxSeverity as InjectionScanResult['severity'],
    patterns: matched.map(p => p.name),
    sanitized,
  };
}

// ─── Express Middleware ───────────────────────────────────────────────────────

/**
 * Express middleware for AI endpoints.
 * Scans req.body fields that will be forwarded to an LLM.
 *
 * Fields scanned: message, prompt, query, input, content, text, question
 */
export function promptInjectionFilter(req: Request, res: Response, next: NextFunction): void {
  const fieldsToScan = ['message', 'prompt', 'query', 'input', 'content', 'text', 'question'];
  const userId = (req as any).user?.id as string | undefined;
  const requestId = randomUUID();

  let worstSeverity: InjectionScanResult['severity'] = null;
  const allPatterns: string[] = [];

  for (const field of fieldsToScan) {
    const value = req.body?.[field];
    if (typeof value !== 'string') continue;

    const result = scanForInjection(value);
    if (!result.clean) {
      allPatterns.push(...result.patterns);
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      if (
        result.severity &&
        (!worstSeverity || severityOrder[result.severity] > severityOrder[worstSeverity])
      ) {
        worstSeverity = result.severity;
      }

      // Replace the field with the sanitized version
      req.body[field] = result.sanitized;
    }
  }

  if (!worstSeverity) {
    return next();
  }

  const uniquePatterns = [...new Set(allPatterns)];

  // Log security event
  logSecurityEvent('prompt_injection_detected', userId ?? null, {
    requestId,
    severity: worstSeverity,
    patterns: uniquePatterns,
    path: req.path,
    method: req.method,
    ip: req.ip,
  }, worstSeverity === 'critical' || worstSeverity === 'high' ? 'high' : 'medium');

  // Publish domain event (async — do not await, do not block request)
  const sampleInput = (req.body?.message ?? req.body?.prompt ?? req.body?.query ?? '')
    .slice(0, 200)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[EMAIL]') // strip PII
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');

  eventBus.publish<InjectionBlockedPayload>({
    type: EventTypes.INTELLIGENCE_INJECTION_BLOCKED,
    source: 'intelligence',
    correlationId: requestId,
    payload: {
      requestId,
      userId,
      severity: worstSeverity,
      patterns: uniquePatterns,
      input: sampleInput,
    },
  }).catch(() => { /* non-blocking */ });

  // Block HIGH and CRITICAL; warn and continue for LOW and MEDIUM
  if (worstSeverity === 'high' || worstSeverity === 'critical') {
    res.setHeader('X-Injection-Blocked', 'true');
    res.status(400).json({
      error: 'invalid_input',
      message: 'Input contains disallowed content.',
      requestId,
    });
    return;
  }

  // LOW / MEDIUM: sanitized input already applied above, continue with warning
  res.setHeader('X-Injection-Warning', worstSeverity);
  next();
}
