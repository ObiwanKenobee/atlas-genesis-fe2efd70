/**
 * Zero-Trust Services Index
 * 
 * Exports all zero-trust architecture services and types.
 */

export { ZeroTrustEngine, zeroTrustEngine } from './zeroTrustEngine';
export type { 
  TrustScore, 
  TrustScoreComponents, 
  AccessContext, 
  PolicyDecision,
  ZeroTrustPolicy,
  ResourceType,
  SensitivityLevel,
  DeviceFingerprint,
  SecurityPosture,
  RiskIndicator,
  GeoLocation
} from './zeroTrustEngine';

export { DeviceTrustService, deviceTrustService } from './deviceTrustService';
export type {
  DeviceInfo,
  DeviceTrustState,
  EndpointSecurityCheck,
  DeviceEnrollmentRequest
} from './deviceTrustService';
