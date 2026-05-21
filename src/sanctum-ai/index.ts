/**
 * Atlas Sanctum AI — Public API
 * Single import point for the entire 10-layer civilizational intelligence system.
 */

// Types
export * from './AtlasSanctumAI.types';

// Layers
export { FoundationalReasoningLayer, EthicalReasoningKernel, CORE_ETHICAL_PRINCIPLES, aStarSearch, ForwardChainingEngine } from './layers/Layer1_FoundationalReasoning';
export { PredictiveIntelligenceLayer, BayesianNetwork, ClimateForecastingEngine, RiskAnalysisEngine, InfrastructureStressSimulator } from './layers/Layer2_PredictiveIntelligence';
export { OptimizationLayer, ResourceAllocationEngine, EnergyGridOptimizer, CarbonRestorationCoordinator, WaterAgriculturePlanner } from './layers/Layer3_Optimization';
export { LearningLayer, QLearningAgent, AdaptivePolicyManager, EcologicalFeedbackIntegrator, GovernanceLearningSystem } from './layers/Layer4_Learning';
export { NeuralPerceptionLayer, SatelliteAnalysisPipeline, DroneObservationProcessor, OceanIntelligenceAggregator, AnomalyDetector } from './layers/Layer5_NeuralPerception';
export { LanguageCulturalLayer, MultilingualReasoningEngine, TreatyAnalysisEngine, IndigenousKnowledgeSystem, PolicyCopilot } from './layers/Layer6_LanguageCultural';
export { MultiAgentCivilizationLayer, AgentRegistry, CoalitionBuilder, GovernanceAgent, EconomicsAgent, RestorationAgent, EthicsAgent } from './agents/Layer7_MultiAgentCivilization';
export { MemoryKnowledgeFabricLayer, VectorStore, CivilizationMemoryManager, EcosystemIntelligenceArchive, HistoricalReasoningSystem } from './memory/Layer8_MemoryKnowledgeFabric';
export { TrustVerificationLayer, BlockchainAnchoringService, ZKProofManager, CarbonValidationPipeline, GovernanceTransparencyLedger } from './trust/Layer9_TrustVerification';
export { PlanetaryInterfaceLayer, DigitalTwinManager, PlanetaryDashboardAggregator, GeospatialVisualizationBuilder, SimulationScenarioRunner, RealTimeEcosystemMonitor } from './interface/Layer10_PlanetaryInterface';

// Orchestrator
export { AtlasSanctumAI, AtlasSanctumAISystem, DEFAULT_CONFIG } from './AtlasSanctumAI.orchestrator';
export type { AtlasSanctumAIConfig, CivilizationalRequest, CivilizationalResponse } from './AtlasSanctumAI.orchestrator';

// Governance
export { ConstitutionalGovernanceFramework, BioregionalEthicsCouncil, ModelGovernanceFramework, SevenGenerationPlanner, CONSTITUTIONAL_PRINCIPLES } from './governance/ConstitutionalGovernance';

// API & Deployment
export { createAtlasSanctumRouter, API_ROUTES, KAFKA_TOPICS, INFRASTRUCTURE_TOPOLOGY } from './AtlasSanctumAI.api';
export { DEPLOYMENT_ROADMAP, TECHNOLOGY_STACK } from './deployment/DeploymentRoadmap';
