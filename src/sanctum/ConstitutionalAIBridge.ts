/**
 * Atlas Sanctum — Constitutional AI Bridge
 *
 * Connects the existing 10-layer AI orchestrator (AtlasSanctumAI) to
 * The Covenant Code constitutional operating system.
 *
 * Every AI action now passes through the 11-point constitutional pre-flight
 * before execution. Blocked actions produce constitutional reasoning and
 * corrective actions rather than silent failures.
 *
 * Usage:
 *   const bridge = new ConstitutionalAIBridge(AtlasSanctumAISystem, TheCovenantCode);
 *   const result = await bridge.process(request);
 */

import { AtlasSanctumAI, CivilizationalRequest, CivilizationalResponse } from '../sanctum-ai/AtlasSanctumAI.orchestrator';
import { CovenantCode, TheCovenantCode }                                  from './covenant/CovenantCode';
import { ConstitutionalActionRequest, ConstitutionalActionResult }        from './covenant/CovenantCode';
import { CovenantId, ParticipantId, EpochMs }                            from './covenant/CovenantTypes';
import { Result, ok, err, AIError }                                       from '../sanctum-ai/AtlasSanctumAI.types';

// ─── Constitutional AI Bridge ─────────────────────────────────────────────────

export class ConstitutionalAIBridge {
  constructor(
    private readonly ai: AtlasSanctumAI,
    private readonly covenant: CovenantCode = TheCovenantCode,
  ) {}

  /**
   * Process a civilizational request through the full constitutional pipeline:
   *   1. Constitutional pre-flight (11 checks)
   *   2. If permitted → delegate to AI orchestrator
   *   3. Record explainability + audit trail
   *   4. Return result with constitutional metadata
   */
  async process(
    request: CivilizationalRequest,
    covenantId?: CovenantId,
    requestedBy?: ParticipantId,
  ): Promise<Result<ConstitutionalCivilizationalResponse, AIError>> {

    // Step 1: Constitutional pre-flight
    const constitutionalRequest: ConstitutionalActionRequest = {
      agentId: 'atlas-sanctum-ai',
      agentType: 'ai',
      actionType: request.type,
      payload: {
        ...request.context,
        explanation: this.generateExplanation(request),
        restorationPath: this.inferRestorationPath(request.type),
        rationale: `Civilizational request: ${request.type}`,
      },
      covenantId,
      requestedBy,
    };

    const constitutional = this.covenant.evaluate(constitutionalRequest);

    if (!constitutional.permitted) {
      return err(new AIError(
        `Constitutional pre-flight failed: ${constitutional.verdict.constitutionalReasoning}`,
        'CONSTITUTIONAL_BLOCK',
        'foundational',
        true,
      ));
    }

    // Step 2: Execute through AI orchestrator
    const aiResult = await this.ai.process(request);
    if (!aiResult.ok) return aiResult;

    // Step 3: Return with constitutional metadata attached
    const response: ConstitutionalCivilizationalResponse = {
      ...aiResult.value,
      constitutional: {
        verdict: constitutional.verdict,
        explainabilityId: constitutional.explainability.actionId,
        auditEntryId: constitutional.auditEntryId,
        covenantRef: covenantId,
      },
    };

    return ok(response);
  }

  /** Evaluate any action without executing it — for pre-validation */
  preValidate(request: ConstitutionalActionRequest): ConstitutionalActionResult {
    return this.covenant.evaluate(request);
  }

  /** Get the current constitutional health of the platform */
  constitutionalHealth() {
    return this.covenant.healthReport();
  }

  private generateExplanation(request: CivilizationalRequest): string {
    return `Atlas Sanctum AI is processing a "${request.type}" request. ` +
      `This action involves ${Object.keys(request.context).join(', ')}. ` +
      `The system will coordinate relevant agents, validate against ethical principles, ` +
      `and produce explainable, auditable outcomes aligned with the Covenant Code.`;
  }

  private inferRestorationPath(type: CivilizationalRequest['type']): string {
    const paths: Record<CivilizationalRequest['type'], string> = {
      ecological_assessment:  'Revert to previous ecological baseline data',
      policy_design:          'Withdraw policy proposal and reopen deliberation',
      carbon_validation:      'Invalidate carbon record and re-initiate verification',
      disaster_response:      'Escalate to human emergency coordinators',
      governance_proposal:    'Archive proposal and reopen community consultation',
      restoration_planning:   'Pause restoration activities and reassess impact',
      planetary_simulation:   'Discard simulation results and re-run with corrected parameters',
    };
    return paths[type] ?? 'Revert to last known good state';
  }
}

// ─── Extended Response Type ───────────────────────────────────────────────────

export interface ConstitutionalCivilizationalResponse extends CivilizationalResponse {
  constitutional: {
    verdict: ConstitutionalActionResult['verdict'];
    explainabilityId: string;
    auditEntryId: string;
    covenantRef?: CovenantId;
  };
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

import AtlasSanctumAISystem from '../sanctum-ai/AtlasSanctumAI.orchestrator';

export const ConstitutionalAtlas = new ConstitutionalAIBridge(AtlasSanctumAISystem, TheCovenantCode);

export default ConstitutionalAtlas;
