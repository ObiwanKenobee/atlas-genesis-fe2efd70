export type ProjectType = 'reforestation' | 'renewable_energy' | 'methane_capture' | 'ocean_restoration' | 'soil_carbon' | 'direct_air_capture';
export type ProjectStatus = 'active' | 'pending' | 'completed' | 'suspended';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ClimateClassification = 'tropical_rainforest' | 'tropical_savanna' | 'arid_desert' | 'temperate_grassland' | 'boreal_forest' | 'temperate_deciduous' | 'mediterranean' | 'tundra' | 'ocean_coastal' | 'mountain';
export type SatelliteSource = 'Sentinel-2' | 'Landsat-8' | 'Earth-Engine' | 'IoT-Sensor' | 'Manual';
export type DataSource = 'eDNA-Sample' | 'Bioacoustic' | 'Satellite' | 'Manual';

export interface CarbonProject {
  id: string;
  title: string;
  description: string;
  location: string;
  country: string;
  project_type: ProjectType;
  status: ProjectStatus;
  price_per_credit: number;
  total_credits: number;
  available_credits: number;
  vintage_year: number;
  certification: string;
  methodology: string | null;
  co2_offset_per_credit: number;
  image_url: string | null;
  developer_name: string;
  start_date: string | null;
  end_date: string | null;
  // New expansion fields
  measurement_data_id: string | null;
  bioregional_zone_id: string | null;
  regenerative_metrics_id: string | null;
  valuation_model_id: string | null;
  geometry: GeoPoint | null;
  verified_by_system_at: string | null;
  last_measurement_at: string | null;
  impact_score: number | null;
  confidence_level: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreditHolding {
  id: string;
  user_id: string;
  project_id: string;
  quantity: number;
  purchase_price: number;
  purchased_at: string;
  retired: boolean;
  retired_at: string | null;
  certificate_id: string | null;
  carbon_projects?: CarbonProject;
}

export interface Transaction {
  id: string;
  user_id: string;
  project_id: string;
  quantity: number;
  price_per_credit: number;
  total_amount: number;
  status: TransactionStatus;
  transaction_type: string;
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
  carbon_projects?: CarbonProject;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  reforestation: 'Reforestation',
  renewable_energy: 'Renewable Energy',
  methane_capture: 'Methane Capture',
  ocean_restoration: 'Ocean Restoration',
  soil_carbon: 'Soil Carbon',
  direct_air_capture: 'Direct Air Capture',
};

export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  reforestation: '🌲',
  renewable_energy: '⚡',
  methane_capture: '🏭',
  ocean_restoration: '🌊',
  soil_carbon: '🌱',
  direct_air_capture: '💨',
};
