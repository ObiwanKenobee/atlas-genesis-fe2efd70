/**
 * EthosDAO Service
 * Handles collective workspace operations including members, proposals, achievements, and impact metrics
 */

import { query } from '../db';
import { Request } from 'express';

interface SecurityContext {
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// Security event logger mock
const logSecurityEvent = async (
  event: { type: string; userId?: string; details: Record<string, any> },
  _req?: Request,
  _context?: SecurityContext
) => {
  console.log('Security Event:', event);
};

export interface EthosMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  contributions: number;
  impactLevel: string;
  expertise: string[];
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'voting' | 'passed' | 'rejected';
  votesYes: number;
  votesNo: number;
  totalVotes: number;
  yesPercent: number;
  proposerId: string;
  proposerName: string;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  createdAt: Date;
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  category: string;
  updatedAt: Date;
}

export interface CollectiveData {
  members: EthosMember[];
  proposals: Proposal[];
  achievements: Achievement[];
  impactMetrics: ImpactMetric[];
  totalCarbonSequestered: number;
  totalWaterConserved: number;
  totalActiveStewards: number;
  biodiversityScore: number;
}

// CRUD Operations for Members
export const ethosDaoService = {
  /**
   * Get all collective members
   */
  async getMembers(limit: number = 50, offset: number = 0): Promise<EthosMember[]> {
    try {
      const result = await query(
        'SELECT * FROM ethosdao_members ORDER BY contributions DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching EthosDAO members:', error);
      throw error;
    }
  },

  /**
   * Get member by ID
   */
  async getMemberById(id: string): Promise<EthosMember | null> {
    try {
      const result = await query(
        'SELECT * FROM ethosdao_members WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching EthosDAO member:', error);
      throw error;
    }
  },

  /**
   * Create a new member
   */
  async createMember(member: Omit<EthosMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<EthosMember> {
    try {
      const result = await query(
        `INSERT INTO ethosdao_members (name, role, avatar, status, contributions, impact_level, expertise, joined_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          member.name,
          member.role,
          member.avatar,
          member.status,
          member.contributions,
          member.impactLevel,
          JSON.stringify(member.expertise),
          member.joinedAt
        ]
      );

      await logSecurityEvent(
        { type: 'ETHDOS_MEMBER_CREATED', userId: member.name, details: { memberId: result.rows[0].id, role: member.role } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating EthosDAO member:', error);
      throw error;
    }
  },

  /**
   * Update a member
   */
  async updateMember(id: string, updates: Partial<EthosMember>): Promise<EthosMember | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.status !== undefined) {
        setClauses.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }
      if (updates.contributions !== undefined) {
        setClauses.push(`contributions = $${paramIndex++}`);
        values.push(updates.contributions);
      }
      if (updates.impactLevel !== undefined) {
        setClauses.push(`impact_level = $${paramIndex++}`);
        values.push(updates.impactLevel);
      }
      if (updates.expertise !== undefined) {
        setClauses.push(`expertise = $${paramIndex++}`);
        values.push(JSON.stringify(updates.expertise));
      }

      if (setClauses.length === 0) return null;

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const result = await query(
        `UPDATE ethosdao_members SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating EthosDAO member:', error);
      throw error;
    }
  },

  /**
   * Delete a member
   */
  async deleteMember(id: string): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM ethosdao_members WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length > 0) {
        await logSecurityEvent(
          { type: 'ETHDOS_MEMBER_DELETED', userId: id, details: { memberId: id } }
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting EthosDAO member:', error);
      throw error;
    }
  },

  // CRUD Operations for Proposals
  async getProposals(status?: string, limit: number = 20): Promise<Proposal[]> {
    try {
      let queryText = 'SELECT * FROM ethosdao_proposals';
      const params: any[] = [];

      if (status) {
        queryText += ' WHERE status = $1';
        params.push(status);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  async getProposalById(id: string): Promise<Proposal | null> {
    try {
      const result = await query(
        'SELECT * FROM ethosdao_proposals WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  },

  async createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposal> {
    try {
      const result = await query(
        `INSERT INTO ethosdao_proposals (title, description, status, votes_yes, votes_no, total_votes, yes_percent, proposer_id, proposer_name, ends_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          proposal.title,
          proposal.description,
          proposal.status,
          proposal.votesYes,
          proposal.votesNo,
          proposal.totalVotes,
          proposal.yesPercent,
          proposal.proposerId,
          proposal.proposerName,
          proposal.endsAt
        ]
      );

      await logSecurityEvent(
        { type: 'ETHDOS_PROPOSAL_CREATED', userId: proposal.proposerId, details: { proposalId: result.rows[0].id } }
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal | null> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.status !== undefined) {
        setClauses.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }
      if (updates.votesYes !== undefined) {
        setClauses.push(`votes_yes = $${paramIndex++}`);
        values.push(updates.votesYes);
      }
      if (updates.votesNo !== undefined) {
        setClauses.push(`votes_no = $${paramIndex++}`);
        values.push(updates.votesNo);
      }
      if (updates.yesPercent !== undefined) {
        setClauses.push(`yes_percent = $${paramIndex++}`);
        values.push(updates.yesPercent);
      }

      if (setClauses.length === 0) return null;

      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const result = await query(
        `UPDATE ethosdao_proposals SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },

  async voteOnProposal(proposalId: string, vote: 'yes' | 'no', userId: string): Promise<Proposal | null> {
    try {
      const column = vote === 'yes' ? 'votes_yes' : 'votes_no';
      const result = await query(
        `UPDATE ethosdao_proposals 
         SET ${column} = ${column} + 1,
             total_votes = total_votes + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [proposalId]
      );

      await logSecurityEvent(
        { type: 'ETHDOS_PROPOSAL_VOTED', userId, details: { proposalId, vote } }
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error voting on proposal:', error);
      throw error;
    }
  },

  async deleteProposal(id: string): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM ethosdao_proposals WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  },

  // CRUD Operations for Achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const result = await query(
        'SELECT * FROM ethosdao_achievements ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },

  async createAchievement(achievement: Omit<Achievement, 'id' | 'createdAt'>): Promise<Achievement> {
    try {
      const result = await query(
        `INSERT INTO ethosdao_achievements (title, description, icon, unlocked_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [achievement.title, achievement.description, achievement.icon, achievement.unlockedAt]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  },

  // Impact Metrics
  async getImpactMetrics(): Promise<ImpactMetric[]> {
    try {
      const result = await query(
        'SELECT * FROM ethosdao_impact_metrics ORDER BY category, label'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching impact metrics:', error);
      throw error;
    }
  },

  async updateImpactMetric(id: string, value: string, change: string): Promise<ImpactMetric | null> {
    try {
      const result = await query(
        `UPDATE ethosdao_impact_metrics 
         SET value = $1, change_text = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [value, change, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating impact metric:', error);
      throw error;
    }
  },

  // Get all collective data
  async getCollectiveData(): Promise<CollectiveData> {
    try {
      const [members, proposals, achievements, metrics] = await Promise.all([
        this.getMembers(20, 0),
        this.getProposals(undefined, 10),
        this.getAchievements(),
        this.getImpactMetrics()
      ]);

      const carbonMetric = metrics.find((m: ImpactMetric) => m.category === 'carbon');
      const waterMetric = metrics.find((m: ImpactMetric) => m.category === 'water');
      const stewardsMetric = metrics.find((m: ImpactMetric) => m.category === 'stewards');
      const biodiversityMetric = metrics.find((m: ImpactMetric) => m.category === 'biodiversity');

      return {
        members,
        proposals,
        achievements,
        impactMetrics: metrics,
        totalCarbonSequestered: carbonMetric ? parseFloat(carbonMetric.value) : 12234,
        totalWaterConserved: waterMetric ? parseFloat(waterMetric.value) : 450000000,
        totalActiveStewards: stewardsMetric ? parseInt(stewardsMetric.value) : 2847,
        biodiversityScore: biodiversityMetric ? parseInt(biodiversityMetric.value) : 87
      };
    } catch (error) {
      console.error('Error fetching collective data:', error);
      throw error;
    }
  }
};

export default ethosDaoService;
