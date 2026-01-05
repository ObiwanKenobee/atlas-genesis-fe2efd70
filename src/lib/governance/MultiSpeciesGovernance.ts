// Multi-Species Governance System
export interface SpeciesRepresentation {
  speciesName: string;
  populationHealth: number; // 0-100
  habitatIntegrity: number; // 0-100
  votingWeight: number;
  representative: 'ecosystem_guardian' | 'ai_advocate' | 'community_voice';
}

export interface EcosystemVote {
  proposalId: string;
  speciesVotes: Map<string, boolean>;
  humanVotes: Map<string, boolean>;
  ecosystemHealthWeight: number;
  communityConsensus: boolean;
  futureGenerationImpact: number;
}

export interface SevenGenerationDecision {
  proposalId: string;
  currentImpact: number;
  generation2Impact: number; // 20 years
  generation3Impact: number; // 40 years
  generation7Impact: number; // 140 years
  overallSustainability: number;
  approved: boolean;
}

export class MultiSpeciesGovernance {
  private speciesRegistry: Map<string, SpeciesRepresentation> = new Map();
  private ecosystemVotes: Map<string, EcosystemVote> = new Map();
  private sevenGenDecisions: Map<string, SevenGenerationDecision> = new Map();

  async registerSpeciesRepresentation(species: SpeciesRepresentation): Promise<void> {
    // Calculate voting weight based on ecosystem role and health
    const baseWeight = species.populationHealth * 0.4 + species.habitatIntegrity * 0.6;
    species.votingWeight = baseWeight / 100;
    
    this.speciesRegistry.set(species.speciesName, species);
  }

  async submitEcosystemProposal(
    proposalId: string,
    description: string,
    ecosystemImpact: { positive: string[]; negative: string[]; neutral: string[] }
  ): Promise<EcosystemVote> {
    const vote: EcosystemVote = {
      proposalId,
      speciesVotes: new Map(),
      humanVotes: new Map(),
      ecosystemHealthWeight: 0,
      communityConsensus: false,
      futureGenerationImpact: 0
    };

    // Calculate ecosystem health weight
    let totalHealthWeight = 0;
    let speciesCount = 0;

    for (const [speciesName, species] of this.speciesRegistry) {
      // Simulate species "vote" based on ecosystem impact
      const speciesImpact = this.assessSpeciesImpact(species, ecosystemImpact);
      vote.speciesVotes.set(speciesName, speciesImpact > 0);
      
      totalHealthWeight += species.populationHealth * species.votingWeight;
      speciesCount++;
    }

    vote.ecosystemHealthWeight = speciesCount > 0 ? totalHealthWeight / speciesCount : 0;
    this.ecosystemVotes.set(proposalId, vote);

    return vote;
  }

  async castHumanVote(
    proposalId: string,
    voterId: string,
    vote: boolean,
    generationRepresented: 'current' | 'youth' | 'elder' | 'unborn'
  ): Promise<boolean> {
    const ecosystemVote = this.ecosystemVotes.get(proposalId);
    if (!ecosystemVote) return false;

    // Weight votes based on generation representation
    const generationWeights = {
      current: 1.0,
      youth: 1.5,    // Higher weight for future impact
      elder: 1.3,    // Higher weight for wisdom
      unborn: 2.0    // Highest weight for future generations
    };

    const weightedVote = vote ? generationWeights[generationRepresented] : -generationWeights[generationRepresented];
    ecosystemVote.humanVotes.set(voterId, vote);

    return true;
  }

  async evaluateSevenGenerationImpact(
    proposalId: string,
    proposal: {
      carbonImpact: number;
      biodiversityImpact: number;
      communityImpact: number;
      economicImpact: number;
    }
  ): Promise<SevenGenerationDecision> {
    // Simulate 7-generation impact assessment
    const currentImpact = proposal.carbonImpact + proposal.biodiversityImpact + 
                         proposal.communityImpact + proposal.economicImpact;

    // Model degradation/improvement over time
    const generation2Impact = currentImpact * 0.8 + (proposal.biodiversityImpact * 0.3);
    const generation3Impact = currentImpact * 0.6 + (proposal.biodiversityImpact * 0.5);
    const generation7Impact = currentImpact * 0.4 + (proposal.biodiversityImpact * 0.8);

    const overallSustainability = (currentImpact + generation2Impact + 
                                  generation3Impact + generation7Impact) / 4;

    const decision: SevenGenerationDecision = {
      proposalId,
      currentImpact,
      generation2Impact,
      generation3Impact,
      generation7Impact,
      overallSustainability,
      approved: overallSustainability > 60 // Threshold for approval
    };

    this.sevenGenDecisions.set(proposalId, decision);
    return decision;
  }

  async finalizeEcosystemDecision(proposalId: string): Promise<{
    approved: boolean;
    speciesConsensus: number;
    humanConsensus: number;
    ecosystemHealthScore: number;
    futureGenerationScore: number;
    overallScore: number;
  }> {
    const vote = this.ecosystemVotes.get(proposalId);
    const sevenGenDecision = this.sevenGenDecisions.get(proposalId);
    
    if (!vote || !sevenGenDecision) {
      return {
        approved: false,
        speciesConsensus: 0,
        humanConsensus: 0,
        ecosystemHealthScore: 0,
        futureGenerationScore: 0,
        overallScore: 0
      };
    }

    // Calculate species consensus
    const speciesYes = Array.from(vote.speciesVotes.values()).filter(v => v).length;
    const speciesTotal = vote.speciesVotes.size;
    const speciesConsensus = speciesTotal > 0 ? (speciesYes / speciesTotal) * 100 : 0;

    // Calculate human consensus
    const humanYes = Array.from(vote.humanVotes.values()).filter(v => v).length;
    const humanTotal = vote.humanVotes.size;
    const humanConsensus = humanTotal > 0 ? (humanYes / humanTotal) * 100 : 0;

    // Ecosystem health score
    const ecosystemHealthScore = vote.ecosystemHealthWeight;

    // Future generation score
    const futureGenerationScore = sevenGenDecision.overallSustainability;

    // Overall score (weighted)
    const overallScore = (
      speciesConsensus * 0.3 +
      humanConsensus * 0.25 +
      ecosystemHealthScore * 0.25 +
      futureGenerationScore * 0.2
    );

    const approved = overallScore >= 70 && speciesConsensus >= 60 && futureGenerationScore >= 60;

    return {
      approved,
      speciesConsensus,
      humanConsensus,
      ecosystemHealthScore,
      futureGenerationScore,
      overallScore
    };
  }

  private assessSpeciesImpact(
    species: SpeciesRepresentation,
    ecosystemImpact: { positive: string[]; negative: string[]; neutral: string[] }
  ): number {
    let impact = 0;
    
    // Simulate species-specific impact assessment
    if (ecosystemImpact.positive.includes('habitat_restoration')) impact += 30;
    if (ecosystemImpact.positive.includes('food_source_increase')) impact += 20;
    if (ecosystemImpact.positive.includes('pollution_reduction')) impact += 25;
    
    if (ecosystemImpact.negative.includes('habitat_disruption')) impact -= 40;
    if (ecosystemImpact.negative.includes('noise_pollution')) impact -= 15;
    if (ecosystemImpact.negative.includes('chemical_exposure')) impact -= 35;

    // Weight by species health
    return impact * (species.populationHealth / 100);
  }
}

export const multiSpeciesGovernance = new MultiSpeciesGovernance();