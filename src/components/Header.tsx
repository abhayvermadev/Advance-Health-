import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Activity,
  AlertTriangle,
  Info,
  ToggleLeft,
  ToggleRight,
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
  FileText,
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
  currentUser: UserProfile;
  onOpenLogin: () => void;
  onOpenAuditLog: () => void;
  onOpenSbar: () => void;
  activeView: 'ward' | 'patient';
  onToggleView: (view: 'ward' | 'patient') => void;
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
  onOpenAuditLog,
  onOpenSbar,
  activeView,
  onToggleView,
}) => {
  const selectedScenario = PRESET_SCENARIOS.find((s) => s.id === currentScenarioId) || PRESET_SCENARIOS[0];

  return (
    <header className="bg-white border-b border-[#E0E2E6] sticky top-0 z-30 shrink-0">
      {/* Top Technical Security & Authentication Bar */}
      <div className="bg-[#1A1C1E] px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between text-[#9AA0A6] border-b border-[#2D3135] gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#34A853] font-mono font-medium text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
            <span>CLINICAL MONITORING ENGINE ACTIVE</span>
          </div>

          <span className="text-[#6D7278] hidden sm:inline">&bull;</span>

          {/* Active Clinician Identity Pill */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 bg-[#282B2E] hover:bg-[#3C4043] text-white px-2 py-0.5 rounded-xs text-[11px] border border-[#3C4043] transition-colors cursor-pointer"
            title="Click to switch clinical role or authenticate"
          >
            <div className="w-4 h-4 bg-[#1967D2] rounded-xs flex items-center justify-center font-bold text-[9px] font-mono">
              {currentUser.avatarInitials}
            </div>
            <span className="font-medium text-white">{currentUser.name.split(',')[0]}</span>
            <span className="text-[#8AB4F8] font-mono text-[10px]">({currentUser.roleTitle.split('&')[0]})</span>
            <span className="text-[9px] bg-[#188038]/30 text-[#81C995] px-1 rounded-xs font-mono">RBAC</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {/* SBAR Quick Handoff */}
          <button
            type="button"
            onClick={onOpenSbar}
            className="text-[#E8EAED] hover:text-white flex items-center gap-1 font-mono uppercase text-[11px] cursor-pointer bg-[#282B2E] px-2 py-0.5 rounded-xs hover:bg-[#3C4043]"
            title="Open SBAR Shift Handover Note"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[#1967D2]" />
            <span>SBAR Handover</span>
          </button>

          {/* Audit Trail Log */}
          <button
            type="button"
            onClick={onOpenAuditLog}
            className="text-[#E8EAED] hover:text-white flex items-center gap-1 font-mono uppercase text-[11px] cursor-pointer bg-[#282B2E] px-2 py-0.5 rounded-xs hover:bg-[#3C4043]"
            title="Inspect HIPAA Audit Trail and Access Events"
          >
            <History className="w-3.5 h-3.5 text-[#188038]" />
            <span>Audit Trail</span>
          </button>

          <span className="text-[#6D7278] hidden md:inline">&bull;</span>

          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="text-[#8AB4F8] hover:text-[#D2E3FC] flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Methodology</span>
          </button>
        </div>
      </div>

      {/* Main Navigation & View Selector Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand & View Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Logo badge */}
          <div className="bg-[#1A1C1E] text-white px-3 py-1 font-bold text-base tracking-tighter rounded-xs shadow-xs flex items-center gap-1.5">
            <span className="text-[#1967D2]">/</span>
            <span>ADVANCE HEALTH</span>
          </div>

          {/* Primary View Toggle: Ward Command vs Patient Deep Dive */}
          <div className="flex items-center bg-[#F1F3F4] p-0.5 rounded-xs border border-[#DADCE0]">
            <button
              type="button"
              onClick={() => onToggleView('ward')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                activeView === 'ward'
                  ? 'bg-white text-[#1967D2] shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Ward Surveillance Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleView('patient')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                activeView === 'patient'
                  ? 'bg-white text-[#1967D2] shadow-xs'
                  : 'text-[#5F6368] hover:text-[#1A1C1E]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Patient Trajectory Deep Dive</span>
            </button>
          </div>

          {/* Patient Context (if in deep dive mode) */}
          {activeView === 'patient' && (
            <div className="hidden xl:flex items-center gap-2 text-xs border-l border-[#DADCE0] pl-3">
              <span className="text-[10px] font-bold text-[#5F6368] uppercase font-mono">Bed Target:</span>
              <span className="font-bold text-[#1A1C1E] font-mono">{selectedScenario.record.patient.id}</span>
              <span className="text-[#5F6368]">({selectedScenario.record.patient.name})</span>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Scenario Dropdown (for Patient mode) */}
          {activeView === 'patient' && (
            <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-xs px-2 py-1">
              <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider">Patient:</span>
              <select
                value={currentScenarioId}
                onChange={(e) => {
                  const found = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
                  if (found) onSelectScenario(found);
                }}
                className="bg-transparent text-xs font-medium text-[#1A1C1E] focus:outline-none cursor-pointer"
              >
                {PRESET_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Limited History Mode Toggle */}
          {activeView === 'patient' && (
            <button
              type="button"
              onClick={onToggleLimitedMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-xs transition-colors cursor-pointer ${
                isLimitedMode
                  ? 'bg-[#FFF4E5] border-[#FFD399] text-[#A65E00]'
                  : 'bg-white border-[#DADCE0] text-[#1A1C1E] hover:bg-[#F8F9FA]'
              }`}
              title="Toggle between rich longitudinal trajectory and single-point intake demonstration"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLimitedMode ? 'bg-[#E67E22] animate-ping' : 'bg-[#9AA0A6]'
                }`}
              ></span>
              <span>{isLimitedMode ? 'Demo: Limited Data (Capped)' : 'Mode: Rich History'}</span>
            </button>
          )}

          {/* Download Signed PDF Report Button */}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 bg-white hover:bg-[#F8F9FA] border border-[#DADCE0] text-[#1A1C1E] px-2.5 py-1 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors cursor-pointer"
              title="Download structured PDF clinical assessment summary with digital physician sign-off"
            >
              <FileDown className="w-3.5 h-3.5 text-[#1967D2]" />
              <span>Signed PDF Report</span>
            </button>
          )}

          {/* Run Assessment Button */}
          {activeView === 'patient' && (
            <button
              type="button"
              onClick={onRunAssessment}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#2D3135] text-white px-3 py-1 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8AB4F8]" />
                  <span className="font-mono">Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" />
                  <span>Re-Evaluate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
