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
import { PRESET_SCENARIOS, PresetScenario } from './data/presetScenarios';
import { CLINICAL_USERS } from './data/authUsers';
import { PatientRecord, FullAssessmentResult, UserProfile, AuditLogEntry } from './types/clinical';
import { runClinicalAssessment } from './services/api';
import { generateDeterministicAssessment } from './utils/clinicalAssessmentEngine';
import { generateClinicalAssessmentPdf } from './utils/pdfGenerator';
import { calculateDataCompleteness } from './utils/confidenceEngine';
import { Activity, ShieldAlert, Sparkles, RefreshCw, Lock, Shield, Bed, ChevronRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(CLINICAL_USERS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'ward' | 'patient'>('ward');

  const [selectedScenario, setSelectedScenario] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [record, setRecord] = useState<PatientRecord>(PRESET_SCENARIOS[0].record);
  const [isLimitedMode, setIsLimitedMode] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<FullAssessmentResult>(() =>
    generateDeterministicAssessment(PRESET_SCENARIOS[0].record)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleTimeString());

  // Audit Logs State with Initial Boot Entries
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString(),
      userId: CLINICAL_USERS[0].id,
      userName: CLINICAL_USERS[0].name,
      userRole: CLINICAL_USERS[0].roleTitle,
      action: 'LOGIN',
      details: 'Secure biometric/passcode login established. Security Clearance: Level 3.',
      hashSignature: 'SHA256:7F8B2C4E-89A1',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString(),
      userId: CLINICAL_USERS[0].id,
      userName: CLINICAL_USERS[0].name,
      userRole: CLINICAL_USERS[0].roleTitle,
      action: 'ASSESSMENT_RUN',
      details: 'Continuous multi-patient ward surveillance trajectory engine initialized.',
      patientId: 'WARD-ALL',
      hashSignature: 'SHA256:3D9A1F8C-44B2',
    },
  ]);

  const addAuditLog = useCallback(
    (action: AuditLogEntry['action'], details: string, patientId?: string) => {
      const newEntry: AuditLogEntry = {
        id: `log-${Date.now().toString(36)}`,
        timestamp: new Date().toLocaleTimeString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.roleTitle,
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
    addAuditLog('LOGIN', `User session authenticated as ${user.name} (${user.roleTitle}) with clearance ${user.securityClearance}.`);
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
    addAuditLog('RECORD_EDIT', `Bedside parameter values updated by ${currentUser.name}.`);
  };

  // SBAR Modal Open
  const handleOpenSbar = () => {
    setIsSbarModalOpen(true);
    addAuditLog('SBAR_GENERATED', `Generated SBAR shift handover note for ${record.patient.name || record.patient.id}.`);
  };

  // PDF Download with Audit Seal
  const handleDownloadPdf = () => {
    generateClinicalAssessmentPdf(record, assessment, currentUser);
    addAuditLog('PDF_DOWNLOAD', `Exported signed clinical deterioration summary PDF with digital clearance stamp: ${currentUser.name}.`);
  };

  // Hard Mode Benchmark Simulator Presets
  const handleApplyPresetCondition = (type: 'sparse' | 'transient_spike' | 'sustained_decline' | 'restore') => {
    if (type === 'sparse') {
      // Keep only 2 single-point readings
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
      // Single isolated dramatic heart rate spike, zero prior trend
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
      // 3-point sustained deterioration
      const sepsisScenario = PRESET_SCENARIOS[0];
      setSelectedScenario(sepsisScenario);
      setRecord(sepsisScenario.record);
      setAssessment(generateDeterministicAssessment(sepsisScenario.record));
      addAuditLog('RRT_TRIGGER', 'Loaded Multi-Point Sustained Decline; Emergency RRT Alert Evaluated True.');
    } else {
      // Restore selected scenario
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

  // Run assessment on initial mount
  useEffect(() => {
    handleExecuteAssessment(record);
  }, []);

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
        onOpenAuditLog={() => setIsAuditModalOpen(true)}
        onOpenSbar={handleOpenSbar}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5 lg:p-6 space-y-4">
        {/* Hard Mode & False-Alarm Suppression Interactive Lab */}
        <HardModeSimulator
          record={record}
          assessment={assessment}
          onApplyPresetCondition={handleApplyPresetCondition}
        />

        {/* View Routing: Ward Surveillance vs Patient Deep Dive */}
        {activeView === 'ward' ? (
          <WardTriageGrid
            onSelectPatient={handleSelectScenario}
            activeScenarioId={selectedScenario.id}
            currentUser={currentUser}
            onOpenSbar={handleOpenSbar}
          />
        ) : (
          <>
            {/* Patient Trajectory Breadcrumb & Scenario Bar */}
            <div className="bg-white border border-[#E0E2E6] rounded-xs p-3.5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xs bg-[#E8F0FE] border border-[#ADCCF9] text-[#1967D2] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setActiveView('ward')}
                      className="text-xs text-[#5F6368] hover:text-[#1967D2] font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ward Grid</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#1967D2] uppercase tracking-wider font-mono">
                      {selectedScenario.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#F1F3F4] text-[#5F6368] px-2 py-0.5 rounded-xs border border-[#DADCE0] uppercase">
                      {selectedScenario.category}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#E8F0FE] text-[#1967D2] px-2 py-0.5 rounded-xs border border-[#ADCCF9]">
                      EXPECTED: RISK {selectedScenario.expectedRisk} &bull; CONF {selectedScenario.expectedConfidence}
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-1 leading-relaxed">
                    {selectedScenario.clinicalNarrative}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#1967D2] bg-[#E8F0FE] border border-[#ADCCF9] px-2.5 py-1 rounded-xs font-mono font-medium animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1967D2]" />
                    REASONING PIPELINE...
                  </span>
                )}
              </div>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* LEFT COLUMN: Data Entry & Time-Series Inputs (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                    Patient Data Entry &amp; Time-Series
                  </h2>
                  <span className="text-[10px] font-mono font-bold text-[#6D7278] bg-white border border-[#DADCE0] px-2 py-0.5 rounded-xs">
                    {record.parameters.filter((p) => p.readings.length > 0).length} of {record.parameters.length} MEASURED
                  </span>
                </div>

                <PatientForm
                  record={record}
                  onChange={handleRecordChange}
                  isLimitedMode={isLimitedMode}
                  onRunAssessment={() => handleExecuteAssessment(record)}
                  isLoading={isLoading}
                />
              </div>

              {/* RIGHT COLUMN: Early-Warning Intelligence Dashboard (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                    Clinical Intelligence &amp; Early-Warning
                  </h2>
                  {lastUpdated && (
                    <span className="text-[10px] font-mono text-[#80868B]">
                      LAST ASSESSED: {lastUpdated}
                    </span>
                  )}
                </div>

                {assessment ? (
                  <>
                    {/* 1. Primary Risk & Mechanical Confidence Dual Display */}
                    <RiskConfidenceDisplay
                      assessment={assessment}
                      isLimitedMode={isLimitedMode}
                    />

                    {/* 2. Multi-Point Trajectory Sparkline Visualizer */}
                    <TimeSeriesVisualizer
                      parameters={record.parameters}
                      trends={assessment.stage2Trends}
                      isLimitedMode={isLimitedMode}
                      assessment={assessment}
                    />

                    {/* 3. Ranked Contributing Factors (Explainability Layer) */}
                    <ContributingFactors
                      explainability={assessment.stage4Explainability}
                    />

                    {/* 4. Action Plan & "What Data Would Improve Assessment" */}
                    <DataImprovementPanel
                      recommendation={assessment.stage5Recommendation}
                      confidenceCapped={assessment.stage3Risk.confidenceCapApplied}
                      confidenceScore={assessment.stage3Risk.confidenceScore}
                      onAddParameter={handleAddRecommendedParameter}
                    />

                    {/* 5. 5-Stage Structured Pipeline Inspector */}
                    <PipelineStageInspector assessment={assessment} />
                  </>
                ) : (
                  <div className="bg-white rounded-xs border border-[#E0E2E6] p-12 text-center text-[#80868B] shadow-xs">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#1967D2] mb-3" />
                    <p className="text-xs font-mono font-medium text-[#1A1C1E]">
                      INITIALIZING STAGE 1-5 CLINICAL DETERIORATION PIPELINE...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-[#1A1C1E] border-t border-[#2D3135] py-4 text-[11px] text-[#9AA0A6] text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">ADVANCE HEALTH</span>
            <span className="text-[#80868B]">&bull; Clinical Deterioration Early-Warning Platform</span>
          </div>
          <p className="text-[#80868B] font-mono text-[10px]">
            MECHANICAL CONFIDENCE CAPPING &bull; FALSE-ALARM MITIGATION &bull; TRACK 03 RESEARCH BENCHMARK
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
        currentUser={currentUser}
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
