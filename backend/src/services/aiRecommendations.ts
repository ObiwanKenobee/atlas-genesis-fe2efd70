/**
 * AI Recommendations Service
 * ML-based project recommendations and carbon forecasting
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CarbonPrediction,
  ProjectRecommendation,
  SmartInsight,
  UserBehaviorProfile,
  PredictionFactor,
  RiskFactor
} from '../types/aiPredictions';

// Simulated ML model results (in production, these would come from actual ML models)
interface MLModelResult {
  prediction: number;
  confidence: number;
  factors: Record<string, number>;
}

class AIRecommendationsService {
  private carbonModels: Map<string, MLModelResult> = new Map();
  private recommendationCache: Map<string, { data: ProjectRecommendation[]; timestamp: number }> = new Map();
  private insightsCache: SmartInsight[] = [];
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();

  /**
   * Generate carbon sequestration prediction for a project
   */
  async predictCarbonSequestration(
    projectId: string,
    period: 'month' | 'quarter' | 'year' | '5year' | '10year' = 'year'
  ): Promise<CarbonPrediction> {
    // Simulate ML model prediction
    const baseSequestration = this.getBaseSequestration(projectId);
    const growthRate = this.calculateGrowthRate(projectId);
    const seasonalVariation = Math.random() * 0.15;
    
    const periods: Record<string, number> = { month: 1, quarter: 3, year: 12, '5year': 60, '10year': 120 };
    const months = periods[period];
    
    // ML-based prediction calculation
    const predictedGrowth = baseSequestration * growthRate * months;
    const confidenceScore = 0.75 + Math.random() * 0.2; // 75-95% confidence
    
    const factors = this.generatePredictionFactors(projectId, baseSequestration, growthRate);
    const riskFactors = this.identifyRiskFactors(projectId);
    
    return {
      projectId,
      currentSequestration: baseSequestration,
      predictedSequestration: baseSequestration + predictedGrowth,
      confidenceScore,
      predictionPeriod: period,
      startDate: new Date().toISOString(),
      endDate: this.calculateEndDate(period),
      factors,
      trend: growthRate > 0.05 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable',
      seasonalVariation,
      riskFactors,
      recommendations: this.generateCarbonRecommendations(growthRate, riskFactors)
    };
  }

  /**
   * Generate personalized project recommendations based on user behavior
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<ProjectRecommendation[]> {
    const cacheKey = `${userId}:${Date.now()}`;
    const cached = this.recommendationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.data.slice(0, limit);
    }

    const profile = await this.getUserBehaviorProfile(userId);
    const projects = await this.getAvailableProjects();
    
    // ML-based scoring
    const scoredProjects = projects.map(project => ({
      ...project,
      relevanceScore: this.calculateRelevanceScore(project, profile),
      reasons: this.generateRecommendationReasons(project, profile)
    }));

    // Sort by relevance and return top N
    const recommendations = scoredProjects
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    this.recommendationCache.set(cacheKey, {
      data: recommendations,
      timestamp: Date.now()
    });

    return recommendations;
  }

  /**
   * Generate smart insights based on platform data
   */
  async generateSmartInsights(): Promise<SmartInsight[]> {
    // Check cache
    if (this.insightsCache.length > 0 && Math.random() > 0.3) {
      return this.insightsCache;
    }

    const insights: SmartInsight[] = [];
    
    // Generate various types of insights
    insights.push(this.generateCarbonInsight());
    insights.push(this.generateTrendInsight());
    insights.push(this.generateOpportunityInsight());
    insights.push(this.generateWarningInsight());
    insights.push(this.generateAnomalyInsight());

    this.insightsCache = insights;
    return insights;
  }

  /**
   * Analyze user behavior and build profile
   */
  async analyzeUserBehavior(userId: string): Promise<UserBehaviorProfile> {
    const existingProfile = this.behaviorProfiles.get(userId);
    
    if (existingProfile) {
      // Update profile with new data
      const updatedProfile = this.updateBehaviorProfile(existingProfile);
      this.behaviorProfiles.set(userId, updatedProfile);
      return updatedProfile;
    }

    // Create new profile (in production, this would analyze historical data)
    const newProfile: UserBehaviorProfile = {
      userId,
      interests: [
        { category: 'forest_conservation', score: 0.85, keywords: ['trees', 'forest', 'carbon'] },
        { category: 'ocean_conservation', score: 0.72, keywords: ['ocean', 'marine', 'reefs'] },
        { category: 'community_development', score: 0.68, keywords: ['community', 'local', 'indigenous'] }
      ],
      engagementScore: 0.78,
      preferredImpactAreas: ['carbon_reduction', 'biodiversity'],
      donationPatterns: [
        {
          averageAmount: 150,
          frequency: 'monthly',
          preferredCategories: ['forest_conservation', 'ocean_conservation'],
          preferredProjectSize: 'medium'
        }
      ],
      projectInteractions: [],
      recommendationsEnabled: true,
      lastAnalyzed: new Date().toISOString()
    };

    this.behaviorProfiles.set(userId, newProfile);
    return newProfile;
  }

  // Private helper methods

  private getBaseSequestration(projectId: string): number {
    // Simulate project-specific base sequestration
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 100 + (hash % 1000);
  }

  private calculateGrowthRate(projectId: string): number {
    // Simulate growth rate based on project characteristics
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 0.02 + (hash % 100) / 1000;
  }

  private generatePredictionFactors(
    projectId: string,
    baseSequestration: number,
    growthRate: number
  ): PredictionFactor[] {
    return [
      {
        name: 'Forest Density',
        impact: 0.35,
        value: `${Math.floor(60 + Math.random() * 30)}%`,
        description: 'Percentage of forest cover in project area'
      },
      {
        name: 'Soil Quality',
        impact: 0.25,
        value: 'Good',
        description: 'Soil carbon storage capacity'
      },
      {
        name: 'Climate Zone',
        impact: 0.20,
        value: 'Tropical',
        description: 'Regional climate classification'
      },
      {
        name: 'Species Diversity',
        impact: 0.15,
        value: `${Math.floor(20 + Math.random() * 80)} species`,
        description: 'Number of plant species'
      },
      {
        name: 'Protection Status',
        impact: 0.05,
        value: 'Full',
        description: 'Level of legal protection'
      }
    ];
  }

  private identifyRiskFactors(projectId: string): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const rand = Math.random();
    
    if (rand > 0.6) {
      factors.push({
        name: 'Climate Volatility',
        severity: rand > 0.8 ? 'high' : 'medium',
        probability: 0.25,
        mitigation: 'Diversify species composition and implement adaptive management'
      });
    }
    if (rand > 0.4) {
      factors.push({
        name: 'Policy Uncertainty',
        severity: 'medium',
        probability: 0.35,
        mitigation: 'Engage with policymakers and establish long-term agreements'
      });
    }
    if (rand > 0.7) {
      factors.push({
        name: 'Illegal Activity Risk',
        severity: rand > 0.85 ? 'high' : 'low',
        probability: 0.15,
        mitigation: 'Partner with local enforcement and community watch programs'
      });
    }
    
    return factors;
  }

  private generateCarbonRecommendations(
    growthRate: number,
    risks: RiskFactor[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (growthRate < 0.05) {
      recommendations.push('Consider introducing faster-growing native species to accelerate carbon uptake');
    }
    if (risks.some(r => r.severity === 'high')) {
      recommendations.push('Priority: Address high-severity risk factors to protect carbon assets');
    }
    recommendations.push('Implement regular monitoring to track carbon sequestration progress');
    recommendations.push('Consider expanding project boundaries to increase total impact');
    
    return recommendations;
  }

  private calculateEndDate(period: string): string {
    const months: Record<string, number> = {
      month: 1, quarter: 3, year: 12, '5year': 60, '10year': 120
    };
    const date = new Date();
    date.setMonth(date.getMonth() + (months[period] || 12));
    return date.toISOString();
  }

  private calculateRelevanceScore(
    project: ProjectRecommendation,
    profile: UserBehaviorProfile
  ): number {
    let score = 0.5; // Base score
    
    // Category alignment
    const categoryMatch = profile.interests.find(
      i => i.category.toLowerCase().includes(project.category.toLowerCase())
    );
    if (categoryMatch) {
      score += categoryMatch.score * 0.3;
    }
    
    // Impact area alignment
    const impactAlignment = profile.preferredImpactAreas.some(
      area => project.tags.some(tag => tag.toLowerCase().includes(area.toLowerCase()))
    );
    if (impactAlignment) {
      score += 0.15;
    }
    
    return Math.min(score, 1);
  }

  private generateRecommendationReasons(
    project: ProjectRecommendation,
    profile: UserBehaviorProfile
  ): string[] {
    const reasons: string[] = [];
    
    if (project.alignmentWithGoals > 0.8) {
      reasons.push('Strong alignment with your stated impact goals');
    }
    if (profile.interests.some(i => i.category === project.category)) {
      reasons.push(`Matches your interest in ${project.category}`);
    }
    if (project.riskLevel === 'low') {
      reasons.push('Low-risk investment with proven track record');
    }
    if (project.expectedImpact.carbonReduction > 1000) {
      reasons.push(`High carbon impact potential (${project.expectedImpact.carbonReduction}t CO2)`);
    }
    
    return reasons.slice(0, 3);
  }

  private async getAvailableProjects(): Promise<ProjectRecommendation[]> {
    // Simulated project data (in production, fetch from database)
    const categories = ['forest_conservation', 'ocean_conservation', 'renewable_energy', 'community_development'];
    
    return categories.flatMap(category =>
      Array.from({ length: 3 }, (_, i) => ({
        id: uuidv4(),
        projectId: `project-${category}-${i}`,
        projectName: `${category.replace(/_/g, ' ')} Project ${i + 1}`,
        category,
        relevanceScore: 0.5 + Math.random() * 0.5,
        reasons: ['Aligned with your interests', 'High impact potential'],
        expectedImpact: {
          carbonReduction: Math.floor(100 + Math.random() * 2000),
          waterConservation: Math.floor(10 + Math.random() * 500),
          biodiversityScore: Math.floor(50 + Math.random() * 50),
          communityBenefit: Math.floor(30 + Math.random() * 70),
          regenerationScore: Math.floor(40 + Math.random() * 60)
        },
        estimatedCost: Math.floor(10000 + Math.random() * 90000),
        timeToImpact: '1 year',
        alignmentWithGoals: 0.6 + Math.random() * 0.4,
        riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        tags: [category, 'verified', 'impact']
      }))
    );
  }

  private async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    const savedProfile = this.behaviorProfiles.get(userId);
    if (savedProfile) {
      return savedProfile;
    }
    
    return {
      userId,
      interests: [],
      engagementScore: 0.5,
      preferredImpactAreas: [],
      donationPatterns: [{
        averageAmount: 100,
        frequency: 'monthly',
        preferredCategories: [],
        preferredProjectSize: 'medium'
      }],
      projectInteractions: [],
      recommendationsEnabled: true,
      lastAnalyzed: new Date().toISOString()
    };
  }

  private updateBehaviorProfile(profile: UserBehaviorProfile): UserBehaviorProfile {
    // Simulate profile update with new data
    return {
      ...profile,
      engagementScore: Math.min(1, profile.engagementScore + 0.01),
      lastAnalyzed: new Date().toISOString()
    };
  }

  private generateCarbonInsight(): SmartInsight {
    return {
      id: uuidv4(),
      type: 'prediction',
      title: 'Carbon Sequestration Surge Expected',
      description: 'Based on recent growth patterns, several forest projects are projected to exceed annual carbon targets by 15-20%.',
      confidence: 0.88,
      impact: 'high',
      category: 'carbon',
      actionable: true,
      actionItems: ['Review top-performing projects', 'Consider scaling successful interventions'],
      relatedMetrics: ['carbon_absorption', 'forest_growth', 'biomass_accumulation'],
      createdAt: new Date().toISOString()
    };
  }

  private generateTrendInsight(): SmartInsight {
    return {
      id: uuidv4(),
      type: 'trend',
      title: 'Community-Led Projects Gaining Momentum',
      description: 'Projects with strong community involvement show 2.3x better long-term sustainability outcomes.',
      confidence: 0.82,
      impact: 'medium',
      category: 'community',
      actionable: true,
      actionItems: ['Prioritize community proposals', 'Invest in community capacity building'],
      createdAt: new Date().toISOString()
    };
  }

  private generateOpportunityInsight(): SmartInsight {
    return {
      id: uuidv4(),
      type: 'opportunity',
      title: 'Blue Carbon Projects Underfunded',
      description: 'Ocean-based carbon projects represent only 5% of portfolio but show exceptional cost-effectiveness.',
      confidence: 0.79,
      impact: 'high',
      category: 'carbon',
      actionable: true,
      actionItems: ['Review ocean conservation opportunities', 'Consider pilot investment in blue carbon'],
      createdAt: new Date().toISOString()
    };
  }

  private generateWarningInsight(): SmartInsight {
    return {
      id: uuidv4(),
      type: 'warning',
      title: 'Dry Season Impact Alert',
      description: 'Several projects in Mediterranean climates showing stress indicators. Consider supplementary irrigation.',
      confidence: 0.91,
      impact: 'high',
      category: 'biodiversity',
      actionable: true,
      actionItems: ['Assess water needs', 'Implement drought mitigation strategies'],
      createdAt: new Date().toISOString()
    };
  }

  private generateAnomalyInsight(): SmartInsight {
    return {
      id: uuidv4(),
      type: 'anomaly',
      title: 'Unusual Donation Pattern Detected',
      description: 'Micro-donations under $10 have increased 340% this month, indicating growing grassroots support.',
      confidence: 0.85,
      impact: 'low',
      category: 'finance',
      actionable: false,
      createdAt: new Date().toISOString()
    };
  }
}

export const aiRecommendationsService = new AIRecommendationsService();
export default aiRecommendationsService;
