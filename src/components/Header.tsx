import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Activity,
  AlertTriangle,
  Info,
  RefreshCw,
  Stethoscope,
  Terminal,
  FileDown,
  UserCheck,
  Shield,
  Layers,
  ClipboardCheck,
  History,
  Lock,
  Bed,
  Building2,
  Cpu,
  ShieldCheck,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Users,
} from 'lucide-react';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presetScenarios';
import { UserProfile } from '../types/clinical';

interface HeaderProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: PresetScenario) => void;
  isLimitedMode: boolean;
  onToggleLimitedMode: () => void;
  onRunAssessment: () => void;
  isLoading: boolean;
  lastUpdated?: string;
  onOpenDisclaimer: () => void;
  onDownloadPdf?: () => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAuditLog: () => void;
  onOpenSbar: () => void;
  onOpenTeeSecurity: () => void;
  activeView: 'superintendent' | 'ward' | 'patient';
  onToggleView: (view: 'superintendent' | 'ward' | 'patient') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenarioId,
  onSelectScenario,
  isLimitedMode,
  onToggleLimitedMode,
  onRunAssessment,
  isLoading,
  lastUpdated,
  onOpenDisclaimer,
  onDownloadPdf,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenAuditLog,
  onOpenSbar,
  onOpenTeeSecurity,
  activeView,
  onToggleView,
}) => {
  // Filter scenarios accessible to the current user
  const accessibleScenarios = PRESET_SCENARIOS.filter((sc) => {
    if (!currentUser) return false;
    if (
      currentUser.role === 'medical_superintendent' ||
      currentUser.role === 'chief_officer' ||
      currentUser.role === 'ai_safety_auditor' ||
      currentUser.role === 'data_auditor'
    ) {
      return true; // Full access
    }
    if (currentUser.role === 'doctor_consultant' || currentUser.role === 'physician') {
      // Doctor only sees their assigned patients
      return (
        sc.record.patient.assignedDoctorId === currentUser.id ||
        (currentUser.assignedPatientIds && currentUser.assignedPatientIds.includes(sc.record.patient.id))
      );
    }
    if (currentUser.role === 'staff_nurse' || currentUser.role === 'nurse') {
      // Nurse sees patients in their ward or assigned directly
      return (
        sc.record.patient.assignedNurseId === currentUser.id ||
        (currentUser.assignedWardUnits &&
          (currentUser.assignedWardUnits.includes(sc.record.patient.wardUnit || '') ||
            currentUser.assignedWardUnits.includes('*'))) ||
        (currentUser.assignedPatientIds && currentUser.assignedPatientIds.includes(sc.record.patient.id))
      );
    }
    return true;
  });

  const selectedScenario =
    accessibleScenarios.find((s) => s.id === currentScenarioId) ||
    accessibleScenarios[0] ||
    PRESET_SCENARIOS[0];

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'medical_superintendent':
      case 'chief_officer':
        return 'bg-[#D93025] text-white border-[#B3261E]';
      case 'doctor_consultant':
      case 'physician':
        return 'bg-[#1967D2] text-white border-[#1557B0]';
      case 'staff_nurse':
      case 'nurse':
        return 'bg-[#188038] text-white border-[#137333]';
      case 'ai_safety_auditor':
      case 'data_auditor':
        return 'bg-[#7050E0] text-white border-[#5B3BC4]';
      default:
        return 'bg-[#5F6368] text-white border-[#3C4043]';
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'medical_superintendent':
      case 'chief_officer':
        return 'SUPERINTENDENT';
      case 'doctor_consultant':
      case 'physician':
        return 'ATTENDING DOCTOR';
      case 'staff_nurse':
      case 'nurse':
        return 'WARD NURSE';
      case 'ai_safety_auditor':
      case 'data_auditor':
        return 'SAFETY AUDITOR';
      default:
        return 'GUEST';
    }
  };

  const canViewSuperintendent = currentUser?.permissions?.canViewHospitalSuperintendentDashboard ?? false;

  return (
    <header className="bg-white border-b border-[#E0E2E6] sticky top-0 z-30 shrink-0 shadow-2xs">
      {/* Top Security & Authentication Strip */}
      <div className="bg-[#101418] px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between text-[#9AA0A6] border-b border-[#2C3238] gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* TEE Confidential Compute Attested Pill */}
          <button
            type="button"
            onClick={onOpenTeeSecurity}
            className="flex items-center gap-1.5 text-[#81C995] bg-[#137333]/25 hover:bg-[#137333]/40 border border-[#137333] px-2 py-0.5 rounded-xs font-mono text-[11px] transition-colors cursor-pointer"
            title="Inspect Hardware Cryptographic Attestation & PCR0 Measurement"
          >
            <Cpu className="w-3.5 h-3.5 text-[#81C995]" />
            <span className="font-bold">TEE ENCLAVE: ATTESTED</span>
            <span className="text-[10px] text-[#A8DAB5] hidden md:inline">(AMD SEV-SNP)</span>
          </button>

          <span className="text-[#4E5256] hidden sm:inline">&bull;</span>

          {/* Active Clinician Identity Pill & Switcher */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#1F2428] text-white px-2.5 py-0.5 rounded-xs text-[11px] border border-[#3C4248]">
              <div
                className={`w-4 h-4 rounded-xs flex items-center justify-center font-bold text-[9px] font-mono ${getRoleBadgeStyle(
                  currentUser.role
                )}`}
              >
                {currentUser.avatarInitials}
              </div>
              <span className="font-medium text-white truncate max-w-[130px] sm:max-w-none">
                {currentUser.name.split(',')[0]}
              </span>
              <span className="text-[#8AB4F8] font-mono text-[10px] font-bold">
                [{getRoleDisplayName(currentUser.role)}]
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#2A1810] text-[#F9AB00] px-2.5 py-0.5 rounded-xs text-[11px] border border-[#E37400]/40 font-mono">
              <Lock className="w-3.5 h-3.5 text-[#F9AB00]" />
              <span>UNAUTHENTICATED / GUEST</span>
            </div>
          )}

          {/* Switch User Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1 bg-[#282E34] hover:bg-[#373E47] text-[#D2E3FC] hover:text-white px-2 py-0.5 rounded-xs text-[11px] border border-[#48525D] transition-colors cursor-pointer font-mono"
            title="Switch clinician role (Doctor, Nurse, Superintendent)"
          >
            <Users className="w-3 h-3 text-[#8AB4F8]" />
            <span>Switch Clinician</span>
          </button>

          {/* Prominent Login / Logout Button in Top Bar */}
          {currentUser ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1 bg-[#3C1E1E] hover:bg-[#5A2828] text-[#FAD2CF] hover:text-white px-2 py-0.5 rounded-xs text-[11px] border border-[#7A3030] transition-colors cursor-pointer font-mono"
              title="Log out current clinician session"
            >
              <LogOut className="w-3 h-3 text-[#F28B82]" />
              <span className="font-bold">Log Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1 bg-[#1967D2] hover:bg-[#1557B0] text-white px-2.5 py-0.5 rounded-xs text-[11px] border border-[#1557B0] transition-colors cursor-pointer font-mono font-bold shadow-xs"
              title="Log in with clinical credentials"
            >
              <LogIn className="w-3 h-3" />
              <span>Log In</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          {/* SBAR Quick Handoff */}
          <button
            type="button"
            onClick={onOpenSbar}
            className="text-[#E8EAED] hover:text-white flex items-center gap-1 font-mono uppercase text-[11px] cursor-pointer bg-[#1F2428] px-2 py-0.5 rounded-xs hover:bg-[#2F363D] border border-[#3C4248]"
            title="Generate SBAR Shift Handover Note"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[#1967D2]" />
            <span className="hidden xs:inline">SBAR Note</span>
          </button>

          {/* Audit Trail Log */}
          <button
            type="button"
            onClick={onOpenAuditLog}
            className="text-[#E8EAED] hover:text-white flex items-center gap-1 font-mono uppercase text-[11px] cursor-pointer bg-[#1F2428] px-2 py-0.5 rounded-xs hover:bg-[#2F363D] border border-[#3C4248]"
            title="Inspect HIPAA Cryptographic Audit Trail"
          >
            <History className="w-3.5 h-3.5 text-[#188038]" />
            <span className="hidden xs:inline">Audit Trail</span>
          </button>

          <span className="text-[#4E5256] hidden md:inline">&bull;</span>

          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="text-[#8AB4F8] hover:text-[#D2E3FC] flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Methodology</span>
          </button>
        </div>
      </div>

      {/* Main Navigation & View Selector Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Clean View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Logo badge */}
          <div className="bg-[#1A1C1E] text-white px-3 py-1 font-bold text-sm tracking-tight rounded-xs shadow-xs flex items-center gap-1.5">
            <span className="text-[#1967D2] font-black">/</span>
            <span>ADVANCE HEALTH</span>
          </div>

          {/* Role-Restricted Segmented View Switcher */}
          <div className="flex items-center bg-[#F1F3F4] p-0.5 rounded-xs border border-[#DADCE0]">
            {/* Hospital Command: ONLY visible for Medical Superintendent / System Admin */}
            {canViewSuperintendent && (
              <button
                type="button"
                onClick={() => onToggleView('superintendent')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  activeView === 'superintendent'
                    ? 'bg-white text-[#D93025] shadow-xs'
                    : 'text-[#5F6368] hover:text-[#1A1C1E]'
                }`}
                title="Hospital-wide command & bed capacity orchestration"
              >
                <Building2 className="w-3.5 h-3.5 text-[#D93025]" />
                <span>Hospital Command</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleView('ward')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                activeView === 'ward'
                  ? 'bg-white text-[#1967D2] shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Bed className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>
                {currentUser?.role === 'staff_nurse' || currentUser?.role === 'nurse'
                  ? 'My Ward Roster'
                  : currentUser?.role === 'doctor_consultant' || currentUser?.role === 'physician'
                  ? 'My Assigned Patients'
                  : 'Ward Grid'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onToggleView('patient')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                activeView === 'patient'
                  ? 'bg-white text-[#1967D2] shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#188038]" />
              <span>Patient Deep Dive</span>
            </button>
          </div>
        </div>

        {/* Right Action Controls for Patient View */}
        {activeView === 'patient' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Role-Filtered Patient Scenario Selector */}
            {accessibleScenarios.length > 0 && (
              <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2 py-1">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase font-mono">Patient:</span>
                <select
                  value={selectedScenario.id}
                  onChange={(e) => {
                    const found = accessibleScenarios.find((s) => s.id === e.target.value);
                    if (found) onSelectScenario(found);
                  }}
                  className="bg-transparent text-xs font-medium text-[#1A1C1E] focus:outline-none cursor-pointer"
                >
                  {accessibleScenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.record.patient.name} ({sc.record.patient.id} - {sc.record.patient.wardUnit || 'Ward'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Limited History Mode Toggle */}
            <button
              type="button"
              onClick={onToggleLimitedMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-xs transition-colors cursor-pointer ${
                isLimitedMode
                  ? 'bg-[#FFF4E5] border-[#FFD399] text-[#A65E00]'
                  : 'bg-white border-[#DADCE0] text-[#1A1C1E] hover:bg-[#F8F9FA]'
              }`}
              title="Toggle limited single-point telemetry to demonstrate mechanical confidence capping"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLimitedMode ? 'bg-[#E67E22] animate-ping' : 'bg-[#9AA0A6]'
                }`}
              ></span>
              <span>{isLimitedMode ? 'Limited Data (Capped)' : 'Rich History'}</span>
            </button>

            {/* PDF Report Export */}
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="flex items-center gap-1.5 bg-white hover:bg-[#F8F9FA] border border-[#DADCE0] text-[#1A1C1E] px-2.5 py-1 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors cursor-pointer"
                title="Download signed PDF clinical deterioration report"
              >
                <FileDown className="w-3.5 h-3.5 text-[#1967D2]" />
                <span className="hidden sm:inline">PDF Report</span>
              </button>
            )}

            {/* Re-Evaluate Action */}
            <button
              type="button"
              onClick={onRunAssessment}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#2D3135] text-white px-3 py-1 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8AB4F8]" />
                  <span className="font-mono">Evaluating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" />
                  <span>Re-Evaluate</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
