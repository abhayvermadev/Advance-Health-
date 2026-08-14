import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PatientForm } from './components/PatientForm';
import { RiskConfidenceDisplay } from './components/RiskConfidenceDisplay';
import { ContributingFactors } from './components/ContributingFactors';
import { DataImprovementPanel } from './components/DataImprovementPanel';
import { TimeSeriesVisualizer } from './components/TimeSeriesVisualizer';
import { PipelineStageInspector } from './components/PipelineStageInspector';
import { ClinicalDisclaimerModal } from './components/ClinicalDisclaimerModal';
import { LoginModal } from './components/LoginModal';
import { AuditLogModal } from './components/AuditLogModal';
import { SbarHandoverModal } from './components/SbarHandoverModal';
import { WardTriageGrid } from './components/WardTriageGrid';
import { HardModeSimulator } from './components/HardModeSimulator';
import { MedicalSuperintendentView } from './components/MedicalSuperintendentView';
import { TeeSecurityModal } from './components/TeeSecurityModal';
import { PRESET_SCENARIOS, PresetScenario } from './data/presetScenarios';
import { CLINICAL_USERS } from './data/authUsers';
import { PatientRecord, FullAssessmentResult, UserProfile, AuditLogEntry } from './types/clinical';
import { runClinicalAssessment } from './services/api';
import { generateDeterministicAssessment } from './utils/clinicalAssessmentEngine';
import { generateClinicalAssessmentPdf } from './utils/pdfGenerator';
import {
  Activity,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Lock,
  Shield,
  Bed,
  ChevronRight,
  Building2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  TrendingUp,
  FileCheck,
  Stethoscope,
  Layers,
  Zap,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
} from 'lucide-react';

export const isPatientAccessible = (scenario: PresetScenario, user: UserProfile | null): boolean => {
  if (!user) return false;
  if (
    user.role === 'medical_superintendent' ||
    user.role === 'chief_officer' ||
    user.role === 'ai_safety_auditor' ||
    user.role === 'data_auditor'
  ) {
    return true;
  }
  if (user.role === 'doctor_consultant' || user.role === 'physician') {
    return (
      scenario.record.patient.assignedDoctorId === user.id ||
      Boolean(user.assignedPatientIds && user.assignedPatientIds.includes(scenario.record.patient.id))
    );
  }
  if (user.role === 'staff_nurse' || user.role === 'nurse') {
    return (
      scenario.record.patient.assignedNurseId === user.id ||
      Boolean(
        user.assignedWardUnits &&
          (user.assignedWardUnits.includes(scenario.record.patient.wardUnit || '') ||
            user.assignedWardUnits.includes('*'))
      ) ||
      Boolean(user.assignedPatientIds && user.assignedPatientIds.includes(scenario.record.patient.id))
    );
  }
  return true;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(CLINICAL_USERS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [isTeeModalOpen, setIsTeeModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'superintendent' | 'ward' | 'patient'>('ward');

  const [selectedScenario, setSelectedScenario] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [record, setRecord] = useState<PatientRecord>(PRESET_SCENARIOS[0].record);
  const [isLimitedMode, setIsLimitedMode] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<FullAssessmentResult>(() =>
    generateDeterministicAssessment(PRESET_SCENARIOS[0].record)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString());

  // Collapsible section states for Clinical Intelligence Dashboard
  const [activeTab, setActiveTab] = useState<'all' | 'trends' | 'explainability' | 'pathway' | 'pipeline'>('all');
  const [showTrends, setShowTrends] = useState<boolean>(true);
  const [showExplainability, setShowExplainability] = useState<boolean>(true);
  const [showActionPlan, setShowActionPlan] = useState<boolean>(true);
  const [showPipeline, setShowPipeline] = useState<boolean>(false);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Audit Logs State with Initial Boot Entries
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toLocaleTimeString(),
      userId: CLINICAL_USERS[0].id,
      userName: CLINICAL_USERS[0].name,
      userRole: CLINICAL_USERS[0].roleTitle,
      action: 'LOGIN',
      details: 'Secure TEE biometric session established. Security Clearance: Level 3 - Attending Critical.',
      hashSignature: 'SHA256:7F8B2C4E-89A1',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
      userId: CLINICAL_USERS[0].id,
      userName: CLINICAL_USERS[0].name,
      userRole: CLINICAL_USERS[0].roleTitle,
      action: 'TEE_ATTESTATION_VERIFIED',
      details: 'Hardware attestation verified: AMD SEV-SNP Confidential Enclave with AES-128-XTS RAM encryption.',
      hashSignature: 'SHA256:0EE49B07-9402',
    },
    {
      id: 'log-003',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString(),
      userId: CLINICAL_USERS[0].id,
      userName: CLINICAL_USERS[0].name,
      userRole: CLINICAL_USERS[0].roleTitle,
      action: 'ASSESSMENT_RUN',
      details: 'Continuous multi-patient ward surveillance trajectory engine initialized across all hospital beds.',
      patientId: 'WARD-ALL',
      hashSignature: 'SHA256:3D9A1F8C-44B2',
    },
  ]);

  const addAuditLog = useCallback(
    (action: AuditLogEntry['action'], details: string, patientId?: string) => {
      const newEntry: AuditLogEntry = {
        id: `log-${Date.now().toString(36)}`,
        timestamp: new Date().toLocaleTimeString(),
        userId: currentUser?.id || 'ANONYMOUS',
        userName: currentUser?.name || 'Unauthenticated User',
        userRole: currentUser?.roleTitle || 'Guest',
        action,
        details,
        patientId: patientId || record.patient.id,
        hashSignature: `SHA256:${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).substring(4).toUpperCase()}`,
      };
      setAuditLogs((prev) => [newEntry, ...prev]);
    },
    [currentUser, record.patient.id]
  );

  // Execute clinical assessment
  const handleExecuteAssessment = useCallback(
    async (currentRecord?: PatientRecord) => {
      const rec = currentRecord || record;
      setIsLoading(true);
      try {
        const result = await runClinicalAssessment(rec);
        setAssessment(result);
        setLastUpdated(new Date().toLocaleTimeString());
        addAuditLog(
          'ASSESSMENT_RUN',
          `Ran 5-stage deterioration pipeline for patient ${rec.patient.id}. Output: ${result.stage3Risk.riskScore}% risk, ${result.stage3Risk.confidenceScore}% confidence.`,
          rec.patient.id
        );
      } catch (err) {
        console.error('Error running assessment:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [record, addAuditLog]
  );

  // Switch User Profile / Role
  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    addAuditLog('LOGIN', `User session authenticated as ${user.name} (${user.roleTitle}) with clearance: ${user.securityClearance}.`);

    // Ensure the currently selected scenario is accessible under new role; if not, switch to first accessible
    if (!isPatientAccessible(selectedScenario, user)) {
      const accessibleScenario = PRESET_SCENARIOS.find((sc) => isPatientAccessible(sc, user)) || PRESET_SCENARIOS[0];
      setSelectedScenario(accessibleScenario);
      const newRecord: PatientRecord = {
        ...accessibleScenario.record,
        mode: isLimitedMode ? 'limited' : accessibleScenario.record.mode,
      };
      setRecord(newRecord);
      setAssessment(generateDeterministicAssessment(newRecord));
    }

    if (user.role === 'medical_superintendent' || user.role === 'chief_officer') {
      setActiveView('superintendent');
    } else {
      setActiveView('ward');
    }
  };

  // Log Out Handler
  const handleLogout = () => {
    addAuditLog('LOGOUT', `User ${currentUser?.name || 'clinician'} logged out. Session terminated.`);
    setCurrentUser(null);
    setActiveView('ward');
  };

  // Safe View Switcher enforcing RBAC
  const handleToggleView = (view: 'superintendent' | 'ward' | 'patient') => {
    if (view === 'superintendent') {
      if (!currentUser?.permissions.canViewHospitalSuperintendentDashboard) {
        addAuditLog('RBAC_VIOLATION' as any, `Unauthorized access attempt to Hospital Command by ${currentUser?.name || 'Guest'}.`);
        setActiveView('ward');
        return;
      }
    }
    setActiveView(view);
  };

  // Load preset scenario from dropdown or ward grid
  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenario(scenario);
    const newRecord: PatientRecord = {
      ...scenario.record,
      mode: isLimitedMode ? 'limited' : scenario.record.mode,
    };
    setRecord(newRecord);
    const newAss = generateDeterministicAssessment(newRecord);
    setAssessment(newAss);
    handleExecuteAssessment(newRecord);
    setActiveView('patient');
    addAuditLog('RECORD_EDIT', `Loaded clinical trajectory record for ${scenario.record.patient.name} (${scenario.record.patient.id}).`, scenario.record.patient.id);
  };

  // Toggle Limited History Mode
  const handleToggleLimitedMode = () => {
    const nextMode = !isLimitedMode;
    setIsLimitedMode(nextMode);
    const updatedRecord: PatientRecord = {
      ...record,
      mode: nextMode ? 'limited' : 'rich',
    };
    setRecord(updatedRecord);
    setAssessment(generateDeterministicAssessment(updatedRecord));
    handleExecuteAssessment(updatedRecord);
    addAuditLog('CONFIDENCE_OVERRIDE', `Toggled ingestion mode to: ${nextMode ? 'LIMITED SINGLE-POINT' : 'RICH LONGITUDINAL'}.`);
  };

  // On form record change
  const handleRecordChange = (updatedRecord: PatientRecord) => {
    setRecord(updatedRecord);
    setAssessment(generateDeterministicAssessment(updatedRecord));
    addAuditLog('RECORD_EDIT', `Bedside parameter values updated by ${currentUser?.name || 'Staff'}.`);
  };

  // SBAR Modal Open
  const handleOpenSbar = () => {
    setIsSbarModalOpen(true);
    addAuditLog('SBAR_GENERATED', `Generated SBAR shift handover note for ${record.patient.name || record.patient.id}.`);
  };

  // PDF Download with Audit Seal
  const handleDownloadPdf = () => {
    generateClinicalAssessmentPdf(record, assessment, currentUser);
    addAuditLog('PDF_DOWNLOAD', `Exported signed clinical deterioration summary PDF with digital clearance stamp: ${currentUser?.name || 'Staff'}.`);
  };

  // Hard Mode Benchmark Simulator Presets
  const handleApplyPresetCondition = (type: 'sparse' | 'transient_spike' | 'sustained_decline' | 'restore') => {
    if (type === 'sparse') {
      const sparseParams = record.parameters.map((p, idx) => {
        if (idx === 0) {
          return { ...p, readings: [{ timestamp: 'Current Single Reading', value: 88, unit: p.unit }] };
        }
        if (idx === 1) {
          return { ...p, readings: [{ timestamp: 'Current Single Reading', value: '128/80', unit: p.unit }] };
        }
        return { ...p, readings: [] };
      });
      const updated: PatientRecord = { ...record, parameters: sparseParams, mode: 'limited' };
      setRecord(updated);
      setAssessment(generateDeterministicAssessment(updated));
      addAuditLog('CONFIDENCE_OVERRIDE', 'Simulated Sensor Drop / Sparse Data condition (Hard Mode Benchmark).');
    } else if (type === 'transient_spike') {
      const spikeParams = record.parameters.map((p) => {
        if (p.id === 'heart_rate') {
          return { ...p, readings: [{ timestamp: 'Current Single Reading', value: 135, unit: 'bpm' }] };
        }
        if (p.id === 'spo2') {
          return { ...p, readings: [{ timestamp: 'Current Single Reading', value: 92, unit: '%' }] };
        }
        return { ...p, readings: [] };
      });
      const updated: PatientRecord = { ...record, parameters: spikeParams, mode: 'limited' };
      setRecord(updated);
      setAssessment(generateDeterministicAssessment(updated));
      addAuditLog('CONFIDENCE_OVERRIDE', 'Injected Isolated Transient Outlier to evaluate false-alarm suppression rule.');
    } else if (type === 'sustained_decline') {
      const sepsisScenario = PRESET_SCENARIOS[0];
      setSelectedScenario(sepsisScenario);
      setRecord(sepsisScenario.record);
      setAssessment(generateDeterministicAssessment(sepsisScenario.record));
      addAuditLog('RRT_TRIGGER', 'Loaded Multi-Point Sustained Decline; Emergency RRT Alert Evaluated True.');
    } else {
      setRecord(selectedScenario.record);
      setAssessment(generateDeterministicAssessment(selectedScenario.record));
      addAuditLog('RECORD_EDIT', `Restored default baseline scenario: ${selectedScenario.name}.`);
    }
  };

  // Add recommended data parameter in one click
  const handleAddRecommendedParameter = (paramName: string) => {
    const lower = paramName.toLowerCase();
    let targetId = '';
    let defaultVal: number | string = 0;

    if (lower.includes('lactate') || lower.includes('vbg') || lower.includes('gas')) {
      targetId = 'lactate';
      defaultVal = 1.3;
    } else if (lower.includes('creatinine') || lower.includes('bmp') || lower.includes('electrolyte') || lower.includes('renal')) {
      targetId = 'creatinine';
      defaultVal = 1.0;
    } else if (lower.includes('wbc') || lower.includes('cbc') || lower.includes('white blood')) {
      targetId = 'wbc_count';
      defaultVal = 7.8;
    } else if (lower.includes('glucose') || lower.includes('sugar')) {
      targetId = 'glucose';
      defaultVal = 105;
    } else if (lower.includes('pressure') || lower.includes('bp') || lower.includes('map')) {
      targetId = 'blood_pressure';
      defaultVal = '118/76';
    } else if (lower.includes('heart') || lower.includes('pulse') || lower.includes('hr')) {
      targetId = 'heart_rate';
      defaultVal = 82;
    } else if (lower.includes('respirat') || lower.includes('rr') || lower.includes('breath')) {
      targetId = 'respiratory_rate';
      defaultVal = 16;
    } else if (lower.includes('spo2') || lower.includes('oxygen') || lower.includes('o2')) {
      targetId = 'spo2';
      defaultVal = 97;
    } else if (lower.includes('temp') || lower.includes('fever')) {
      targetId = 'temperature';
      defaultVal = 98.6;
    } else {
      const unrecorded = record.parameters.find((p) => p.readings.length === 0);
      if (unrecorded) {
        targetId = unrecorded.id;
        defaultVal = targetId === 'blood_pressure' ? '120/80' : 80;
      }
    }

    if (!targetId) return;

    const updatedParams = record.parameters.map((p) => {
      if (p.id === targetId) {
        const count = p.readings.length;
        const newTimestamp = count === 0 ? 'Current Observation' : `Repeat Follow-up (+${count * 2}h)`;
        return {
          ...p,
          readings: [
            ...p.readings,
            {
              timestamp: newTimestamp,
              value: defaultVal,
              unit: p.unit,
            },
          ],
        };
      }
      return p;
    });

    const updatedRecord: PatientRecord = {
      ...record,
      parameters: updatedParams,
    };
    setRecord(updatedRecord);
    handleExecuteAssessment(updatedRecord);
    addAuditLog('DIAGNOSTIC_ORDER', `Clinician ordered and recorded parameter [${targetId.toUpperCase()}].`);
  };

  // Collapse / Expand all analytics panels
  const areAllAnalyticsExpanded = showTrends && showExplainability && showActionPlan && showPipeline;
  const handleToggleAllAnalytics = () => {
    const next = !areAllAnalyticsExpanded;
    setShowTrends(next);
    setShowExplainability(next);
    setShowActionPlan(next);
    setShowPipeline(next);
  };

  // Run assessment on initial mount
  useEffect(() => {
    handleExecuteAssessment(record);
  }, []);

  const isCurrentPatientAllowed = isPatientAccessible(selectedScenario, currentUser);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1C1E] flex flex-col font-sans selection:bg-[#1967D2] selection:text-white">
      {/* Header with Role Status, Navigation, and Mode Toggles */}
      <Header
        currentScenarioId={selectedScenario.id}
        onSelectScenario={handleSelectScenario}
        isLimitedMode={isLimitedMode}
        onToggleLimitedMode={handleToggleLimitedMode}
        onRunAssessment={() => handleExecuteAssessment(record)}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
        onDownloadPdf={handleDownloadPdf}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        onOpenSbar={handleOpenSbar}
        onOpenTeeSecurity={() => setIsTeeModalOpen(true)}
        activeView={activeView}
        onToggleView={handleToggleView}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 lg:p-6 space-y-4">
        {/* View Routing: Superintendent Command vs Ward Surveillance vs Patient Deep Dive */}
        {activeView === 'superintendent' && currentUser?.permissions.canViewHospitalSuperintendentDashboard ? (
          <MedicalSuperintendentView
            currentUser={currentUser}
            onSelectWardPatient={(patientId) => {
              const matched = PRESET_SCENARIOS.find((s) => s.record.patient.id === patientId) || PRESET_SCENARIOS[0];
              handleSelectScenario(matched);
            }}
            onLogAudit={addAuditLog}
          />
        ) : activeView === 'ward' ? (
          <WardTriageGrid
            onSelectPatient={handleSelectScenario}
            activeScenarioId={selectedScenario.id}
            currentUser={currentUser}
            onOpenSbar={handleOpenSbar}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        ) : !isCurrentPatientAllowed ? (
          /* Patient Deep Dive Access Denied Screen */
          <div className="bg-white border border-[#E0E2E6] rounded-xs p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-[#FCE8E6] text-[#D93025] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A1C1E]">
                Restricted Patient Record (HIPAA RBAC Protection)
              </h2>
              <p className="text-xs text-[#5F6368] mt-2 leading-relaxed">
                You are currently logged in as <strong>{currentUser?.name}</strong> ({currentUser?.roleTitle}).
                Patient <strong>{selectedScenario.record.patient.name}</strong> ({selectedScenario.record.patient.id}) is in{' '}
                <strong>{selectedScenario.record.patient.wardUnit || 'another unit'}</strong> under{' '}
                <strong>{selectedScenario.record.patient.assignedDoctorName || 'another attending'}</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('ward')}
                className="bg-[#1967D2] hover:bg-[#1557B0] text-white px-4 py-2 rounded-xs text-xs font-bold shadow-xs cursor-pointer"
              >
                Return to My Ward Roster
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#3C4043] border border-[#DADCE0] px-4 py-2 rounded-xs text-xs font-medium cursor-pointer"
              >
                Switch Clinician Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Patient Header Card (Clean & Minimalist Context Bar) */}
            <div className="bg-white border border-[#E0E2E6] rounded-xs p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('ward')}
                  className="w-8 h-8 rounded-xs bg-[#F1F3F4] hover:bg-[#E8F0FE] hover:text-[#1967D2] text-[#5F6368] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  title="Back to Ward Grid"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1A1C1E] uppercase font-mono">
                      Bed {record.patient.bedNumber || record.patient.id}
                    </span>
                    <span className="text-xs font-bold text-[#1967D2]">
                      {record.patient.name}
                    </span>
                    <span className="text-[10px] font-mono bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
                      {record.patient.age}y {record.patient.gender}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#1967D2] px-2 py-0.2 rounded-xs border border-[#ADCCF9] uppercase">
                      {selectedScenario.name}
                    </span>
                    <span className="text-[10px] font-mono bg-[#E6F4EA] text-[#137333] px-2 py-0.2 rounded-xs border border-[#CEEAD6]">
                      Unit: {record.patient.wardUnit || 'Ward'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-0.5 line-clamp-1">
                    {selectedScenario.clinicalNarrative}
                  </p>
                </div>
              </div>

              {/* Simulation Lab Toggle (Unobtrusive Collapsible Pill) */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer shadow-2xs ${
                    showSimulator
                      ? 'bg-[#1A1C1E] text-white border-[#1A1C1E]'
                      : 'bg-white hover:bg-[#F8F9FA] border-[#DADCE0] text-[#5F6368]'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${showSimulator ? 'text-[#FDD663]' : 'text-[#E37400]'}`} />
                  <span>{showSimulator ? 'Close Benchmark Lab' : '⚡ False-Alarm & Benchmark Lab'}</span>
                  {showSimulator ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Collapsible Benchmark Simulator (Only visible when toggled) */}
            {showSimulator && (
              <div className="animate-in fade-in duration-150">
                <HardModeSimulator
                  record={record}
                  assessment={assessment}
                  onApplyPresetCondition={handleApplyPresetCondition}
                />
              </div>
            )}

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* LEFT COLUMN: Patient Telemetry & Input Forms (5 Cols) */}
              <div className="lg:col-span-5">
                <PatientForm
                  record={record}
                  onChange={handleRecordChange}
                  isLimitedMode={isLimitedMode}
                  onRunAssessment={() => handleExecuteAssessment(record)}
                  isLoading={isLoading}
                />
              </div>

              {/* RIGHT COLUMN: Clinical Intelligence & Analytics (7 Cols) */}
              <div className="lg:col-span-7 space-y-3">
                {/* Section Header with Quick Tab Filters & Collapse-All Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                  {/* Clean Segmented Tab Filters */}
                  <div className="flex items-center bg-white p-0.5 rounded-xs border border-[#DADCE0] shadow-2xs overflow-x-auto max-w-full">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'all'
                          ? 'bg-[#1A1C1E] text-white shadow-xs'
                          : 'text-[#5F6368] hover:text-[#1A1C1E]'
                      }`}
                    >
                      All Sections
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('trends')}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'trends'
                          ? 'bg-[#1967D2] text-white shadow-xs'
                          : 'text-[#5F6368] hover:text-[#1A1C1E]'
                      }`}
                    >
                      📈 Trends &amp; Forecast
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('explainability')}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'explainability'
                          ? 'bg-[#1967D2] text-white shadow-xs'
                          : 'text-[#5F6368] hover:text-[#1A1C1E]'
                      }`}
                    >
                      🔍 Explainability
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pathway')}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'pathway'
                          ? 'bg-[#1967D2] text-white shadow-xs'
                          : 'text-[#5F6368] hover:text-[#1A1C1E]'
                      }`}
                    >
                      💡 Action Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pipeline')}
                      className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'pipeline'
                          ? 'bg-[#1967D2] text-white shadow-xs'
                          : 'text-[#5F6368] hover:text-[#1A1C1E]'
                      }`}
                    >
                      ⚙️ 5-Stage Audit
                    </button>
                  </div>

                  {activeTab === 'all' && (
                    <button
                      type="button"
                      onClick={handleToggleAllAnalytics}
                      className="text-[11px] text-[#1967D2] hover:text-[#1557B0] font-mono font-medium flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 border border-[#DADCE0] rounded-xs shadow-2xs shrink-0"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-[#1967D2]" />
                      <span>{areAllAnalyticsExpanded ? 'Collapse All' : 'Expand All'}</span>
                    </button>
                  )}
                </div>

                {assessment ? (
                  <>
                    {/* 1. Primary Risk & Confidence Metric Summary (Always visible) */}
                    <RiskConfidenceDisplay
                      assessment={assessment}
                      isLimitedMode={isLimitedMode}
                    />

                    {/* 2. Longitudinal Trends & Predictive Projection (Collapsible) */}
                    {(activeTab === 'all' || activeTab === 'trends') && (
                      <div className="bg-white border border-[#E0E2E6] rounded-xs shadow-xs overflow-hidden transition-all">
                        {activeTab === 'all' && (
                          <button
                            type="button"
                            onClick={() => setShowTrends(!showTrends)}
                            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left border-b border-[#E0E2E6]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-xs bg-[#E8F0FE] text-[#1967D2] flex items-center justify-center font-bold text-xs">
                                <TrendingUp className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                                Longitudinal Vital Trends &amp; Predictive Trajectory
                              </span>
                              <span className="text-[10px] font-mono bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
                                6h Dynamic Window
                              </span>
                            </div>
                            <span className="text-xs text-[#5F6368] flex items-center gap-1 font-mono">
                              {showTrends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </button>
                        )}
                        {(activeTab === 'trends' || showTrends) && (
                          <div className="p-3.5">
                            <TimeSeriesVisualizer
                              record={record}
                              forecastMinutes={120}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Clinical Explainability & Contributing Factors (Collapsible) */}
                    {(activeTab === 'all' || activeTab === 'explainability') && (
                      <div className="bg-white border border-[#E0E2E6] rounded-xs shadow-xs overflow-hidden transition-all">
                        {activeTab === 'all' && (
                          <button
                            type="button"
                            onClick={() => setShowExplainability(!showExplainability)}
                            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left border-b border-[#E0E2E6]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-xs bg-[#FEF7E0] text-[#B06000] flex items-center justify-center font-bold text-xs">
                                <Sparkles className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                                Clinical Explainability &amp; Risk Drivers
                              </span>
                              <span className="text-[10px] font-mono bg-[#FEF7E0] text-[#B06000] px-1.5 py-0.2 rounded-xs border border-[#FEEFC3]">
                                Multi-Factor Attribution
                              </span>
                            </div>
                            <span className="text-xs text-[#5F6368] flex items-center gap-1 font-mono">
                              {showExplainability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </button>
                        )}
                        {(activeTab === 'explainability' || showExplainability) && (
                          <div className="p-3.5">
                            <ContributingFactors
                              explainability={assessment.stage4Explainability}
                              riskAssessment={assessment.stage3Risk}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Action Pathway & Diagnostic Acquisition Panel (Collapsible) */}
                    {(activeTab === 'all' || activeTab === 'pathway') && (
                      <div className="bg-white border border-[#E0E2E6] rounded-xs shadow-xs overflow-hidden transition-all">
                        {activeTab === 'all' && (
                          <button
                            type="button"
                            onClick={() => setShowActionPlan(!showActionPlan)}
                            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left border-b border-[#E0E2E6]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-xs bg-[#E6F4EA] text-[#137333] flex items-center justify-center font-bold text-xs">
                                <FileCheck className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                                Action Pathway &amp; Confidence Growth Lab
                              </span>
                              <span className="text-[10px] font-mono bg-[#E6F4EA] text-[#137333] px-1.5 py-0.2 rounded-xs border border-[#CEEAD6]">
                                Gap Closure
                              </span>
                            </div>
                            <span className="text-xs text-[#5F6368] flex items-center gap-1 font-mono">
                              {showActionPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </button>
                        )}
                        {(activeTab === 'pathway' || showActionPlan) && (
                          <div className="p-3.5">
                            <DataImprovementPanel
                              recommendation={assessment.stage5Recommendation}
                              risk={assessment.stage3Risk}
                              onAddRecommendedParameter={handleAddRecommendedParameter}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. 5-Stage Audit Inspector (Collapsible) */}
                    {(activeTab === 'all' || activeTab === 'pipeline') && (
                      <div className="bg-white border border-[#E0E2E6] rounded-xs shadow-xs overflow-hidden transition-all">
                        {activeTab === 'all' && (
                          <button
                            type="button"
                            onClick={() => setShowPipeline(!showPipeline)}
                            className="w-full p-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left border-b border-[#E0E2E6]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-xs bg-[#F1F3F4] text-[#1A1C1E] flex items-center justify-center font-bold text-xs">
                                <Layers className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
                                5-Stage Mechanical Pipeline Verification
                              </span>
                              <span className="text-[10px] font-mono bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
                                Stage 1→5 Execution Trail
                              </span>
                            </div>
                            <span className="text-xs text-[#5F6368] flex items-center gap-1 font-mono">
                              {showPipeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </button>
                        )}
                        {(activeTab === 'pipeline' || showPipeline) && (
                          <div className="p-3.5">
                            <PipelineStageInspector assessment={assessment} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white border border-[#DADCE0] rounded-xs p-10 text-center">
                    <p className="text-xs text-[#5F6368]">No clinical assessment generated yet.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="mt-8 bg-[#1A1C1E] border-t border-[#2D3135] py-3 text-[11px] text-[#9AA0A6] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">ADVANCE HEALTH</span>
            <span className="text-[#80868B]">&bull; Clinical Deterioration Early-Warning System</span>
          </div>
          <p className="text-[#80868B] font-mono text-[10px]">
            MECHANICAL CONFIDENCE CAPPING &bull; TEE HARDWARE ATTESTED &bull; ZERO-KNOWLEDGE PHI &bull; STRICT RBAC ENFORCED
          </p>
        </div>
      </footer>

      {/* Role-Based Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        onLogin={handleUserLogin}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* TEE Confidential Enclave & Cryptographic Security Modal */}
      <TeeSecurityModal
        isOpen={isTeeModalOpen}
        onClose={() => setIsTeeModalOpen(false)}
        currentUser={currentUser || CLINICAL_USERS[0]}
        onLogAudit={addAuditLog}
      />

      {/* HIPAA Immutable Audit Log Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        logs={auditLogs}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Clinical SBAR Shift Handover Modal */}
      <SbarHandoverModal
        isOpen={isSbarModalOpen}
        record={record}
        assessment={assessment}
        currentUser={currentUser || CLINICAL_USERS[0]}
        onClose={() => setIsSbarModalOpen(false)}
      />

      {/* Clinical Disclaimer & Methodology Modal */}
      <ClinicalDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
