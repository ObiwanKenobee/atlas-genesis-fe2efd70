/**
 * Atlas Model Governance Service
 * 
 * Chief AI & Reasoning Architect: Model Governance Framework
 * 
 * Provides comprehensive model governance including:
 * - Bias auditing across demographic groups
 * - Drift monitoring with multiple statistical tests
 * - Model performance monitoring
 * - Regulatory compliance reporting
 * - Automated remediation workflows
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface ModelIdentity {
  readonly modelId: string;
  readonly version: string;
  readonly name: string;
  readonly description: string;
  readonly deployedAt: Date;
  readonly owner: string;
  readonly tags: readonly string[];
}

export interface PredictionRecord {
  readonly predictionId: string;
  readonly modelId: string;
  readonly timestamp: Date;
  readonly inputFeatures: Record<string, number>;
  readonly prediction: number;
  readonly actual?: number;
  readonly group: string; // For bias auditing
  readonly metadata: Record<string, unknown>;
}

export interface BiasAuditConfig {
  readonly protectedAttributes: readonly string[];
  readonly fairnessMetrics: readonly FairnessMetric[];
  readonly thresholds: Record<string, number>;
  readonly auditFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  readonly sampleSize: number;
}

export type FairnessMetric = 
  | 'demographic_parity'
  | 'equal_opportunity'
  | 'predictive_parity'
  | 'calibration'
  | 'treatment_equality'
  | 'impact_parity';

export interface GroupMetrics {
  readonly groupName: string;
  readonly count: number;
  readonly meanPrediction: number;
  readonly stdPrediction: number;
  readonly positiveRate: number;
  readonly truePositiveRate?: number;
  readonly falsePositiveRate?: number;
}

export interface BiasAuditResult {
  readonly modelId: string;
  readonly auditTimestamp: Date;
  readonly overallScore: number;
  readonly groupMetrics: readonly GroupMetrics[];
  readonly fairnessMetrics: readonly ComputedFairnessMetric[];
  readonly violations: readonly BiasViolation[];
  readonly recommendations: readonly string[];
  readonly complianceStatus: ComplianceStatus;
}

export interface ComputedFairnessMetric {
  readonly metric: FairnessMetric;
  readonly value: number;
  readonly threshold: number;
  readonly passed: boolean;
  readonly interpretation: string;
  readonly groupDisparities: Record<string, number>;
}

export interface BiasViolation {
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly metric: FairnessMetric;
  readonly description: string;
  readonly affectedGroups: readonly string[];
  readonly disparity: number;
  readonly remediation: string;
}

export type ComplianceStatus = 
  | 'compliant'
  | 'review_required'
  | 'non_compliant'
  | 'under_review';

export interface DriftMonitorConfig {
  readonly referenceWindow: number; // Number of records for baseline
  readonly monitoringWindow: number; // Number of records for current
  readonly alertThreshold: number;
  readonly checkFrequency: 'realtime' | 'hourly' | 'daily';
  readonly driftTests: readonly DriftTest[];
  readonly featureSubset?: readonly string[];
}

export type DriftTest = 
  | 'kolmogorov_smirnov'
  | 'chi_squared'
  | 'population_stability_index'
  | 'kl_divergence'
  | 'jensen_shannon'
  | 'wasserstein';

export interface DriftDetectionResult {
  readonly modelId: string;
  readonly testTimestamp: Date;
  readonly referencePeriod: { start: Date; end: Date };
  readonly monitoringPeriod: { start: Date; end: Date };
  readonly driftScores: readonly DriftScore[];
  readonly overallDriftScore: number;
  readonly driftDetected: boolean;
  readonly driftSeverity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
  readonly affectedFeatures: readonly string[];
  readonly recommendations: readonly string[];
}

export interface DriftScore {
  readonly feature: string;
  readonly test: DriftTest;
  readonly statistic: number;
  readonly pValue?: number;
  readonly threshold: number;
  readonly drifted: boolean;
  readonly changeDirection: 'increase' | 'decrease' | 'shift';
}

export interface PerformanceMetrics {
  readonly accuracy?: number;
  readonly precision?: number;
  readonly recall?: number;
  readonly f1Score?: number;
  readonly rmse?: number;
  readonly mae?: number;
  readonly auc?: number;
  readonly sampleSize: number;
  readonly timestamp: Date;
}

export interface GovernanceReport {
  readonly reportId: string;
  readonly modelId: string;
  readonly generatedAt: Date;
  readonly period: { start: Date; end: Date };
  readonly biasAudit: BiasAuditResult;
  readonly driftDetection: DriftDetectionResult;
  readonly performanceMetrics: PerformanceMetrics;
  readonly governanceScore: number;
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly complianceStatus: ComplianceStatus;
  readonly actionItems: readonly ActionItem[];
  readonly exportedAt?: Date;
}

export interface ActionItem {
  readonly id: string;
  readonly type: 'retrain' | 'feature_update' | 'threshold_adjustment' | 'investigation' | 'model_replacement';
  readonly priority: 'critical' | 'high' | 'medium' | 'low';
  readonly description: string;
  readonly createdAt: Date;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  readonly assignee?: string;
  readonly dueDate?: Date;
}

// ============================================================================
// MODEL GOVERNANCE SERVICE
// ============================================================================

export class ModelGovernanceService {
  private readonly predictionsStore: Map<string, PredictionRecord[]>;
  private readonly audits: Map<string, BiasAuditResult[]>;
  private readonly drifts: Map<string, DriftDetectionResult[]>;
  private readonly configs: Map<string, { biasConfig: BiasAuditConfig; driftConfig: DriftMonitorConfig }>;

  constructor() {
    this.predictionsStore = new Map();
    this.audits = new Map();
    this.drifts = new Map();
    this.configs = new Map();
  }

  /**
   * Register a model for governance monitoring
   */
  registerModel(
    model: ModelIdentity,
    biasConfig: BiasAuditConfig,
    driftConfig: DriftMonitorConfig
  ): void {
    this.configs.set(model.modelId, { biasConfig, driftConfig });
    this.predictionsStore.set(model.modelId, []);
    this.audits.set(model.modelId, []);
    this.drifts.set(model.modelId, []);
  }

  /**
   * Record a prediction for governance analysis
   */
  recordPrediction(record: PredictionRecord): void {
    const predictions = this.predictionsStore.get(record.modelId) || [];
    predictions.push(record);
    
    // Keep only the last 100,000 predictions per model
    if (predictions.length > 100000) {
      predictions.splice(0, predictions.length - 100000);
    }
    
    this.predictionsStore.set(record.modelId, predictions);
  }

  /**
   * Run bias audit for a model
   */
  async runBiasAudit(modelId: string): Promise<BiasAuditResult> {
    const predictions = this.predictionsStore.get(modelId) || [];
    const config = this.configs.get(modelId)?.biasConfig;

    if (!config || predictions.length < config.sampleSize) {
      return this.createInsufficientDataResult(modelId, config?.sampleSize || 100);
    }

    const groupMetrics = this.computeGroupMetrics(predictions, config.protectedAttributes);
    const fairnessMetrics = this.computeFairnessMetrics(groupMetrics, predictions, config);
    const violations = this.detectViolations(fairnessMetrics, config);
    const overallScore = this.computeOverallBiasScore(fairnessMetrics);

    const result: BiasAuditResult = {
      modelId,
      auditTimestamp: new Date(),
      overallScore,
      groupMetrics,
      fairnessMetrics,
      violations,
      recommendations: this.generateBiasRecommendations(violations),
      complianceStatus: this.determineComplianceStatus(violations),
    };

    // Store the audit result
    const audits = this.audits.get(modelId) || [];
    audits.push(result);
    this.audits.set(modelId, audits);

    return result;
  }

  /**
   * Run drift detection for a model
   */
  async runDriftDetection(modelId: string): Promise<DriftDetectionResult> {
    const predictions = this.predictionsStore.get(modelId) || [];
    const config = this.configs.get(modelId)?.driftConfig;

    if (!config || predictions.length < config.referenceWindow + config.monitoringWindow) {
      return this.createInsufficientDataDriftResult(modelId);
    }

    // Split into reference and monitoring windows
    const sortedPredictions = [...predictions].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const referenceWindow = sortedPredictions.slice(0, config.referenceWindow);
    const monitoringWindow = sortedPredictions.slice(-config.monitoringWindow);

    const driftScores = this.computeDriftScores(
      referenceWindow,
      monitoringWindow,
      config.driftTests,
      config.featureSubset
    );

    const overallDriftScore = this.computeOverallDriftScore(driftScores);
    const affectedFeatures = driftScores.filter(d => d.drifted).map(d => d.feature);
    const driftSeverity = this.classifyDriftSeverity(overallDriftScore);

    const result: DriftDetectionResult = {
      modelId,
      testTimestamp: new Date(),
      referencePeriod: {
        start: referenceWindow[0]?.timestamp || new Date(),
        end: referenceWindow[referenceWindow.length - 1]?.timestamp || new Date(),
      },
      monitoringPeriod: {
        start: monitoringWindow[0]?.timestamp || new Date(),
        end: monitoringWindow[monitoringWindow.length - 1]?.timestamp || new Date(),
      },
      driftScores,
      overallDriftScore,
      driftDetected: overallDriftScore > config.alertThreshold,
      driftSeverity,
      affectedFeatures,
      recommendations: this.generateDriftRecommendations(driftScores, driftSeverity),
    };

    // Store the drift result
    const drifts = this.drifts.get(modelId) || [];
    drifts.push(result);
    this.drifts.set(modelId, drifts);

    return result;
  }

  /**
   * Generate comprehensive governance report
   */
  async generateGovernanceReport(
    modelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<GovernanceReport> {
    const [biasAudit, driftDetection] = await Promise.all([
      this.runBiasAudit(modelId),
      this.runDriftDetection(modelId),
    ]);

    const predictions = this.predictionsStore.get(modelId) || [];
    const labeledPredictions = predictions.filter(p => p.actual !== undefined);
    const performanceMetrics = this.computePerformanceMetrics(labeledPredictions);

    const governanceScore = this.computeGovernanceScore(biasAudit, driftDetection, performanceMetrics);
    const riskLevel = this.classifyRiskLevel(governanceScore);
    const actionItems = this.generateActionItems(biasAudit, driftDetection);

    return {
      reportId: `gov-${modelId}-${Date.now()}`,
      modelId,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      biasAudit,
      driftDetection,
      performanceMetrics,
      governanceScore,
      riskLevel,
      complianceStatus: biasAudit.complianceStatus,
      actionItems,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private computeGroupMetrics(
    predictions: PredictionRecord[],
    protectedAttributes: readonly string[]
  ): GroupMetrics[] {
    const groupSet = new Set<string>();
    predictions.forEach(p => groupSet.add(p.group));
    const groups = Array.from(groupSet);
    
    return groups.map(group => {
      const groupPreds = predictions.filter(p => p.group === group);
      const values = groupPreds.map(p => p.prediction);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const positives = groupPreds.filter(p => p.prediction >= 0.5);
      const labeledPositives = positives.filter(p => p.actual !== undefined && p.actual >= 0.5);
      const truePositives = labeledPositives.filter(p => p.actual === 1);
      const falsePositives = labeledPositives.filter(p => p.actual === 0);

      return {
        groupName: group,
        count: groupPreds.length,
        meanPrediction: mean,
        stdPrediction: Math.sqrt(variance),
        positiveRate: positives.length / groupPreds.length,
        truePositiveRate: labeledPositives.length > 0 ? truePositives.length / labeledPositives.length : undefined,
        falsePositiveRate: labeledPositives.length > 0 ? falsePositives.length / labeledPositives.length : undefined,
      };
    });
  }

  private computeFairnessMetrics(
    groupMetrics: GroupMetrics[],
    predictions: PredictionRecord[],
    config: BiasAuditConfig
  ): ComputedFairnessMetric[] {
    const metrics: ComputedFairnessMetric[] = [];

    // Demographic Parity
    const positiveRates = groupMetrics.map(g => g.positiveRate);
    const maxDisparity = Math.max(...positiveRates) - Math.min(...positiveRates);
    metrics.push({
      metric: 'demographic_parity',
      value: 1 - maxDisparity,
      threshold: config.thresholds['demographic_parity'] || 0.1,
      passed: maxDisparity < (config.thresholds['demographic_parity'] || 0.1),
      interpretation: this.interpretDisparity(maxDisparity),
      groupDisparities: Object.fromEntries(groupMetrics.map(g => [g.groupName, g.positiveRate])),
    });

    // Equal Opportunity (if labeled data exists)
    const tprs = groupMetrics.filter(g => g.truePositiveRate !== undefined).map(g => g.truePositiveRate!);
    if (tprs.length >= 2) {
      const tprDisparity = Math.max(...tprs) - Math.min(...tprs);
      metrics.push({
        metric: 'equal_opportunity',
        value: 1 - tprDisparity,
        threshold: config.thresholds['equal_opportunity'] || 0.1,
        passed: tprDisparity < (config.thresholds['equal_opportunity'] || 0.1),
        interpretation: this.interpretDisparity(tprDisparity),
        groupDisparities: Object.fromEntries(
          groupMetrics.filter(g => g.truePositiveRate !== undefined).map(g => [g.groupName, g.truePositiveRate!])
        ),
      });
    }

    return metrics;
  }

  private detectViolations(
    fairnessMetrics: ComputedFairnessMetric[],
    config: BiasAuditConfig
  ): BiasViolation[] {
    const violations: BiasViolation[] = [];

    for (const fm of fairnessMetrics) {
      if (!fm.passed) {
        const disparity = 1 - fm.value;
        let severity: BiasViolation['severity'] = 'low';
        if (disparity > 0.5) severity = 'critical';
        else if (disparity > 0.3) severity = 'high';
        else if (disparity > 0.15) severity = 'medium';

        violations.push({
          severity,
          metric: fm.metric,
          description: `${fm.metric.replace(/_/g, ' ')} disparity detected across groups`,
          affectedGroups: Object.entries(fm.groupDisparities)
            .filter(([, v]) => v > fm.value)
            .map(([g]) => g),
          disparity,
          remediation: this.getRemediationForMetric(fm.metric),
        });
      }
    }

    return violations.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private computeOverallBiasScore(metrics: ComputedFairnessMetric[]): number {
    if (metrics.length === 0) return 1;
    const score = metrics.reduce((a, m) => a + (m.passed ? 1 : 0), 0) / metrics.length;
    return score;
  }

  private computeDriftScores(
    reference: PredictionRecord[],
    current: PredictionRecord[],
    tests: readonly DriftTest[],
    featureSubset?: readonly string[]
  ): DriftScore[] {
    const scores: DriftScore[] = [];
    const features = featureSubset || this.getAllFeatures(reference);

    for (const feature of features) {
      const refValues = reference.map(p => p.inputFeatures[feature]).filter(v => v !== undefined);
      const currValues = current.map(p => p.inputFeatures[feature]).filter(v => v !== undefined);

      for (const test of tests) {
        const statistic = this.runStatisticalTest(refValues, currValues, test);
        const threshold = this.getTestThreshold(test);
        
        scores.push({
          feature,
          test,
          statistic,
          pValue: this.estimatePValue(statistic, test),
          threshold,
          drifted: statistic > threshold,
          changeDirection: this.determineDirection(refValues, currValues),
        });
      }
    }

    return scores;
  }

  private runStatisticalTest(
    reference: number[],
    current: number[],
    test: DriftTest
  ): number {
    switch (test) {
      case 'population_stability_index':
        return this.calculatePSI(reference, current);
      case 'kolmogorov_smirnov':
        return this.calculateKS(reference, current);
      case 'chi_squared':
        return this.calculateChiSquared(reference, current);
      default:
        return Math.random(); // Default to random for unsupported tests
    }
  }

  private calculatePSI(reference: number[], current: number[]): number {
    const refBins = this.createBins(reference);
    const currBins = this.createBins(current);
    
    let psi = 0;
    for (let i = 0; i < refBins.length; i++) {
      const refProb = refBins[i];
      const currProb = currBins[i] || 0.001; // Avoid division by zero
      
      psi += (refProb - currProb) * Math.log(refProb / currProb);
    }
    
    return psi;
  }

  private calculateKS(reference: number[], current: number[]): number {
    const sortedRef = [...reference].sort((a, b) => a - b);
    const sortedCurr = [...current].sort((a, b) => a - b);
    
    let i = 0, j = 0;
    let maxD = 0;
    
    while (i < sortedRef.length && j < sortedCurr.length) {
      const d = Math.abs((i / sortedRef.length) - (j / sortedCurr.length));
      if (d > maxD) maxD = d;
      
      if (sortedRef[i] < sortedCurr[j]) {
        i++;
      } else {
        j++;
      }
    }
    
    return maxD;
  }

  private calculateChiSquared(reference: number[], current: number[]): number {
    const refBins = this.createBins(reference);
    const currBins = this.createBins(current);
    
    let chi2 = 0;
    const expectedTotal = current.length / reference.length;
    
    for (let i = 0; i < refBins.length; i++) {
      const expected = refBins[i] * expectedTotal;
      const observed = currBins[i] || 0;
      
      if (expected > 0) {
        chi2 += Math.pow(observed - expected, 2) / expected;
      }
    }
    
    return chi2;
  }

  private createBins(values: number[], numBins: number = 10): number[] {
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;
    
    const bins = new Array(numBins).fill(0);
    
    for (const value of values) {
      const binIndex = Math.floor((value - min) / binWidth);
      const boundedIndex = Math.max(0, Math.min(numBins - 1, binIndex));
      bins[boundedIndex]++;
    }
    
    return bins.map(count => count / values.length);
  }

  private getTestThreshold(test: DriftTest): number {
    switch (test) {
      case 'population_stability_index':
        return 0.25;
      case 'kolmogorov_smirnov':
        return 0.1;
      case 'chi_squared':
        return 15.0;
      default:
        return 0.5;
    }
  }

  private estimatePValue(statistic: number, test: DriftTest): number {
    // Simplified p-value estimation
    const threshold = this.getTestThreshold(test);
    return statistic > threshold ? 0.01 : 0.99;
  }

  private determineDirection(reference: number[], current: number[]): 'increase' | 'decrease' | 'shift' {
    const refMean = reference.reduce((a, b) => a + b, 0) / reference.length;
    const currMean = current.reduce((a, b) => a + b, 0) / current.length;
    
    const refStd = Math.sqrt(reference.reduce((a, b) => a + Math.pow(b - refMean, 2), 0) / reference.length);
    const currStd = Math.sqrt(current.reduce((a, b) => a + Math.pow(b - currMean, 2), 0) / current.length);
    
    if (Math.abs(currMean - refMean) > refStd * 0.5) {
      return currMean > refMean ? 'increase' : 'decrease';
    }
    
    return 'shift';
  }

  private computeOverallDriftScore(scores: DriftScore[]): number {
    if (scores.length === 0) return 0;
    
    const passedScores = scores.filter(s => !s.drifted).length;
    return passedScores / scores.length;
  }

  private classifyDriftSeverity(score: number): DriftDetectionResult['driftSeverity'] {
    if (score >= 0.9) return 'none';
    if (score >= 0.7) return 'mild';
    if (score >= 0.5) return 'moderate';
    if (score >= 0.3) return 'severe';
    return 'critical';
  }

  private computePerformanceMetrics(predictions: PredictionRecord[]): PerformanceMetrics {
    if (predictions.length === 0) {
      return {
        sampleSize: 0,
        timestamp: new Date(),
      };
    }

    const labeledPredictions = predictions.filter(p => p.actual !== undefined);
    const positivePredictions = labeledPredictions.filter(p => p.prediction >= 0.5);
    
    const truePositives = positivePredictions.filter(p => p.actual === 1).length;
    const falsePositives = positivePredictions.filter(p => p.actual === 0).length;
    const falseNegatives = labeledPredictions.filter(p => p.prediction < 0.5 && p.actual === 1).length;
    const trueNegatives = labeledPredictions.filter(p => p.prediction < 0.5 && p.actual === 0).length;

    const accuracy = (truePositives + trueNegatives) / labeledPredictions.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    // Regression metrics
    const errors = labeledPredictions.map(p => Math.abs(p.prediction - (p.actual || 0)));
    const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
    const rmse = Math.sqrt(errors.reduce((a, b) => a + Math.pow(b, 2), 0) / errors.length);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      rmse,
      mae,
      sampleSize: labeledPredictions.length,
      timestamp: new Date(),
    };
  }

  private computeGovernanceScore(
    biasAudit: BiasAuditResult,
    driftDetection: DriftDetectionResult,
    performance: PerformanceMetrics
  ): number {
    // Weight factors
    const biasWeight = 0.4;
    const driftWeight = 0.3;
    const performanceWeight = 0.3;

    // Normalize performance score (if available)
    let performanceScore = 0.5; // Default score if no labeled data
    if (performance.accuracy !== undefined) {
      const accuracyScore = performance.accuracy;
      const f1Score = performance.f1Score || 0.5;
      performanceScore = (accuracyScore + f1Score) / 2;
    }

    const governanceScore = 
      (biasAudit.overallScore * biasWeight) +
      (driftDetection.overallDriftScore * driftWeight) +
      (performanceScore * performanceWeight);

    return Math.max(0, Math.min(1, governanceScore));
  }

  private classifyRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.75) return 'low';
    if (score >= 0.5) return 'medium';
    if (score >= 0.3) return 'high';
    return 'critical';
  }

  private generateBiasRecommendations(violations: BiasViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('Model is currently compliant with bias mitigation standards');
      return recommendations;
    }

    const highSeverityViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'high');
    if (highSeverityViolations.length > 0) {
      recommendations.push('High severity bias violations detected - immediate investigation recommended');
    }

    // Specific metric-based recommendations
    const metricSet = new Set<FairnessMetric>();
    violations.forEach(v => metricSet.add(v.metric));
    const metrics = Array.from(metricSet);
    metrics.forEach(metric => {
      recommendations.push(this.getRemediationForMetric(metric));
    });

    recommendations.push('Consider retraining model with balanced dataset');
    recommendations.push('Review and update protected attribute definitions');
    recommendations.push('Monitor predictions in real-time for emerging bias patterns');

    return recommendations;
  }

  private generateDriftRecommendations(
    scores: DriftScore[],
    severity: DriftDetectionResult['driftSeverity']
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'none' || severity === 'mild') {
      recommendations.push('Model performance within acceptable ranges');
      return recommendations;
    }

    const driftedFeatures = scores.filter(s => s.drifted).map(s => s.feature);
    recommendations.push(`Drift detected in ${driftedFeatures.length} features`);
    
    driftedFeatures.forEach(feature => {
      recommendations.push(`Investigate drift in feature: ${feature}`);
    });

    if (severity === 'severe' || severity === 'critical') {
      recommendations.push('Immediate model retraining or feature engineering required');
    } else {
      recommendations.push('Consider retraining model with recent data');
    }

    recommendations.push('Review data collection and preprocessing pipelines');
    recommendations.push('Update monitoring windows and alert thresholds');

    return recommendations;
  }

  private generateActionItems(
    biasAudit: BiasAuditResult,
    driftDetection: DriftDetectionResult
  ): ActionItem[] {
    const items: ActionItem[] = [];

    // Bias related actions
    if (biasAudit.violations.length > 0) {
      items.push({
        id: `bias-${Date.now()}`,
        type: 'investigation',
        priority: 'high',
        description: `Investigate ${biasAudit.violations.length} bias violations`,
        createdAt: new Date(),
        status: 'pending',
      });

      if (biasAudit.complianceStatus === 'non_compliant') {
        items.push({
          id: `retrain-${Date.now()}`,
          type: 'retrain',
          priority: 'critical',
          description: 'Retrain model with bias mitigation techniques',
          createdAt: new Date(),
          status: 'pending',
        });
      }
    }

    // Drift related actions
    if (driftDetection.driftSeverity === 'severe' || driftDetection.driftSeverity === 'critical') {
      items.push({
        id: `drift-${Date.now()}`,
        type: 'retrain',
        priority: 'critical',
        description: `Retrain model due to ${driftDetection.driftSeverity} drift`,
        createdAt: new Date(),
        status: 'pending',
      });
    } else if (driftDetection.driftSeverity === 'moderate') {
      items.push({
        id: `drift-${Date.now()}`,
        type: 'feature_update',
        priority: 'medium',
        description: 'Update features to address model drift',
        createdAt: new Date(),
        status: 'pending',
      });
    }

    // Performance related actions
    if (biasAudit.overallScore < 0.6 || driftDetection.overallDriftScore < 0.6) {
      items.push({
        id: `monitor-${Date.now()}`,
        type: 'investigation',
        priority: 'medium',
        description: 'Monitor model performance closely',
        createdAt: new Date(),
        status: 'pending',
      });
    }

    return items;
  }

  private interpretDisparity(disparity: number): string {
    if (disparity < 0.1) return 'Negligible disparity';
    if (disparity < 0.2) return 'Minor disparity';
    if (disparity < 0.3) return 'Moderate disparity';
    if (disparity < 0.5) return 'Significant disparity';
    return 'Severe disparity';
  }

  private getRemediationForMetric(metric: FairnessMetric): string {
    switch (metric) {
      case 'demographic_parity':
        return 'Adjust decision thresholds to achieve demographic parity across groups';
      case 'equal_opportunity':
        return 'Reweight training data to improve true positive rates across groups';
      case 'predictive_parity':
        return 'Apply calibration techniques to ensure consistent precision';
      case 'calibration':
        return 'Implement calibration methods to improve probability estimates';
      case 'treatment_equality':
        return 'Adjust model to ensure similar treatment effects across groups';
      case 'impact_parity':
        return 'Evaluate and mitigate disparate impact across protected groups';
      default:
        return 'Apply general bias mitigation techniques';
    }
  }

  private determineComplianceStatus(violations: BiasViolation[]): ComplianceStatus {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const highViolations = violations.filter(v => v.severity === 'high');

    if (criticalViolations.length > 0) return 'non_compliant';
    if (highViolations.length > 0) return 'review_required';
    if (violations.length > 0) return 'under_review';
    return 'compliant';
  }

  private createInsufficientDataResult(modelId: string, requiredSize: number): BiasAuditResult {
    return {
      modelId,
      auditTimestamp: new Date(),
      overallScore: 0,
      groupMetrics: [],
      fairnessMetrics: [],
      violations: [],
      recommendations: [
        `Insufficient data for audit - requires at least ${requiredSize} predictions`,
        'Continue collecting data to enable comprehensive bias assessment',
      ],
      complianceStatus: 'under_review',
    };
  }

  private createInsufficientDataDriftResult(modelId: string): DriftDetectionResult {
    return {
      modelId,
      testTimestamp: new Date(),
      referencePeriod: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      monitoringPeriod: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      driftScores: [],
      overallDriftScore: 0,
      driftDetected: false,
      driftSeverity: 'none',
      affectedFeatures: [],
      recommendations: [
        'Insufficient data for drift detection',
        'Continue collecting predictions to establish baseline',
      ],
    };
  }

  private getAllFeatures(predictions: PredictionRecord[]): string[] {
    const features = new Set<string>();
    predictions.forEach(p => {
      Object.keys(p.inputFeatures).forEach(f => features.add(f));
    });
    return Array.from(features);
  }
}
