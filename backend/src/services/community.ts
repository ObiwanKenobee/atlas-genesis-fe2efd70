import { query } from '../db';

export interface CommunitySegment {
  id: number;
  name: string;
  description: string;
  primary_customers: string;
  what_is_being_priced: string;
  pricing_mechanism: string;
  price_range: string;
  value_justification: string;
  features: string[];
  benefits: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityProgram {
  id: number;
  name: string;
  description: string;
  participants: string;
  features: string[];
  program_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityTestimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  impact: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityResource {
  id: number;
  name: string;
  description: string;
  format: string;
  duration: string;
  file_url: string;
  difficulty_level: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityEvent {
  id: number;
  name: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  max_attendees: number;
  current_attendees: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityGovernance {
  id: number;
  name: string;
  description: string;
  structure: string;
  voting_system: string;
  decision_process: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityStatistics {
  id: number;
  total_members: number;
  active_stewards: number;
  total_projects: number;
  community_impact: number;
  regions_covered: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramRegistration {
  id: number;
  program_id: number;
  user_id: number;
  registration_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class CommunityService {
  static async getSegments(): Promise<CommunitySegment[]> {
    try {
      const result = await query(`
        SELECT 
          cs.*,
          COALESCE(cs.price_range, 'Free / Subsidized') as price_range,
          COALESCE(cs.pricing_mechanism, 'Free / Grant-backed') as pricing_mechanism,
          COALESCE(cs.value_justification, 'Prevents capture and mission drift') as value_justification
        FROM community_segments cs
        WHERE cs.is_active = true
        ORDER BY cs.display_order ASC
      `);
      return result.rows as CommunitySegment[];
    } catch (error) {
      console.error('Get community segments error:', error);
      throw new Error('Failed to fetch community segments');
    }
  }

  static async getPrograms(): Promise<CommunityProgram[]> {
    try {
      const result = await query(`
        SELECT 
          cp.*,
          COALESCE(cp.participants, '0') as participants,
          COALESCE(cp.description, 'Community engagement program') as description
        FROM community_programs cp
        WHERE cp.is_active = true
        ORDER BY cp.display_order ASC
      `);
      return result.rows as CommunityProgram[];
    } catch (error) {
      console.error('Get community programs error:', error);
      throw new Error('Failed to fetch community programs');
    }
  }

  static async getTestimonials(): Promise<CommunityTestimonial[]> {
    try {
      const result = await query(`
        SELECT 
          ct.*,
          COALESCE(ct.impact, '') as impact
        FROM community_testimonials ct
        WHERE ct.is_active = true
        ORDER BY ct.display_order ASC
      `);
      return result.rows as CommunityTestimonial[];
    } catch (error) {
      console.error('Get community testimonials error:', error);
      throw new Error('Failed to fetch community testimonials');
    }
  }

  static async getResources(): Promise<CommunityResource[]> {
    try {
      const result = await query(`
        SELECT 
          cr.*,
          COALESCE(cr.format, 'PDF') as format,
          COALESCE(cr.duration, 'Varies') as duration
        FROM community_resources cr
        WHERE cr.is_active = true
        ORDER BY cr.display_order ASC
      `);
      return result.rows as CommunityResource[];
    } catch (error) {
      console.error('Get community resources error:', error);
      throw new Error('Failed to fetch community resources');
    }
  }

  static async getEvents(): Promise<CommunityEvent[]> {
    try {
      const result = await query(`
        SELECT 
          ce.*,
          COALESCE(ce.event_type, 'Community gathering') as event_type,
          COALESCE(ce.location, 'Online') as location,
          COALESCE(ce.max_attendees, 100) as max_attendees
        FROM community_events ce
        WHERE ce.is_active = true AND ce.event_date >= CURRENT_DATE
        ORDER BY ce.event_date ASC
      `);
      return result.rows as CommunityEvent[];
    } catch (error) {
      console.error('Get community events error:', error);
      throw new Error('Failed to fetch community events');
    }
  }

  static async getGovernance(): Promise<CommunityGovernance[]> {
    try {
      const result = await query(`
        SELECT 
          cg.*,
          COALESCE(cg.structure, 'Decentralized autonomous organization (DAO)') as structure,
          COALESCE(cg.voting_system, 'One-member-one-vote') as voting_system
        FROM community_governance cg
        WHERE cg.is_active = true
        ORDER BY cg.display_order ASC
      `);
      return result.rows as CommunityGovernance[];
    } catch (error) {
      console.error('Get community governance error:', error);
      throw new Error('Failed to fetch community governance');
    }
  }

  static async getStatistics(): Promise<CommunityStatistics | null> {
    try {
      const result = await query(`
        SELECT * FROM community_statistics 
        WHERE id = 1
      `);
      
      return result.rows.length > 0 ? (result.rows[0] as CommunityStatistics) : null;
    } catch (error) {
      console.error('Get community statistics error:', error);
      throw new Error('Failed to fetch community statistics');
    }
  }

  static async joinProgram(programId: number, userId: number): Promise<ProgramRegistration> {
    try {
      const existingRegistration = await query(`
        SELECT * FROM program_registrations 
        WHERE program_id = $1 AND user_id = $2
      `, [programId, userId]);
      
      if (existingRegistration.rows.length > 0) {
        throw new Error('You are already registered for this program');
      }
      
      const result = await query(`
        INSERT INTO program_registrations (program_id, user_id, registration_date)
        VALUES ($1, $2, NOW())
        RETURNING *
      `, [programId, userId]);
      
      return result.rows[0] as ProgramRegistration;
    } catch (error) {
      console.error('Join community program error:', error);
      throw error;
    }
  }
}

export default CommunityService;
