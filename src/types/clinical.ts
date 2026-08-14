export type Sex = 'male' | 'female' | 'other' | 'unspecified';

export type UserRole =
  | 'doctor_consultant'
  | 'staff_nurse'
  | 'medical_superintendent'
  | 'ai_safety_auditor'
  | 'physician'
  | 'nurse'
  | 'chief_officer'
  | 'data_auditor';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  badgeNumber: string;
  securityClearance: 'Level 1 - Public' | 'Level 2 - Clinical Staff' | 'Level 3 - Attending Critical' | 'Level 4 - Full System Audit' | 'Level 4 - Medical Superintendent';
  assignedWardUnits?: string[]; // e.g. ['Medical ICU (MICU)', 'Step-Down Ward 4B']
  assignedPatientIds?: string[]; // Specific patients under direct care
  permissions: {
    canTriggerEmergencyRRT: boolean;
    canOrderDiagnostics: boolean;
    canOverrideAlerts: boolean;
    canEditPatientData: boolean;
    canSignOffReports: boolean;
    canViewAuditLogs: boolean;
    canConfigureRules: boolean;
    canViewHospitalSuperintendentDashboard: boolean;
    canBroadcastHospitalAlerts: boolean;
  };
  avatarInitials: string;
}

export interface TeeAttestationStatus {
  enclaveState: 'hardware_attested' | 'verifying' | 're_attested';
  hardwareType: 'AMD SEV-SNP Confidential VM' | 'Intel TDX Confidential Enclave' | 'AWS Nitro Enclaves';
  pcr0Measurement: string;
  mrenclaveHash: string;
  memoryEncryption: string;
  attestationTimestamp: string;
  zeroKnowledgePhiTokens: boolean;
  enclaveSignerPubKey: string;
  verifiedLatencyMs: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action:
    | 'LOGIN'
    | 'ASSESSMENT_RUN'
    | 'RECORD_EDIT'
    | 'RRT_TRIGGER'
    | 'DIAGNOSTIC_ORDER'
    | 'PDF_DOWNLOAD'
    | 'CONFIDENCE_OVERRIDE'
    | 'SBAR_GENERATED'
    | 'TEE_ATTESTATION_VERIFIED'
    | 'HOSPITAL_ALERT_BROADCAST'
    | 'WARD_CAPACITY_OVERRIDE';
  details: string;
  patientId?: string;
  hashSignature: string;
}

export interface PatientDemographics {
  id: string;
  name?: string;
  age: number;
  sex: Sex;
  knownConditions: string[];
  medications: string[];
  notes?: string;
  wardUnit?: string;
  bedNumber?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
}

export interface VitalLabReading {
  timestamp: string; // ISO date string or human readable "Day 0 (Present)", "Day -2", etc.
  value: number | string;
  unit: string;
}

export interface ParameterSeries {
  id: string;
  name: string;
  category: 'vital' | 'lab' | 'wearable';
  unit: string;
  normalRange?: { min: number; max: number; label: string };
  readings: VitalLabReading[]; // empty array means "not recorded"
}

export interface LifestyleData {
  dailySteps?: number[]; // last few days
  sleepHours?: number[];
  restingHeartRateTrend?: number[];
  mobilityNotes?: string;
}

export interface PatientRecord {
  patient: PatientDemographics;
  parameters: ParameterSeries[];
  lifestyle?: LifestyleData;
  mode: 'rich' | 'limited'; // limited history mode toggle
}

// Stage 1: Data Completeness Assessment
export interface ParameterCompleteness {
  parameterId: string;
  parameterName: string;
  category: 'vital' | 'lab' | 'wearable';
  status: 'present_rich' | 'present_sparse' | 'single_point' | 'not_recorded';
  readingCount: number;
  timeSpanDays: number;
  mostRecentHoursAgo: number;
  isStale: boolean;
}

export interface DataCompletenessProfile {
  totalParametersTracked: number;
  recordedParametersCount: number;
  vitalCoveragePercent: number; // 0-100
  labCoveragePercent: number; // 0-100
  overallCoveragePercent: number; // 0-100
  temporalDepthScore: number; // 0-100 (based on number of readings per parameter)
  recencyScore: number; // 0-100 (how recent the data is)
  mechanicalConfidenceScore: number; // 0-100 deterministic calculation
  mechanicalConfidenceLevel: 'low' | 'moderate' | 'high';
  confidenceCappedReason?: string;
  parameterBreakdown: ParameterCompleteness[];
}

// Stage 2: Trend & Anomaly Detection
export interface ParameterTrendAnalysis {
  parameterId: string;
  parameterName: string;
  trajectory: 'stable' | 'improving' | 'gradual_drift' | 'acute_deterioration' | 'insufficient_trend_data';
  isAnomaly: boolean;
  baselineValue?: string;
  latestValue: string;
  deltaSummary: string; // e.g. "Rose +24 bpm (+32%) over 3 days"
  patientSpecificJustification: string; // Clinical rationale tailored to THIS patient, not generic normal
  severityScore: number; // 1-10
}

// Stage 3: Composite Risk Score
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'moderate' | 'high';

export interface CompositeRiskAssessment {
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  riskCategoryLabel: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  confidenceLabel: string;
  confidenceCapApplied: boolean;
  confidenceCapExplanation: string;
  deteriorationSyndromeSuspected?: string; // e.g., "Severe Sepsis / SIRS Progression", "Decompensated Heart Failure"
}

// Stage 4: Plain-Language Explainability
export interface ContributingFactor {
  rank: number;
  parameterName: string;
  impactWeight: 'critical' | 'high' | 'moderate' | 'mild';
  observedValue: string;
  baselineOrPrevious: string;
  timeframe: string;
  clinicalTrace: string; // Exact clinical reason with numbers
}

export interface ExplainabilityReport {
  summary: string;
  topContributingFactors: ContributingFactor[];
  patientContextConsiderations: string;
  divergenceFromBaselineNotes: string;
}

// Stage 5: Recommendations & Action Logic
export interface MissingDataRequest {
  parameterName: string;
  category: 'vital' | 'lab' | 'imaging' | 'history';
  clinicalPriority: 'urgent' | 'recommended' | 'routine';
  confidenceImpact: string; // How this test increases confidence
  rationale: string;
}

export interface ClinicalRecommendation {
  isEmergencyAlert: boolean;
  emergencyRuleEvaluated: string; // Explicit documentation of "sustained trend across >=2 points" check
  headline: string;
  urgencyLevel: 'immediate_intervention' | 'diagnostic_clarification' | 'enhanced_monitoring' | 'routine_care';
  actionSteps: string[];
  dataImprovementList: MissingDataRequest[];
  followUpWindow: string;
}

// Full Pipeline Output
export interface FullAssessmentResult {
  timestamp: string;
  patientId: string;
  stage1Completeness: DataCompletenessProfile;
  stage2Trends: ParameterTrendAnalysis[];
  stage3Risk: CompositeRiskAssessment;
  stage4Explainability: ExplainabilityReport;
  stage5Recommendation: ClinicalRecommendation;
  meta: {
    modelUsed: string;
    processingTimeMs: number;
    mode: 'rich' | 'limited';
    syntheticNotice: string;
  };
}

// Hospital Superintendent Overview Types
export interface HospitalWardSummary {
  id: string;
  name: string;
  code: string;
  category: 'ICU' | 'Step-Down' | 'Emergency' | 'Acute Medical' | 'Specialized';
  totalBeds: number;
  occupiedBeds: number;
  criticalPatientsCount: number;
  dataCappedUncertaintyCount: number;
  averageAcuity: number; // 1.0 - 5.0
  nurseToPatientRatio: string;
  chiefNurseOnDuty: string;
  attendingConsultant: string;
  status: 'optimal' | 'elevated_alert' | 'surge_capacity';
  recentAlert?: string;
}

export interface HospitalIncidentAlert {
  id: string;
  timestamp: string;
  wardCode: string;
  patientId: string;
  patientName: string;
  severity: 'critical_rrt' | 'high_drift' | 'uncertainty_warning' | 'resolved';
  headline: string;
  actionTaken: string;
}
