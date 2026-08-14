import { UserProfile } from '../types/clinical';

export const CLINICAL_USERS: UserProfile[] = [
  // 1. Doctor / Consultant Personas
  {
    id: 'user-consultant-01',
    name: 'Dr. Sarah Reynolds, MD, FCCM',
    role: 'doctor_consultant',
    roleTitle: 'Senior Consultant & Attending Intensivist (Critical Care)',
    department: 'Medical Intensive Care Unit (MICU) & Resuscitation',
    badgeNumber: 'MD-88491',
    securityClearance: 'Level 3 - Attending Critical',
    assignedWardUnits: ['Medical Intensive Care Unit (MICU)', 'Surgical Recovery Floor'],
    assignedPatientIds: ['PT-8942', 'PT-9012'],
    permissions: {
      canTriggerEmergencyRRT: true,
      canOrderDiagnostics: true,
      canOverrideAlerts: true,
      canEditPatientData: true,
      canSignOffReports: true,
      canViewAuditLogs: true,
      canConfigureRules: true,
      canViewHospitalSuperintendentDashboard: false, // Strict RBAC: Doctors cannot access Hospital Command
      canBroadcastHospitalAlerts: false,
    },
    avatarInitials: 'SR',
  },
  {
    id: 'user-consultant-02',
    name: 'Dr. Vikram Malhotra, MD, FRCP',
    role: 'doctor_consultant',
    roleTitle: 'Lead Consultant - Acute Internal Medicine & Sepsis Response',
    department: 'Acute Medical Care & Step-Down Telemetry',
    badgeNumber: 'MD-92144',
    securityClearance: 'Level 3 - Attending Critical',
    assignedWardUnits: ['Acute Medical Step-Down 4B', 'Cardiovascular Telemetry Floor', 'Outpatient Triage Clinic'],
    assignedPatientIds: ['PT-3321', 'PT-4109', 'PT-1088'],
    permissions: {
      canTriggerEmergencyRRT: true,
      canOrderDiagnostics: true,
      canOverrideAlerts: true,
      canEditPatientData: true,
      canSignOffReports: true,
      canViewAuditLogs: true,
      canConfigureRules: false,
      canViewHospitalSuperintendentDashboard: false, // Strict RBAC: Doctors cannot access Hospital Command
      canBroadcastHospitalAlerts: false,
    },
    avatarInitials: 'VM',
  },

  // 2. Staff Nurses / Ward Nurses Personas
  {
    id: 'user-nurse-01',
    name: 'Marcus Vance, BSN, RN, CCRN',
    role: 'staff_nurse',
    roleTitle: 'Lead Rapid Response & ICU Triage Nurse',
    department: 'Medical Intensive Care Unit (MICU) & Resuscitation',
    badgeNumber: 'RN-44210',
    securityClearance: 'Level 2 - Clinical Staff',
    assignedWardUnits: ['Medical Intensive Care Unit (MICU)'],
    assignedPatientIds: ['PT-8942', 'PT-4109'],
    permissions: {
      canTriggerEmergencyRRT: true,
      canOrderDiagnostics: false,
      canOverrideAlerts: false,
      canEditPatientData: true,
      canSignOffReports: false,
      canViewAuditLogs: false,
      canConfigureRules: false,
      canViewHospitalSuperintendentDashboard: false, // Strict RBAC: Nurses cannot access Hospital Command
      canBroadcastHospitalAlerts: false,
    },
    avatarInitials: 'MV',
  },
  {
    id: 'user-nurse-02',
    name: 'Nurse Priya Sharma, RN, BSN',
    role: 'staff_nurse',
    roleTitle: 'Senior Ward Floor Charge Nurse (Acute Telemetry)',
    department: 'Acute Medical Step-Down 4B & Cardiovascular Floor',
    badgeNumber: 'RN-76193',
    securityClearance: 'Level 2 - Clinical Staff',
    assignedWardUnits: ['Acute Medical Step-Down 4B', 'Surgical Recovery Floor'],
    assignedPatientIds: ['PT-3321', 'PT-9012', 'PT-1088'],
    permissions: {
      canTriggerEmergencyRRT: true,
      canOrderDiagnostics: false,
      canOverrideAlerts: false,
      canEditPatientData: true,
      canSignOffReports: false,
      canViewAuditLogs: false,
      canConfigureRules: false,
      canViewHospitalSuperintendentDashboard: false, // Strict RBAC: Nurses cannot access Hospital Command
      canBroadcastHospitalAlerts: false,
    },
    avatarInitials: 'PS',
  },

  // 3. Medical Superintendent & Hospital Administration (Has full Hospital Command permissions)
  {
    id: 'user-superintendent-01',
    name: 'Dr. James Chen, MD, MHA, FACS',
    role: 'medical_superintendent',
    roleTitle: 'Medical Superintendent & Chief of Hospital Clinical Operations',
    department: 'Executive Hospital Command & Clinical Governance Council',
    badgeNumber: 'MS-0001',
    securityClearance: 'Level 4 - Medical Superintendent',
    assignedWardUnits: ['*'], // All hospital units
    assignedPatientIds: ['*'], // All hospital census
    permissions: {
      canTriggerEmergencyRRT: true,
      canOrderDiagnostics: true,
      canOverrideAlerts: true,
      canEditPatientData: true,
      canSignOffReports: true,
      canViewAuditLogs: true,
      canConfigureRules: true,
      canViewHospitalSuperintendentDashboard: true, // Superintendent can access Hospital Command
      canBroadcastHospitalAlerts: true,
    },
    avatarInitials: 'JC',
  },

  // 4. Clinical AI Safety & TEE Enclave Auditor
  {
    id: 'user-auditor-01',
    name: 'Dr. Elena Rostova, PhD',
    role: 'ai_safety_auditor',
    roleTitle: 'Clinical AI Safety & Confidential TEE Enclave Auditor',
    department: 'Biomedical Informatics, TEE Cryptography & Algorithm Governance',
    badgeNumber: 'AUD-1092',
    securityClearance: 'Level 4 - Full System Audit',
    assignedWardUnits: ['*'],
    assignedPatientIds: ['*'],
    permissions: {
      canTriggerEmergencyRRT: false,
      canOrderDiagnostics: false,
      canOverrideAlerts: false,
      canEditPatientData: false,
      canSignOffReports: true,
      canViewAuditLogs: true,
      canConfigureRules: true,
      canViewHospitalSuperintendentDashboard: true,
      canBroadcastHospitalAlerts: false,
    },
    avatarInitials: 'ER',
  },
];
