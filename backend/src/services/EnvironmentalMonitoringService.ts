import { query } from '../db';
import { cacheWithRedis, invalidateCache } from '../redisClient';
import { logger } from '../utils/logger';

// ============================================
// Environmental Data Types
// ============================================

export interface SatelliteImagery {
  id: string;
  source: string; // 'landsat', 'sentinel', 'modis', 'planet'
  capture_date: string;
  cloud_cover: number;
  resolution_meters: number;
  bands: string[];
  scene_id: string;
  path: string;
  row: string;
  geometry: string;
  processed: boolean;
  processing_status: string;
  created_at: string;
}

export interface CarbonFluxData {
  id: string;
  satellite_imagery_id: string;
  region_id: string;
  gross_primary_productivity: number; // kg C/m²/year
  ecosystem_respiration: number;
  net_ecosystem_exchange: number;
  carbon_sequestration_rate: number; // tonnes CO2e/ha/year
  uncertainty_range: { min: number; max: number };
  measurement_method: string;
  verification_level: string;
  timestamp: string;
  created_at: string;
}

export interface LandUseClassification {
  id: string;
  satellite_imagery_id: string;
  region_id: string;
  classification_type: string; // 'forest', 'agriculture', 'urban', 'wetland', 'water', 'grassland', 'barren'
  coverage_percentage: number;
  change_detected: boolean;
  change_type?: string; // 'deforestation', 'afforestation', 'urbanization', 'conversion'
  change_date?: string;
  confidence_score: number;
  timestamp: string;
  created_at: string;
}

export interface DeforestationAlert {
  id: string;
  region_id: string;
  alert_type: string; // 'clear_cut', 'selective_logging', 'fire', 'disease'
  severity: string; // 'critical', 'high', 'medium', 'low'
  detection_date: string;
  estimated_area_hectares: number;
  location: string;
  satellite_source: string;
  verification_status: string;
  confirmed: boolean;
  response_actions?: string[];
  created_at: string;
}

export interface SoilSensorReading {
  id: string;
  sensor_id: string;
  station_id: string;
  timestamp: string;
  // Moisture data
  moisture_content: number; // percentage
  moisture_depth_cm: number;
  // Nutrient levels
  nitrogen_ppm: number;
  phosphorus_ppm: number;
  potassium_ppm: number;
  ph_level: number;
  organic_matter_percentage: number;
  // Microbial activity
  microbial_biomass_c: number; // µg C/g soil
  respiration_rate: number; // mg CO2/kg soil/day
  enzyme_activity: number; // relative units
  // Environmental conditions
  soil_temperature: number; // celsius
  bulk_density: number; // g/cm³
  cation_exchange_capacity: number; // cmolc/kg
  quality_score: number;
  created_at: string;
}

export interface SoilStation {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  installation_date: string;
  status: string;
  last_calibration: string;
  sensors: string[];
  created_at: string;
}

export interface BiodiversityRecord {
  id: string;
  monitoring_type: string; // 'acoustic', 'camera_trap', 'visual_census', 'eDNA'
  station_id: string;
  timestamp: string;
  species_detected: SpeciesDetection[];
  species_count: number;
  diversity_index: number; // Shannon index
  richness_estimate: number;
  community_composition: Record<string, number>;
  biomass_estimate: number; // kg/ha
  identification_confidence: number;
  audio_file_url?: string;
  image_urls?: string[];
  created_at: string;
}

export interface SpeciesDetection {
  species_id: string;
  scientific_name: string;
  common_name: string;
  taxon_id: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  conservation_status: string; // 'CR', 'EN', 'VU', 'NT', 'LC'
  detection_method: string;
  confidence: number;
  count: number;
  life_stage?: string;
  behavior?: string;
}

export interface AcousticMonitoring {
  id: string;
  station_id: string;
  recording_start: string;
  recording_end: string;
  duration_seconds: number;
  sampling_rate: number;
  acoustic_biodiversity_index: number;
  species_detected_count: number;
  vocal_activity_index: number;
  noise_level_db: number;
  analysis_results: AcousticAnalysisResult[];
  created_at: string;
}

export interface AcousticAnalysisResult {
  species_id?: string;
  species_name?: string;
  call_type: string;
  detection_confidence: number;
  call_count: number;
  acoustic_niche: string;
}

export interface CameraTrapData {
  id: string;
  device_id: string;
  deployment_id: string;
  timestamp: string;
  image_url: string;
  video_url?: string;
  species_detections: SpeciesDetection[];
  animal_count: number;
  activity_pattern: string; // 'diurnal', 'nocturnal', 'crepuscular', 'cathemeral'
  behavior_observed?: string;
  environmental_conditions?: string;
  trigger_type: string; // 'motion', 'timer', 'PIR'
  battery_level: number;
  created_at: string;
}

export interface EcosystemHealthIndex {
  id: string;
  region_id: string;
  timestamp: string;
  overall_score: number; // 0-100
  carbon_health_score: number;
  biodiversity_score: number;
  soil_health_score: number;
  water_quality_score: number;
  resilience_score: number;
  connectivity_score: number;
  stressors: Stressor[];
  recommendations: string[];
  created_at: string;
}

export interface Stressor {
  type: string;
  intensity: string;
  affected_percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface EnvironmentalAlert {
  id: string;
  alert_type: string;
  category: string; // 'carbon', 'biodiversity', 'soil', 'deforestation', 'fire', 'weather'
  severity: string;
  title: string;
  description: string;
  region_id?: string;
  affected_metrics: string[];
  threshold_exceeded: number;
  current_value: number;
  threshold_value: number;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  resolution_status: string;
  created_at: string;
}

export interface DataValidationRecord {
  id: string;
  data_source_id: string;
  data_type: string;
  record_id: string;
  validation_method: string;
  validation_result: string; // 'passed', 'failed', 'warning', 'pending'
  validation_score: number;
  discrepancies?: Record<string, unknown>;
  cross_reference_sources?: string[];
  human_review_required: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PredictiveModelOutput {
  id: string;
  model_type: string; // 'carbon_trajectory', 'biodiversity_trend', 'deforestation_risk', 'soil_degradation'
  region_id: string;
  prediction_period_start: string;
  prediction_period_end: string;
  prediction_value: number;
  confidence_interval: { lower: number; upper: number };
  probability_distribution: Record<string, number>;
  contributing_factors: FactorContribution[];
  model_version: string;
  trained_at: string;
  created_at: string;
}

export interface FactorContribution {
  factor: string;
  contribution: number;
  direction: 'positive' | 'negative';
}

// ============================================
// Environmental Monitoring Service
// ============================================

class EnvironmentalMonitoringService {
  // Dashboard Overview
  async getDashboard(): Promise<Record<string, unknown>> {
    const cacheKey = 'env:monitoring:dashboard';

    return cacheWithRedis(cacheKey, 300, async () => {
      const [
        carbonSummary,
        deforestationAlerts,
        biodiversityIndex,
        soilHealth,
        activeAlerts
      ] = await Promise.all([
        this.getCarbonFluxSummary(),
        this.getDeforestationAlerts({ status: 'active', limit: 10 }),
        this.getBiodiversitySummary(),
        this.getSoilHealthSummary(),
        this.getActiveAlerts()
      ]);

      return {
        carbon: carbonSummary,
        deforestation: {
          activeAlerts: deforestationAlerts.length,
          critical: deforestationAlerts.filter(a => a.severity === 'critical').length,
          recentAlerts: deforestationAlerts.slice(0, 5)
        },
        biodiversity: biodiversityIndex,
        soil: soilHealth,
        alerts: {
          total: activeAlerts.length,
          critical: activeAlerts.filter(a => a.severity === 'critical').length,
          recent: activeAlerts.slice(0, 10)
        },
        lastUpdated: new Date().toISOString()
      };
    });
  }

  // ============================================
  // Satellite Imagery & Carbon Flux
  // ============================================

  async getCarbonFluxSummary(): Promise<Record<string, unknown>> {
    const cacheKey = 'env:carbon:summary';

    return cacheWithRedis(cacheKey, 3600, async () => {
      const result = await query(`
        SELECT 
          COUNT(*) as total_measurements,
          AVG(net_ecosystem_exchange) as avg_nee,
          AVG(carbon_sequestration_rate) as avg_sequestration,
          SUM(CASE WHEN net_ecosystem_exchange < 0 THEN 1 ELSE 0 END) as carbon_sink_count,
          SUM(CASE WHEN net_ecosystem_exchange > 0 THEN 1 ELSE 0 END) as carbon_source_count,
          MIN(timestamp) as earliest_measurement,
          MAX(timestamp) as latest_measurement
        FROM carbon_flux_data
        WHERE timestamp >= NOW() - INTERVAL '1 year'
      `);

      const trendResult = await query(`
        SELECT 
          DATE_TRUNC('month', timestamp) as month,
          AVG(carbon_sequestration_rate) as avg_sequestration
        FROM carbon_flux_data
        WHERE timestamp >= NOW() - INTERVAL '2 years'
        GROUP BY DATE_TRUNC('month', timestamp)
        ORDER BY month
      `);

      return {
        totalMeasurements: parseInt(result.rows[0]?.total_measurements || '0'),
        averageNEE: parseFloat(result.rows[0]?.avg_nee || '0'),
        averageSequestration: parseFloat(result.rows[0]?.avg_sequestration || '0'),
        carbonSinkRegions: parseInt(result.rows[0]?.carbon_sink_count || '0'),
        carbonSourceRegions: parseInt(result.rows[0]?.carbon_source_count || '0'),
        netCarbonStatus: parseFloat(result.rows[0]?.avg_nee || '0') < 0 ? 'NET_SINK' : 'NET_SOURCE',
        monthlyTrends: trendResult.rows.map(r => ({
          month: r.month,
          sequestration: parseFloat(r.avg_sequestration || '0')
        }))
      };
    });
  }

  async recordCarbonFlux(data: {
    satelliteImageryId: string;
    regionId: string;
    grossPrimaryProductivity?: number;
    ecosystemRespiration?: number;
    netEcosystemExchange?: number;
    carbonSequestrationRate?: number;
    measurementMethod?: string;
    verificationLevel?: string;
    timestamp?: string;
  }): Promise<CarbonFluxData> {
    const uncertainty = {
      min: (data.carbonSequestrationRate || 0) * 0.85,
      max: (data.carbonSequestrationRate || 0) * 1.15
    };

    const result = await query(`
      INSERT INTO carbon_flux_data (
        satellite_imagery_id, region_id, gross_primary_productivity, ecosystem_respiration,
        net_ecosystem_exchange, carbon_sequestration_rate, uncertainty_range,
        measurement_method, verification_level, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.satelliteImageryId,
      data.regionId,
      data.grossPrimaryProductivity || null,
      data.ecosystemRespiration || null,
      data.netEcosystemExchange || null,
      data.carbonSequestrationRate || null,
      JSON.stringify(uncertainty),
      data.measurementMethod || 'satellite_derived',
      data.verificationLevel || 'tier_1',
      data.timestamp || new Date().toISOString()
    ]);

    await invalidateCache('env:carbon:*');
    return result.rows[0] as CarbonFluxData;
  }

  async getCarbonFluxByRegion(regionId: string, options: { startDate?: string; endDate?: string } = {}): Promise<CarbonFluxData[]> {
    const { startDate, endDate } = options;
    let queryText = 'SELECT * FROM carbon_flux_data WHERE region_id = $1';
    const params: string[] = [regionId];
    let paramIndex = 2;

    if (startDate) {
      queryText += ` AND timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      queryText += ` AND timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }

    queryText += ' ORDER BY timestamp DESC';

    const result = await query(queryText, params);
    return result.rows as CarbonFluxData[];
  }

  async getLandUseChange(options: { regionId?: string; changeType?: string; limit?: number } = {}): Promise<LandUseClassification[]> {
    const { regionId, changeType, limit = 100 } = options;
    let queryText = `
      SELECT * FROM land_use_classification
      WHERE change_detected = true
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (regionId) {
      queryText += ` AND region_id = $${paramIndex++}`;
      params.push(regionId);
    }

    if (changeType) {
      queryText += ` AND change_type = $${paramIndex++}`;
      params.push(changeType);
    }

    queryText += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
    params.push(limit.toString());

    const result = await query(queryText, params);
    return result.rows as LandUseClassification[];
  }

  async classifyLandUse(data: {
    satelliteImageryId: string;
    regionId: string;
    classifications: Array<{ type: string; percentage: number }>;
    timestamp?: string;
  }): Promise<LandUseClassification[]> {
    const results: LandUseClassification[] = [];

    for (const classification of data.classifications) {
      const result = await query(`
        INSERT INTO land_use_classification (
          satellite_imagery_id, region_id, classification_type, coverage_percentage, timestamp
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        data.satelliteImageryId,
        data.regionId,
        classification.type,
        classification.percentage,
        data.timestamp || new Date().toISOString()
      ]);
      results.push(result.rows[0] as LandUseClassification);
    }

    await invalidateCache('env:landuse:*');
    return results;
  }

  // ============================================
  // Deforestation Alerts
  // ============================================

  async getDeforestationAlerts(options: { status?: string; severity?: string; limit?: number } = {}): Promise<DeforestationAlert[]> {
    const { status, severity, limit = 50 } = options;
    let queryText = 'SELECT * FROM deforestation_alerts WHERE 1=1';
    const params: string[] = [];
    let paramIndex = 1;

    if (status) {
      queryText += ` AND verification_status = $${paramIndex++}`;
      params.push(status);
    }

    if (severity) {
      queryText += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }

    queryText += ` ORDER BY detection_date DESC LIMIT $${paramIndex}`;
    params.push(limit.toString());

    const result = await query(queryText, params);
    return result.rows as DeforestationAlert[];
  }

  async createDeforestationAlert(data: {
    regionId: string;
    alertType: string;
    severity: string;
    estimatedAreaHectares: number;
    location: string;
    satelliteSource: string;
    detectionDate?: string;
  }): Promise<DeforestationAlert> {
    const result = await query(`
      INSERT INTO deforestation_alerts (
        region_id, alert_type, severity, estimated_area_hectares, location,
        satellite_source, detection_date, verification_status, confirmed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false)
      RETURNING *
    `, [
      data.regionId,
      data.alertType,
      data.severity,
      data.estimatedAreaHectares,
      data.location,
      data.satelliteSource,
      data.detectionDate || new Date().toISOString()
    ]);

    await invalidateCache('env:deforestation:*');
    return result.rows[0] as DeforestationAlert;
  }

  async acknowledgeDeforestationAlert(alertId: string, userId: string): Promise<DeforestationAlert | null> {
    const result = await query(`
      UPDATE deforestation_alerts
      SET verification_status = 'acknowledged', confirmed = true
      WHERE id = $1
      RETURNING *
    `, [alertId]);

    await invalidateCache('env:deforestation:*');
    return (result.rows[0] as DeforestationAlert) || null;
  }

  // ============================================
  // Soil Sensor Data
  // ============================================

  async getSoilHealthSummary(): Promise<Record<string, unknown>> {
    const cacheKey = 'env:soil:summary';

    return cacheWithRedis(cacheKey, 1800, async () => {
      const result = await query(`
        SELECT 
          COUNT(DISTINCT station_id) as total_stations,
          AVG(moisture_content) as avg_moisture,
          AVG(ph_level) as avg_ph,
          AVG(organic_matter_percentage) as avg_organic_matter,
          AVG(microbial_biomass_c) as avg_microbial_biomass,
          AVG(quality_score) as avg_quality,
          MIN(timestamp) as earliest_reading,
          MAX(timestamp) as latest_reading
        FROM soil_sensor_readings
        WHERE timestamp >= NOW() - INTERVAL '30 days'
      `);

      const trends = await query(`
        SELECT 
          DATE_TRUNC('day', timestamp) as day,
          AVG(moisture_content) as moisture,
          AVG(ph_level) as ph,
          AVG(organic_matter_percentage) as organic_matter
        FROM soil_sensor_readings
        WHERE timestamp >= NOW() - INTERVAL '90 days'
        GROUP BY DATE_TRUNC('day', timestamp)
        ORDER BY day
      `);

      return {
        totalStations: parseInt(result.rows[0]?.total_stations || '0'),
        averages: {
          moisture: parseFloat(result.rows[0]?.avg_moisture || '0'),
          ph: parseFloat(result.rows[0]?.avg_ph || '0'),
          organicMatter: parseFloat(result.rows[0]?.avg_organic_matter || '0'),
          microbialBiomass: parseFloat(result.rows[0]?.avg_microbial_biomass || '0'),
          quality: parseFloat(result.rows[0]?.avg_quality || '0')
        },
        trends: trends.rows.map(t => ({
          day: t.day,
          moisture: parseFloat(t.moisture || '0'),
          ph: parseFloat(t.ph || '0'),
          organicMatter: parseFloat(t.organic_matter || '0')
        }))
      };
    });
  }

  async recordSoilSensorReading(data: {
    sensorId: string;
    stationId: string;
    moistureContent?: number;
    moistureDepthCm?: number;
    nitrogenPpm?: number;
    phosphorusPpm?: number;
    potassiumPpm?: number;
    phLevel?: number;
    organicMatterPercentage?: number;
    microbialBiomassC?: number;
    respirationRate?: number;
    enzymeActivity?: number;
    soilTemperature?: number;
    bulkDensity?: number;
    cationExchangeCapacity?: number;
    timestamp?: string;
  }): Promise<SoilSensorReading> {
    const qualityScore = this.calculateSoilQualityScore(data);

    const result = await query(`
      INSERT INTO soil_sensor_readings (
        sensor_id, station_id, moisture_content, moisture_depth_cm,
        nitrogen_ppm, phosphorus_ppm, potassium_ppm, ph_level, organic_matter_percentage,
        microbial_biomass_c, respiration_rate, enzyme_activity, soil_temperature,
        bulk_density, cation_exchange_capacity, quality_score, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      data.sensorId,
      data.stationId,
      data.moisture_content || null,
      data.moistureDepthCm || 15,
      data.nitrogenPpm || null,
      data.phosphorusPpm || null,
      data.potassiumPpm || null,
      data.ph_level || null,
      data.organic_matter_percentage || null,
      data.microbial_biomass_c || null,
      data.respirationRate || null,
      data.enzymeActivity || null,
      data.soilTemperature || null,
      data.bulkDensity || null,
      data.cationExchangeCapacity || null,
      qualityScore,
      data.timestamp || new Date().toISOString()
    ]);

    await invalidateCache('env:soil:*');
    return result.rows[0] as SoilSensorReading;
  }

  private calculateSoilQualityScore(data: Partial<SoilSensorReading>): number {
    let score = 100;
    
    // Penalize for out-of-range values
    if (data.ph_level && (data.ph_level < 5.5 || data.ph_level > 7.5)) score -= 15;
    if (data.organic_matter_percentage && data.organic_matter_percentage < 2) score -= 20;
    if (data.microbial_biomass_c && data.microbial_biomass_c < 100) score -= 15;
    if (data.moisture_content && (data.moisture_content < 10 || data.moisture_content > 60)) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  async getSoilReadingsByStation(stationId: string, options: { days?: number; limit?: number } = {}): Promise<SoilSensorReading[]> {
    const { days = 30, limit = 1000 } = options;
    
    const result = await query(`
      SELECT * FROM soil_sensor_readings
      WHERE station_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY timestamp DESC
      LIMIT $2
    `, [stationId, limit]);

    return result.rows as SoilSensorReading[];
  }

  // ============================================
  // Biodiversity Monitoring
  // ============================================

  async getBiodiversitySummary(): Promise<Record<string, unknown>> {
    const cacheKey = 'env:biodiversity:summary';

    return cacheWithRedis(cacheKey, 3600, async () => {
      const result = await query(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(DISTINCT species_id) as unique_species,
          AVG(diversity_index) as avg_diversity,
          SUM(species_count) as total_individuals,
          AVG(identification_confidence) as avg_confidence
        FROM biodiversity_records
        WHERE timestamp >= NOW() - INTERVAL '1 year'
      `);

      const byType = await query(`
        SELECT 
          monitoring_type,
          COUNT(*) as record_count,
          COUNT(DISTINCT species_id) as species_count,
          AVG(diversity_index) as avg_diversity
        FROM biodiversity_records
        WHERE timestamp >= NOW() - INTERVAL '1 year'
        GROUP BY monitoring_type
      `);

      const trends = await query(`
        SELECT 
          DATE_TRUNC('month', timestamp) as month,
          AVG(diversity_index) as diversity,
          COUNT(DISTINCT species_id) as species_richness
        FROM biodiversity_records
        WHERE timestamp >= NOW() - INTERVAL '2 years'
        GROUP BY DATE_TRUNC('month', timestamp)
        ORDER BY month
      `);

      return {
        totalRecords: parseInt(result.rows[0]?.total_records || '0'),
        uniqueSpecies: parseInt(result.rows[0]?.unique_species || '0'),
        averageDiversity: parseFloat(result.rows[0]?.avg_diversity || '0'),
        totalIndividuals: parseInt(result.rows[0]?.total_individuals || '0'),
        averageConfidence: parseFloat(result.rows[0]?.avg_confidence || '0'),
        byMonitoringType: byType.rows.map(r => ({
          type: r.monitoring_type,
          records: parseInt(r.record_count),
          species: parseInt(r.species_count),
          diversity: parseFloat(r.avg_diversity || '0')
        })),
        monthlyTrends: trends.rows.map(t => ({
          month: t.month,
          diversity: parseFloat(t.diversity || '0'),
          richness: parseInt(t.species_richness || '0')
        }))
      };
    });
  }

  async recordBiodiversityData(data: {
    monitoringType: string;
    stationId: string;
    speciesDetected: SpeciesDetection[];
    diversityIndex?: number;
    richnessEstimate?: number;
    biomassEstimate?: number;
    identificationConfidence?: number;
    audioFileUrl?: string;
    imageUrls?: string[];
    timestamp?: string;
  }): Promise<BiodiversityRecord> {
    const communityComposition: Record<string, number> = {};
    for (const species of data.speciesDetected) {
      communityComposition[species.scientific_name] = species.count;
    }

    const result = await query(`
      INSERT INTO biodiversity_records (
        monitoring_type, station_id, species_detected, species_count, diversity_index,
        richness_estimate, community_composition, biomass_estimate, identification_confidence,
        audio_file_url, image_urls, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      data.monitoringType,
      data.stationId,
      JSON.stringify(data.speciesDetected),
      data.speciesDetected.length,
      data.diversityIndex || null,
      data.richnessEstimate || data.speciesDetected.length,
      JSON.stringify(communityComposition),
      data.biomassEstimate || null,
      data.identificationConfidence || 0.85,
      data.audioFileUrl || null,
      data.imageUrls ? JSON.stringify(data.imageUrls) : null,
      data.timestamp || new Date().toISOString()
    ]);

    await invalidateCache('env:biodiversity:*');
    return result.rows[0] as BiodiversityRecord;
  }

  async recordAcousticMonitoring(data: {
    stationId: string;
    recordingStart: string;
    recordingEnd: string;
    durationSeconds?: number;
    samplingRate?: number;
    acousticBiodiversityIndex?: number;
    speciesDetectedCount?: number;
    vocalActivityIndex?: number;
    noiseLevelDb?: number;
    analysisResults?: AcousticAnalysisResult[];
  }): Promise<AcousticMonitoring> {
    const result = await query(`
      INSERT INTO acoustic_monitoring (
        station_id, recording_start, recording_end, duration_seconds, sampling_rate,
        acoustic_biodiversity_index, species_detected_count, vocal_activity_index,
        noise_level_db, analysis_results
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      data.stationId,
      data.recordingStart,
      data.recordingEnd,
      data.durationSeconds || Math.floor((new Date(data.recordingEnd).getTime() - new Date(data.recordingStart).getTime()) / 1000),
      data.samplingRate || 44100,
      data.acousticBiodiversityIndex || null,
      data.speciesDetectedCount || 0,
      data.vocalActivityIndex || null,
      data.noiseLevelDb || null,
      JSON.stringify(data.analysisResults || [])
    ]);

    return result.rows[0] as AcousticMonitoring;
  }

  async recordCameraTrapData(data: {
    deviceId: string;
    deploymentId: string;
    imageUrl: string;
    videoUrl?: string;
    speciesDetections: SpeciesDetection[];
    animalCount?: number;
    activityPattern?: string;
    behaviorObserved?: string;
    triggerType?: string;
    batteryLevel?: number;
    timestamp?: string;
  }): Promise<CameraTrapData> {
    const result = await query(`
      INSERT INTO camera_trap_data (
        device_id, deployment_id, image_url, video_url, species_detections, animal_count,
        activity_pattern, behavior_observed, trigger_type, battery_level, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.deviceId,
      data.deploymentId,
      data.imageUrl,
      data.videoUrl || null,
      JSON.stringify(data.speciesDetections),
      data.animalCount || data.speciesDetections.reduce((sum, s) => sum + s.count, 0),
      data.activityPattern || null,
      data.behaviorObserved || null,
      data.triggerType || 'motion',
      data.batteryLevel || 100,
      data.timestamp || new Date().toISOString()
    ]);

    await invalidateCache('env:biodiversity:*');
    return result.rows[0] as CameraTrapData;
  }

  async getSpeciesRegistry(options: { kingdom?: string; conservationStatus?: string; limit?: number } = {}): Promise<Record<string, unknown>[]> {
    const { kingdom, conservationStatus, limit = 100 } = options;
    let queryText = `
      SELECT DISTINCT species_id, scientific_name, common_name, kingdom, phylum, class,
             order, family, genus, conservation_status, COUNT(*) as detection_count
      FROM biodiversity_records
      CROSS JOIN UNNEST(species_detected) as species
      WHERE 1=1
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (kingdom) {
      queryText += ` AND species.kingdom = $${paramIndex++}`;
      params.push(kingdom);
    }

    if (conservationStatus) {
      queryText += ` AND species.conservation_status = $${paramIndex++}`;
      params.push(conservationStatus);
    }

    queryText += ` GROUP BY species_id, scientific_name, common_name, kingdom, phylum, class, order, family, genus, conservation_status
                   ORDER BY detection_count DESC LIMIT $${paramIndex}`;
    params.push(limit.toString());

    const result = await query(queryText, params);
    return result.rows;
  }

  // ============================================
  // Ecosystem Health
  // ============================================

  async calculateEcosystemHealth(regionId: string): Promise<EcosystemHealthIndex> {
    // Aggregate scores from different metrics
    const [carbon, biodiversity, soil, deforestation, alerts] = await Promise.all([
      this.getCarbonFluxSummary(),
      this.getBiodiversitySummary(),
      this.getSoilHealthSummary(),
      this.getDeforestationAlerts({ regionId, limit: 100 }),
      this.getActiveAlerts({ regionId })
    ]);

    // Calculate composite scores (0-100)
    const carbonHealth = (carbon as any).averageSequestration > 0 ? 70 : 100;
    const biodiversityHealth = Math.min(100, (biodiversity as any).averageDiversity * 25);
    const soilHealth = (soil as any).averages?.quality || 50;
    const resilienceScore = 75; // Would be calculated from more complex factors
    const connectivityScore = 80; // Would be calculated from landscape metrics

    const overallScore = Math.round(
      (carbonHealth + biodiversityHealth + soilHealth + resilienceScore + connectivityScore) / 5
    );

    const stressors = [
      { type: 'deforestation', intensity: deforestation.length > 5 ? 'high' : 'low', affected_percentage: Math.min(100, deforestation.length * 2), trend: 'stable' as const },
      { type: 'climate_change', intensity: 'medium', affected_percentage: 35, trend: 'increasing' as const },
      { type: 'habitat_fragmentation', intensity: 'medium', affected_percentage: 28, trend: 'stable' as const }
    ];

    const recommendations = [
      'Continue monitoring carbon flux to verify sequestration rates',
      'Implement habitat connectivity corridors',
      'Address deforestation alerts in high-priority areas',
      'Conduct soil health assessments quarterly'
    ];

    const result = await query(`
      INSERT INTO ecosystem_health_index (
        region_id, overall_score, carbon_health_score, biodiversity_score, soil_health_score,
        water_quality_score, resilience_score, connectivity_score, stressors, recommendations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      regionId,
      overallScore,
      carbonHealth,
      biodiversityHealth,
      soilHealth,
      70,
      resilienceScore,
      connectivityScore,
      JSON.stringify(stressors),
      JSON.stringify(recommendations)
    ]);

    return result.rows[0] as EcosystemHealthIndex;
  }

  async getEcosystemHealthHistory(regionId: string, days: number = 365): Promise<EcosystemHealthIndex[]> {
    const result = await query(`
      SELECT * FROM ecosystem_health_index
      WHERE region_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days'
      ORDER BY timestamp DESC
    `, [regionId]);

    return result.rows as EcosystemHealthIndex[];
  }

  // ============================================
  // Alerts System
  // ============================================

  async getActiveAlerts(options: { regionId?: string; severity?: string; category?: string } = {}): Promise<EnvironmentalAlert[]> {
    const { regionId, severity, category } = options;
    let queryText = `
      SELECT * FROM environmental_alerts
      WHERE resolution_status != 'resolved'
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (regionId) {
      queryText += ` AND region_id = $${paramIndex++}`;
      params.push(regionId);
    }

    if (severity) {
      queryText += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }

    if (category) {
      queryText += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    queryText += ` ORDER BY triggered_at DESC`;

    const result = await query(queryText, params);
    return result.rows as EnvironmentalAlert[];
  }

  async createAlert(data: {
    alertType: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    regionId?: string;
    affectedMetrics?: string[];
    thresholdExceeded?: number;
    currentValue?: number;
    thresholdValue?: number;
  }): Promise<EnvironmentalAlert> {
    const result = await query(`
      INSERT INTO environmental_alerts (
        alert_type, category, severity, title, description, region_id,
        affected_metrics, threshold_exceeded, current_value, threshold_value,
        triggered_at, acknowledged, resolution_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), false, 'open')
      RETURNING *
    `, [
      data.alertType,
      data.category,
      data.severity,
      data.title,
      data.description,
      data.regionId || null,
      JSON.stringify(data.affectedMetrics || []),
      data.thresholdExceeded || null,
      data.currentValue || null,
      data.thresholdValue || null
    ]);

    await invalidateCache('env:alerts:*');
    return result.rows[0] as EnvironmentalAlert;
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<EnvironmentalAlert | null> {
    const result = await query(`
      UPDATE environmental_alerts
      SET acknowledged = true, acknowledged_by = $1, resolution_status = 'in_review'
      WHERE id = $2
      RETURNING *
    `, [userId, alertId]);

    await invalidateCache('env:alerts:*');
    return (result.rows[0] as EnvironmentalAlert) || null;
  }

  async resolveAlert(alertId: string, resolution: string): Promise<EnvironmentalAlert | null> {
    const result = await query(`
      UPDATE environmental_alerts
      SET resolution_status = 'resolved', resolved_notes = $1
      WHERE id = $2
      RETURNING *
    `, [resolution, alertId]);

    await invalidateCache('env:alerts:*');
    return (result.rows[0] as EnvironmentalAlert) || null;
  }

  // ============================================
  // Data Validation
  // ============================================

  async validateData(data: {
    dataSourceId: string;
    dataType: string;
    recordId: string;
    validationMethod: string;
    data: Record<string, unknown>;
    crossReferenceSources?: string[];
  }): Promise<DataValidationRecord> {
    let validationResult = 'passed';
    let validationScore = 1.0;
    const discrepancies: Record<string, unknown> = {};

    // Cross-reference validation
    if (data.crossReferenceSources && data.crossReferenceSources.length > 0) {
      const crossRefResult = await this.crossReferenceValidation(data.data, data.crossReferenceSources);
      validationScore = crossRefResult.score;
      if (validationScore < 0.7) {
        validationResult = 'failed';
      } else if (validationScore < 0.9) {
        validationResult = 'warning';
      }
      Object.assign(discrepancies, crossRefResult.discrepancies);
    }

    // Range validation based on data type
    const rangeCheck = this.validateDataRanges(data.dataType, data.data);
    if (!rangeCheck.valid) {
      validationScore *= 0.9;
      Object.assign(discrepancies, rangeCheck.issues);
    }

    const humanReviewRequired = validationScore < 0.8;

    const result = await query(`
      INSERT INTO data_validation_records (
        data_source_id, data_type, record_id, validation_method, validation_result,
        validation_score, discrepancies, cross_reference_sources, human_review_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.dataSourceId,
      data.dataType,
      data.recordId,
      data.validationMethod,
      validationResult,
      validationScore,
      JSON.stringify(discrepancies),
      JSON.stringify(data.crossReferenceSources || []),
      humanReviewRequired
    ]);

    return result.rows[0] as DataValidationRecord;
  }

  private crossReferenceValidation(data: Record<string, unknown>, sources: string[]): { score: number; discrepancies: Record<string, unknown> } {
    // Simplified cross-reference validation
    // In production, this would query actual reference sources
    let score = 1.0;
    const discrepancies: Record<string, unknown> = {};

    // Simulate validation against reference sources
    for (const source of sources) {
      // In production: query source API and compare
      // For now, assume high correlation
    }

    return { score, discrepancies };
  }

  private validateDataRanges(dataType: string, data: Record<string, unknown>): { valid: boolean; issues: Record<string, unknown> } {
    const issues: Record<string, unknown> = {};
    let valid = true;

    const ranges: Record<string, { min: number; max: number; field: string }> = {
      carbon_flux: { min: -10, max: 10, field: 'netEcosystemExchange' },
      ndvi: { min: -1, max: 1, field: 'ndviIndex' },
      soil_moisture: { min: 0, max: 100, field: 'moistureContent' },
      biodiversity_index: { min: 0, max: 5, field: 'diversityIndex' },
      ph_level: { min: 0, max: 14, field: 'phLevel' }
    };

    const range = ranges[dataType];
    if (range && data[range.field] !== undefined) {
      const value = data[range.field] as number;
      if (value < range.min || value > range.max) {
        valid = false;
        issues[range.field] = `Value ${value} outside valid range [${range.min}, ${range.max}]`;
      }
    }

    return { valid, issues };
  }

  // ============================================
  // Predictive Models
  // ============================================

  async getPrediction(modelType: string, regionId: string): Promise<PredictiveModelOutput | null> {
    const result = await query(`
      SELECT * FROM predictive_model_outputs
      WHERE model_type = $1 AND region_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [modelType, regionId]);

    return (result.rows[0] as PredictiveModelOutput) || null;
  }

  async savePrediction(data: {
    modelType: string;
    regionId: string;
    predictionPeriodStart: string;
    predictionPeriodEnd: string;
    predictionValue: number;
    confidenceInterval: { lower: number; upper: number };
    probabilityDistribution?: Record<string, number>;
    contributingFactors?: FactorContribution[];
    modelVersion?: string;
  }): Promise<PredictiveModelOutput> {
    const result = await query(`
      INSERT INTO predictive_model_outputs (
        model_type, region_id, prediction_period_start, prediction_period_end,
        prediction_value, confidence_interval, probability_distribution,
        contributing_factors, model_version, trained_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `, [
      data.modelType,
      data.regionId,
      data.predictionPeriodStart,
      data.predictionPeriodEnd,
      data.predictionValue,
      JSON.stringify(data.confidenceInterval),
      JSON.stringify(data.probabilityDistribution || {}),
      JSON.stringify(data.contributingFactors || []),
      data.modelVersion || '1.0.0'
    ]);

    return result.rows[0] as PredictiveModelOutput;
  }

  async getModelPredictionsHistory(modelType: string, regionId: string, days: number = 365): Promise<PredictiveModelOutput[]> {
    const result = await query(`
      SELECT * FROM predictive_model_outputs
      WHERE model_type = $1 AND region_id = $2
        AND created_at >= NOW() - INTERVAL '${days} days'
      ORDER BY created_at DESC
    `, [modelType, regionId]);

    return result.rows as PredictiveModelOutput[];
  }

  // ============================================
  // Reporting & Compliance
  // ============================================

  async generateComplianceReport(options: {
    regionId: string;
    reportType: string; // 'verification', 'regulatory', 'scientific'
    startDate: string;
    endDate: string;
    format?: string;
  }): Promise<Record<string, unknown>> {
    const { regionId, reportType, startDate, endDate, format = 'json' } = options;

    // Gather all relevant data for the report
    const [carbonData, biodiversityData, soilData, alerts, validationRecords] = await Promise.all([
      this.getCarbonFluxByRegion(regionId, { startDate, endDate }),
      this.getBiodiversitySummary(),
      this.getSoilReadingsByStation(regionId, { days: 90 }),
      this.getActiveAlerts({ regionId }),
      this.getValidationRecords(regionId)
    ]);

    const report = {
      reportId: `RPT-${Date.now()}`,
      reportType,
      regionId,
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalCarbonSequestration: carbonData.reduce((sum, d) => sum + (d.carbon_sequestration_rate || 0), 0),
        uniqueSpeciesIdentified: biodiversityData.uniqueSpecies,
        averageSoilHealth: soilData.reduce((sum, r) => sum + (r.quality_score || 0), 0) / Math.max(1, soilData.length),
        openAlertsCount: alerts.length,
        dataValidationPassRate: validationRecords.filter(r => r.validation_result === 'passed').length / Math.max(1, validationRecords.length)
      },
      sections: {
        carbonFlux: carbonData,
        biodiversity: biodiversityData,
        soil: soilData,
        alerts: alerts,
        validation: validationRecords
      },
      metadata: {
        format,
        version: '1.0',
        standard: reportType === 'verification' ? 'Verra VCS' : reportType === 'regulatory' ? 'MRV' : 'Scientific'
      }
    };

    // Log report generation
    await query(`
      INSERT INTO compliance_reports (report_id, report_type, region_id, period_start, period_end, report_data)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [report.reportId, reportType, regionId, startDate, endDate, JSON.stringify(report)]);

    return report;
  }

  async getValidationRecords(regionId: string): Promise<DataValidationRecord[]> {
    const result = await query(`
      SELECT * FROM data_validation_records
      WHERE record_id LIKE $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [`%${regionId}%`]);

    return result.rows as DataValidationRecord[];
  }

  async exportDataForResearch(options: {
    regionId: string;
    dataTypes: string[];
    startDate: string;
    endDate: string;
    format: string;
    sharingAgreement?: string;
  }): Promise<Record<string, unknown>> {
    const { regionId, dataTypes, startDate, endDate, format, sharingAgreement } = options;

    // Verify sharing agreement exists and is valid
    if (sharingAgreement) {
      const agreement = await query(`
        SELECT * FROM data_sharing_agreements WHERE agreement_id = $1 AND status = 'active'
      `, [sharingAgreement]);
      
      if (agreement.rows.length === 0) {
        throw new Error('Invalid or expired data sharing agreement');
      }
    }

    const dataExport = {
      exportId: `EXP-${Date.now()}`,
      regionId,
      dataTypes,
      period: { startDate, endDate },
      exportedAt: new Date().toISOString(),
      format,
      dataAgreement: sharingAgreement,
      citations: [
        'Please cite this data according to Atlas Humanitarian Data Policy',
        'Data DOI: 10.5555/atlas.measurements.2024'
      ]
    };

    // Log the data export
    await query(`
      INSERT INTO data_exports (export_id, region_id, data_types, period_start, period_end, format, sharing_agreement)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      dataExport.exportId,
      regionId,
      JSON.stringify(dataTypes),
      startDate,
      endDate,
      format,
      sharingAgreement || null
    ]);

    return dataExport;
  }

  // ============================================
  // Analytics & Trends
  // ============================================

  async getEnvironmentalTrends(regionId: string, metrics: string[], days: number = 365): Promise<Record<string, unknown>> {
    const trendData: Record<string, unknown[]> = {};

    for (const metric of metrics) {
      let queryText = '';
      let params: (string | number)[] = [regionId];

      switch (metric) {
        case 'carbon':
          queryText = `
            SELECT timestamp as date, carbon_sequestration_rate as value
            FROM carbon_flux_data WHERE region_id = $1 AND timestamp >= NOW() - INTERVAL '${days} days'
            ORDER BY timestamp ASC
          `;
          break;
        case 'biodiversity':
          queryText = `
            SELECT timestamp as date, diversity_index as value
            FROM biodiversity_records WHERE station_id LIKE $1 AND timestamp >= NOW() - INTERVAL '${days} days'
            ORDER BY timestamp ASC
          `;
          params = [`%${regionId}%`];
          break;
        case 'soil':
          queryText = `
            SELECT timestamp as date, quality_score as value
            FROM soil_sensor_readings WHERE station_id LIKE $1 AND timestamp >= NOW() - INTERVAL '${days} days'
            ORDER BY timestamp ASC
          `;
          params = [`%${regionId}%`];
          break;
        default:
          trendData[metric] = [];
          continue;
      }

      const result = await query(queryText, params);
      trendData[metric] = result.rows.map(r => ({
        date: r.date,
        value: parseFloat(r.value || '0')
      }));
    }

    return {
      regionId,
      metrics,
      period: `${days} days`,
      trends: trendData
    };
  }

  async getAnomalyDetectionReport(options: { regionId?: string; days?: number; severity?: string } = {}): Promise<Record<string, unknown>> {
    const { regionId, days = 30, severity } = options;
    let queryText = `
      SELECT * FROM measurement_data
      WHERE anomaly_flag = true AND measurement_date >= NOW() - INTERVAL '${days} days'
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (regionId) {
      queryText += ` AND project_id = $${paramIndex++}`;
      params.push(regionId);
    }

    if (severity) {
      queryText += ` AND anomaly_severity = $${paramIndex++}`;
      params.push(severity);
    }

    const result = await query(queryText, params);

    return {
      reportDate: new Date().toISOString(),
      period: `${days} days`,
      totalAnomalies: result.rows.length,
      anomalies: result.rows,
      summary: {
        highSeverity: result.rows.filter(r => r.anomaly_severity === 'high').length,
        mediumSeverity: result.rows.filter(r => r.anomaly_severity === 'medium').length,
        lowSeverity: result.rows.filter(r => r.anomaly_severity === 'low').length,
        pendingReview: result.rows.filter(r => !r.anomaly_reviewed).length
      }
    };
  }
}

export const environmentalMonitoringService = new EnvironmentalMonitoringService();
export default environmentalMonitoringService;
