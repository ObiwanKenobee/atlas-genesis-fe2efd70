/**
 * SOC 2 Compliance Service
 * 
 * Provides SOC 2 Type II compliance evaluation and reporting.
 * Evaluates controls across all Trust Services Criteria (TSC).
 */

import { db } from '../db';
import { auditService } from './audit';

export interface ComplianceControl {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'cc1' | 'cc2' | 'cc3' | 'cc4' | 'cc5' | 'cc6' | 'cc7' | 'cc8';
  status: 'effective' | 'partially_effective' | 'ineffective' | 'not_tested';
  evidence: any[];
  lastTestedAt: Date;
  nextTestDate: Date;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  reportType: 'soc2' | 'gdpr' | 'iso27001' | 'hipaa';
  periodStart: Date;
  periodEnd: Date;
  controls: Record<string, ComplianceControl>;
  overallComplianceScore: number;
  findings: ComplianceFinding[];
  generatedBy: string;
  generatedAt: Date;
}

export interface SOCCriteria {
  code: string;
  name: string;
  description: string;
  category: string;
  tests: ComplianceTest[];
}

export interface ComplianceTest {
  id: string;
  name: string;
  description: string;
  procedure: string;
  expectedResult: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export class ComplianceService {
  /**
   * SOC 2 Trust Services Criteria (TSC)
   */
  private readonly SOC2_CRITERIA: SOCCriteria[] = [
    // CC1.1: Control Environment
    {
      code: 'CC1.1',
      name: 'Control Environment',
      description: 'Management establishes structures, reporting lines, and authorities to support the achievement of objectives.',
      category: 'cc1',
      tests: [
        {
          id: 'cc1.1.1',
          name: 'Organizational Structure Review',
          description: 'Review organizational chart and reporting lines',
          procedure: 'Examine organizational documentation and interview management',
          expectedResult: 'Clear structure with defined authorities and responsibilities',
          frequency: 'annually',
        },
        {
          id: 'cc1.1.2',
          name: 'Governance Documentation',
          description: 'Verify governance policies and procedures exist',
          procedure: 'Review policy documentation and approval records',
          expectedResult: 'Documented governance framework with approval trails',
          frequency: 'annually',
        },
      ],
    },

    // CC2.1: Communication of Responsibilities
    {
      code: 'CC2.1',
      name: 'Communication of Responsibilities',
      description: 'Management communicates responsibility assignments to enable personnel to achieve objectives.',
      category: 'cc2',
      tests: [
        {
          id: 'cc2.1.1',
          name: 'Role Documentation',
          description: 'Verify all roles have documented responsibilities',
          procedure: 'Review job descriptions and role documentation',
          expectedResult: 'All roles have clear, documented responsibilities',
          frequency: 'annually',
        },
      ],
    },

    // CC3.1: Risk Assessment
    {
      code: 'CC3.1',
      name: 'Risk Assessment',
      description: 'Management identifies, analyzes, and responds to risks.',
      category: 'cc3',
      tests: [
        {
          id: 'cc3.1.1',
          name: 'Risk Register Review',
          description: 'Review risk register for completeness',
          procedure: 'Examine risk register and mitigation plans',
          expectedResult: 'Comprehensive risk register with mitigation strategies',
          frequency: 'quarterly',
        },
      ],
    },

    // CC4.1: Monitoring Activities
    {
      code: 'CC4.1',
      name: 'Monitoring Activities',
      description: 'Management selects, develops, and performs ongoing monitoring activities.',
      category: 'cc4',
      tests: [
        {
          id: 'cc4.1.1',
          name: 'Audit Log Monitoring',
          description: 'Verify audit logs are monitored regularly',
          procedure: 'Review audit log monitoring procedures and alerts',
          expectedResult: 'Active monitoring with defined alert thresholds',
          frequency: 'monthly',
        },
        {
          id: 'cc4.1.2',
          name: 'Security Event Monitoring',
          description: 'Verify security events are tracked and reviewed',
          procedure: 'Review security event logs and review procedures',
          expectedResult: 'All security events logged and reviewed within SLA',
          frequency: 'monthly',
        },
      ],
    },

    // CC5.1: Control Activities
    {
      code: 'CC5.1',
      name: 'Control Activities',
      description: 'Management selects, develops, and performs control activities.',
      category: 'cc5',
      tests: [
        {
          id: 'cc5.1.1',
          name: 'Access Control Review',
          description: 'Verify access controls are properly implemented',
          procedure: 'Test access control mechanisms and review logs',
          expectedResult: 'Access controls functioning as designed',
          frequency: 'quarterly',
        },
        {
          id: 'cc5.1.2',
          name: 'Change Management Review',
          description: 'Verify change management procedures are followed',
          procedure: 'Review change tickets and approval workflows',
          expectedResult: 'All changes follow documented procedures',
          frequency: 'monthly',
        },
      ],
    },

    // CC6.1: Logical and Physical Access
    {
      code: 'CC6.1',
      name: 'Logical and Physical Access',
      description: 'Management restricts logical and physical access.',
      category: 'cc6',
      tests: [
        {
          id: 'cc6.1.1',
          name: 'Authentication Review',
          description: 'Verify authentication mechanisms are secure',
          procedure: 'Test authentication and review password policies',
          expectedResult: 'Strong authentication with MFA where required',
          frequency: 'quarterly',
        },
        {
          id: 'cc6.1.2',
          name: 'Authorization Review',
          description: 'Verify authorization follows principle of least privilege',
          procedure: 'Review user permissions and access logs',
          expectedResult: 'Users have minimum necessary access',
          frequency: 'quarterly',
        },
      ],
    },

    // CC7.1: System Operations
    {
      code: 'CC7.1',
      name: 'System Operations',
      description: 'Management performs system operations to achieve objectives.',
      category: 'cc7',
      tests: [
        {
          id: 'cc7.1.1',
          name: 'Backup Verification',
          description: 'Verify backups are performed and tested',
          procedure: 'Review backup logs and test restore procedures',
          expectedResult: 'Regular backups with successful test restores',
          frequency: 'monthly',
        },
        {
          id: 'cc7.1.2',
          name: 'Disaster Recovery Testing',
          description: 'Verify disaster recovery procedures work',
          procedure: 'Conduct disaster recovery drill',
          expectedResult: 'Successful recovery within RTO/RPO targets',
          frequency: 'annually',
        },
      ],
    },

    // CC8.1: Change Management
    {
      code: 'CC8.1',
      name: 'Change Management',
      description: 'Management identifies and manages changes.',
      category: 'cc8',
      tests: [
        {
          id: 'cc8.1.1',
          name: 'Change Authorization Review',
          description: 'Verify all changes are properly authorized',
          procedure: 'Review change tickets and approval records',
          expectedResult: 'All changes have documented approvals',
          frequency: 'monthly',
        },
        {
          id: 'cc8.1.2',
          name: 'Change Testing Review',
          description: 'Verify changes are tested before deployment',
          procedure: 'Review test records for deployed changes',
          expectedResult: 'All changes tested before production deployment',
          frequency: 'monthly',
        },
      ],
    },
  ];

  /**
   * Generate SOC 2 compliance report
   */
  async generateSOC2Report(
    organizationId: string,
    period: { from: Date; to: Date },
    generatedBy: string
  ): Promise<ComplianceReport> {
    const controls = await this.evaluateSOC2Controls(organizationId, period);
    const findings = await this.identifyComplianceFindings(organizationId, period);
    const overallScore = this.calculateComplianceScore(controls);

    const report: ComplianceReport = {
      id: crypto.randomUUID(),
      organizationId,
      reportType: 'soc2',
      periodStart: period.from,
      periodEnd: period.to,
      controls,
      overallComplianceScore: overallScore,
      findings,
      generatedBy,
      generatedAt: new Date(),
    };

    // Save report to database
    await this.saveReport(report);

    // Log report generation
    await auditService.log({
      action: 'compliance.report_generate',
      resource: 'compliance_report',
      organizationId,
      details: {
        reportType: 'soc2',
        period,
        overallScore,
        findingsCount: findings.length,
      },
      status: 'success',
    });

    return report;
  }

  /**
   * Evaluate all SOC 2 controls
   */
  private async evaluateSOC2Controls(
    organizationId: string,
    period: { from: Date; to: Date }
  ): Promise<Record<string, ComplianceControl>> {
    const controls: Record<string, ComplianceControl> = {};

    for (const criteria of this.SOC2_CRITERIA) {
      const control = await this.evaluateControl(
        organizationId,
        criteria,
        period
      );
      controls[criteria.code] = control;
    }

    return controls;
  }

  /**
   * Evaluate a single control
   */
  private async evaluateControl(
    organizationId: string,
    criteria: SOCCriteria,
    period: { from: Date; to: Date }
  ): Promise<ComplianceControl> {
    const evidence = await this.getControlEvidence(
      organizationId,
      criteria.code,
      period
    );

    const status = this.determineControlStatus(criteria, evidence);
    const findings = this.identifyControlFindings(criteria, evidence);

    return {
      id: crypto.randomUUID(),
      code: criteria.code,
      name: criteria.name,
      description: criteria.description,
      category: criteria.category as any,
      status,
      evidence,
      lastTestedAt: new Date(),
      nextTestDate: this.calculateNextTestDate(criteria),
      findings,
    };
  }

  /**
   * Get evidence for a control
   */
  private async getControlEvidence(
    organizationId: string,
    controlCode: string,
    period: { from: Date; to: Date }
  ): Promise<any[]> {
    const evidence: any[] = [];

    // Get audit logs related to this control
    const auditLogs = await auditService.query({
      organizationId,
      from: period.from,
      to: period.to,
      limit: 100,
    });

    // Filter logs relevant to the control
    const relevantLogs = this.filterLogsByControl(auditLogs, controlCode);
    evidence.push(...relevantLogs);

    // Get security events
    const securityEvents = await db.query(
      `SELECT * FROM security_events
       WHERE organization_id = $1
         AND created_at >= $2
         AND created_at <= $3
       ORDER BY created_at DESC
       LIMIT 50`,
      [organizationId, period.from, period.to]
    );

    evidence.push(...securityEvents);

    return evidence;
  }

  /**
   * Filter audit logs by control relevance
   */
  private filterLogsByControl(logs: any[], controlCode: string): any[] {
    const controlMappings: Record<string, string[]> = {
      'CC1.1': ['system.config_update', 'policy.update'],
      'CC2.1': ['role.assign', 'role.revoke', 'user.update'],
      'CC3.1': ['risk.assessed', 'security.event'],
      'CC4.1': ['audit.cleanup', 'security.escalation'],
      'CC5.1': ['access.granted', 'access.denied', 'control.executed'],
      'CC6.1': ['user.login', 'user.logout', 'user.mfa_enabled'],
      'CC7.1': ['system.maintenance', 'backup.created'],
      'CC8.1': ['change.deployed', 'change.approved'],
    };

    const relevantActions = controlMappings[controlCode] || [];
    return logs.filter(log => relevantActions.includes(log.action));
  }

  /**
   * Determine control status based on evidence
   */
  private determineControlStatus(
    criteria: SOCCriteria,
    evidence: any[]
  ): ComplianceControl['status'] {
    if (evidence.length === 0) {
      return 'not_tested';
    }

    // Check for failures or issues
    const failures = evidence.filter(e => e.status === 'failure' || e.severity === 'critical');
    const warnings = evidence.filter(e => e.status === 'warning' || e.severity === 'high');

    if (failures.length > 0) {
      return 'ineffective';
    } else if (warnings.length > 0) {
      return 'partially_effective';
    } else {
      return 'effective';
    }
  }

  /**
   * Identify findings for a control
   */
  private identifyControlFindings(
    criteria: SOCCriteria,
    evidence: any[]
  ): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    const failures = evidence.filter(e => e.status === 'failure' || e.severity === 'critical');
    const warnings = evidence.filter(e => e.status === 'warning' || e.severity === 'high');

    for (const failure of failures) {
      findings.push({
        id: crypto.randomUUID(),
        severity: 'critical',
        description: `Control failure detected: ${failure.action || failure.event_type}`,
        recommendation: 'Investigate and remediate the failure immediately',
        status: 'open',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    for (const warning of warnings) {
      findings.push({
        id: crypto.randomUUID(),
        severity: 'high',
        description: `Control warning: ${warning.action || warning.event_type}`,
        recommendation: 'Review and address the warning',
        status: 'open',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      });
    }

    return findings;
  }

  /**
   * Identify all compliance findings
   */
  private async identifyComplianceFindings(
    organizationId: string,
    period: { from: Date; to: Date }
  ): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    // Get unresolved security events
    const unresolvedEvents = await db.query(
      `SELECT * FROM security_events
       WHERE organization_id = $1
         AND created_at >= $2
         AND created_at <= $3
         AND resolved = false
         AND severity IN ('high', 'critical')
       ORDER BY severity DESC, created_at DESC`,
      [organizationId, period.from, period.to]
    );

    for (const event of unresolvedEvents) {
      findings.push({
        id: crypto.randomUUID(),
        severity: event.severity as any,
        description: `Unresolved security event: ${event.event_type}`,
        recommendation: 'Investigate and resolve the security event',
        status: 'open',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days for critical
      });
    }

    return findings;
  }

  /**
   * Calculate overall compliance score
   */
  private calculateComplianceScore(controls: Record<string, ComplianceControl>): number {
    const scores = Object.values(controls).map(control => {
      switch (control.status) {
        case 'effective':
          return 100;
        case 'partially_effective':
          return 50;
        case 'ineffective':
          return 0;
        case 'not_tested':
          return 0;
        default:
          return 0;
      }
    });

    if (scores.length === 0) {
      return 0;
    }

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Calculate next test date based on control frequency
   */
  private calculateNextTestDate(criteria: SOCCriteria): Date {
    const frequencies: Record<string, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      annually: 365,
    };

    // Use the most frequent test for the control
    const maxFrequency = criteria.tests.reduce((max, test) => {
      const days = frequencies[test.frequency] || 365;
      return days < max ? days : max;
    }, 365);

    return new Date(Date.now() + maxFrequency * 24 * 60 * 60 * 1000);
  }

  /**
   * Save compliance report to database
   */
  private async saveReport(report: ComplianceReport): Promise<void> {
    await db.query(
      `INSERT INTO compliance_reports (
        id, organization_id, report_type, period_start, period_end,
        controls, overall_compliance_score, findings, generated_by, generated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        report.id,
        report.organizationId,
        report.reportType,
        report.periodStart,
        report.periodEnd,
        JSON.stringify(report.controls),
        report.overallComplianceScore,
        JSON.stringify(report.findings),
        report.generatedBy,
        report.generatedAt,
      ]
    );
  }

  /**
   * Get compliance report by ID
   */
  async getReport(reportId: string): Promise<ComplianceReport | null> {
    const result = await db.query(
      'SELECT * FROM compliance_reports WHERE id = $1',
      [reportId]
    );

    if (result.length === 0) {
      return null;
    }

    const report = result[0];
    return {
      ...report,
      controls: JSON.parse(report.controls),
      findings: JSON.parse(report.findings),
    };
  }

  /**
   * Get compliance reports for organization
   */
  async getReports(
    organizationId: string,
    filters?: {
      reportType?: string;
      from?: Date;
      to?: Date;
      limit?: number;
    }
  ): Promise<ComplianceReport[]> {
    const conditions: string[] = ['organization_id = $1'];
    const values: any[] = [organizationId];
    let paramIndex = 2;

    if (filters?.reportType) {
      conditions.push(`report_type = $${paramIndex++}`);
      values.push(filters.reportType);
    }

    if (filters?.from) {
      conditions.push(`period_start >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters?.to) {
      conditions.push(`period_end <= $${paramIndex++}`);
      values.push(filters.to);
    }

    const limit = filters?.limit || 20;

    const result = await db.query(
      `SELECT * FROM compliance_reports
       WHERE ${conditions.join(' AND ')}
       ORDER BY generated_at DESC
       LIMIT $${paramIndex++}`,
      [...values, limit]
    );

    return result.map(report => ({
      ...report,
      controls: JSON.parse(report.controls),
      findings: JSON.parse(report.findings),
    }));
  }

  /**
   * Get SOC 2 criteria
   */
  getCriteria(): SOCCriteria[] {
    return this.SOC2_CRITERIA;
  }

  /**
   * Get criteria by code
   */
  getCriteriaByCode(code: string): SOCCriteria | undefined {
    return this.SOC2_CRITERIA.find(c => c.code === code);
  }

  /**
   * Get compliance trends over time
   */
  async getComplianceTrends(
    organizationId: string,
    months: number = 12
  ): Promise<Array<{ period: string; score: number }>> {
    const result = await db.query(
      `SELECT 
        DATE_TRUNC('month', generated_at) as period,
        AVG(overall_compliance_score) as score
       FROM compliance_reports
       WHERE organization_id = $1
         AND generated_at >= NOW() - INTERVAL '1 month' * $2
       GROUP BY DATE_TRUNC('month', generated_at)
       ORDER BY period DESC`,
      [organizationId, months]
    );

    return result.map(row => ({
      period: row.period,
      score: parseFloat(row.score),
    }));
  }

  /**
   * Export compliance report to PDF
   */
  async exportReportToPDF(reportId: string): Promise<Buffer> {
    const report = await this.getReport(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    // This would integrate with a PDF generation library
    // For now, return a placeholder
    return Buffer.from('PDF report content');
  }

  /**
   * Schedule periodic compliance checks
   */
  async scheduleComplianceChecks(): Promise<void> {
    // This would integrate with a job scheduler
    // For now, it's a placeholder
    console.log('Compliance checks scheduled');
  }
}

// Export singleton instance
export const complianceService = new ComplianceService();

// Helper types for SOC 2 categories
export type SOCCategory =
  | 'cc1' // Control Environment
  | 'cc2' // Communication of Responsibilities
  | 'cc3' // Risk Assessment
  | 'cc4' // Monitoring Activities
  | 'cc5' // Control Activities
  | 'cc6' // Logical and Physical Access
  | 'cc7' // System Operations
  | 'cc8'; // Change Management

export const SOCCategoryNames: Record<SOCCategory, string> = {
  cc1: 'Control Environment',
  cc2: 'Communication of Responsibilities',
  cc3: 'Risk Assessment',
  cc4: 'Monitoring Activities',
  cc5: 'Control Activities',
  cc6: 'Logical and Physical Access',
  cc7: 'System Operations',
  cc8: 'Change Management',
};
