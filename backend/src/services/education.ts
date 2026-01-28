import { query } from '../db';

export interface EducationSegment {
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

export interface EducationProgram {
  id: number;
  name: string;
  description: string;
  curriculum: string;
  duration: string;
  difficulty_level: string;
  language: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationResource {
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

export interface EducationPartner {
  id: number;
  name: string;
  description: string;
  website_url: string;
  logo_url: string;
  partnership_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationCertification {
  id: number;
  name: string;
  description: string;
  requirements: string;
  duration: string;
  issuing_body: string;
  recognition: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationTestimonial {
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

export interface EducationStatistics {
  id: number;
  total_programs: number;
  active_students: number;
  completion_rate: number;
  partner_institutions: number;
  average_rating: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramEnrollment {
  id: number;
  program_id: number;
  user_id: number;
  enrollment_date: string;
  completion_status: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

class EducationService {
  static async getSegments(): Promise<EducationSegment[]> {
    try {
      const result = await query(`
        SELECT 
          es.*,
          COALESCE(es.price_range, 'Subscription, workshop & course fees') as price_range,
          COALESCE(es.pricing_mechanism, 'Freemium, subscription & tiered') as pricing_mechanism,
          COALESCE(es.value_justification, 'Fosters cultural and technical competence') as value_justification
        FROM education_segments es
        WHERE es.is_active = true
        ORDER BY es.display_order ASC
      `);
      return result.rows as EducationSegment[];
    } catch (error) {
      console.error('Get education segments error:', error);
      throw new Error('Failed to fetch education segments');
    }
  }

  static async getPrograms(): Promise<EducationProgram[]> {
    try {
      const result = await query(`
        SELECT 
          ep.*,
          COALESCE(ep.curriculum, 'Comprehensive curriculum') as curriculum,
          COALESCE(ep.duration, 'Varies') as duration,
          COALESCE(ep.language, 'English') as language
        FROM education_programs ep
        WHERE ep.is_active = true
        ORDER BY ep.display_order ASC
      `);
      return result.rows as EducationProgram[];
    } catch (error) {
      console.error('Get education programs error:', error);
      throw new Error('Failed to fetch education programs');
    }
  }

  static async getResources(): Promise<EducationResource[]> {
    try {
      const result = await query(`
        SELECT 
          er.*,
          COALESCE(er.format, 'PDF') as format,
          COALESCE(er.duration, 'Varies') as duration
        FROM education_resources er
        WHERE er.is_active = true
        ORDER BY er.display_order ASC
      `);
      return result.rows as EducationResource[];
    } catch (error) {
      console.error('Get education resources error:', error);
      throw new Error('Failed to fetch education resources');
    }
  }

  static async getPartners(): Promise<EducationPartner[]> {
    try {
      const result = await query(`
        SELECT 
          ep.*,
          COALESCE(ep.website_url, '#') as website_url,
          COALESCE(ep.partnership_type, 'Educational partner') as partnership_type
        FROM education_partners ep
        WHERE ep.is_active = true
        ORDER BY ep.display_order ASC
      `);
      return result.rows as EducationPartner[];
    } catch (error) {
      console.error('Get education partners error:', error);
      throw new Error('Failed to fetch education partners');
    }
  }

  static async getCertifications(): Promise<EducationCertification[]> {
    try {
      const result = await query(`
        SELECT 
          ec.*,
          COALESCE(ec.requirements, 'Completion of required courses') as requirements,
          COALESCE(ec.issuing_body, 'Theatrum') as issuing_body,
          COALESCE(ec.recognition, 'Industry recognized') as recognition
        FROM education_certifications ec
        WHERE ec.is_active = true
        ORDER BY ec.display_order ASC
      `);
      return result.rows as EducationCertification[];
    } catch (error) {
      console.error('Get education certifications error:', error);
      throw new Error('Failed to fetch education certifications');
    }
  }

  static async getTestimonials(): Promise<EducationTestimonial[]> {
    try {
      const result = await query(`
        SELECT 
          et.*,
          COALESCE(et.impact, '') as impact
        FROM education_testimonials et
        WHERE et.is_active = true
        ORDER BY et.display_order ASC
      `);
      return result.rows as EducationTestimonial[];
    } catch (error) {
      console.error('Get education testimonials error:', error);
      throw new Error('Failed to fetch education testimonials');
    }
  }

  static async getStatistics(): Promise<EducationStatistics | null> {
    try {
      const result = await query(`
        SELECT * FROM education_statistics 
        WHERE id = 1
      `);
      
      return result.rows.length > 0 ? (result.rows[0] as EducationStatistics) : null;
    } catch (error) {
      console.error('Get education statistics error:', error);
      throw new Error('Failed to fetch education statistics');
    }
  }

  static async enrollProgram(programId: number, userId: number): Promise<ProgramEnrollment> {
    try {
      const existingEnrollment = await query(`
        SELECT * FROM program_enrollments 
        WHERE program_id = $1 AND user_id = $2
      `, [programId, userId]);
      
      if (existingEnrollment.rows.length > 0) {
        throw new Error('You are already enrolled in this program');
      }
      
      const result = await query(`
        INSERT INTO program_enrollments (program_id, user_id, enrollment_date)
        VALUES ($1, $2, NOW())
        RETURNING *
      `, [programId, userId]);
      
      return result.rows[0] as ProgramEnrollment;
    } catch (error) {
      console.error('Enroll in education program error:', error);
      throw error;
    }
  }
}

export default EducationService;
