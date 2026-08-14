import React, { useState, useMemo } from 'react';
import {
  Building2,
  Bed,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Users,
  Clock,
  Radio,
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Flame,
  Stethoscope,
  Send,
  Zap,
  RefreshCw,
  Search,
  BellRing,
  Info,
} from 'lucide-react';
import { HospitalWardSummary, HospitalIncidentAlert, UserProfile } from '../types/clinical';
import { INITIAL_HOSPITAL_WARDS, INITIAL_HOSPITAL_INCIDENTS } from '../data/hospitalWardsData';

interface MedicalSuperintendentViewProps {
  currentUser: UserProfile | null;
  onSelectWardPatient?: (patientId: string) => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const MedicalSuperintendentView: React.FC<MedicalSuperintendentViewProps> = ({
  currentUser,
  onSelectWardPatient,
  onLogAudit,
}) => {
  const [wards, setWards] = useState<HospitalWardSummary[]>(INITIAL_HOSPITAL_WARDS);
  const [incidents, setIncidents] = useState<HospitalIncidentAlert[]>(INITIAL_HOSPITAL_INCIDENTS);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ICU' | 'Step-Down' | 'Emergency' | 'Acute Medical'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBroadcastingAlert, setIsBroadcastingAlert] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [activeBroadcastBanner, setActiveBroadcastBanner] = useState<string | null>(null);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(new Date().toLocaleTimeString());

  // Aggregate Hospital-Wide Metrics
  const metrics = useMemo(() => {
    const totalBeds = wards.reduce((sum, w) => sum + w.totalBeds, 0);
    const occupiedBeds = wards.reduce((sum, w) => sum + w.occupiedBeds, 0);
    const totalCritical = wards.reduce((sum, w) => sum + w.criticalPatientsCount, 0);
    const totalUncertaintyCapped = wards.reduce((sum, w) => sum + w.dataCappedUncertaintyCount, 0);
    const icuWards = wards.filter((w) => w.category === 'ICU');
    const icuTotalBeds = icuWards.reduce((sum, w) => sum + w.totalBeds, 0);
    const icuOccupiedBeds = icuWards.reduce((sum, w) => sum + w.occupiedBeds, 0);
    const overallOccupancyPct = Math.round((occupiedBeds / totalBeds) * 100);
    const icuOccupancyPct = Math.round((icuOccupiedBeds / icuTotalBeds) * 100);

    return {
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      overallOccupancyPct,
      icuOccupancyPct,
      totalCritical,
      totalUncertaintyCapped,
    };
  }, [wards]);

  // Filtered wards list
  const filteredWards = useMemo(() => {
    return wards.filter((w) => {
      const matchesCat = selectedCategory === 'ALL' || w.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.chiefNurseOnDuty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.attendingConsultant.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [wards, selectedCategory, searchQuery]);

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setActiveBroadcastBanner(broadcastMessage);
    const msg = broadcastMessage;
    setBroadcastMessage('');
    setIsBroadcastingAlert(false);

    if (onLogAudit) {
      onLogAudit(
        'HOSPITAL_ALERT_BROADCAST',
        `Hospital Superintendent ${currentUser.name} broadcasted system alert: "${msg}"`
      );
    }
  };

  const handleManualRefresh = () => {
    setLastRefreshedTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-5" id="medical-superintendent-view">
      {/* Executive Command Header Banner */}
      <div className="bg-[#1A1C1E] text-white p-5 rounded-xs border border-[#3C4043] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xs bg-[#1967D2]/20 border border-[#1967D2] flex items-center justify-center text-[#8AB4F8] shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold uppercase tracking-wider font-mono text-white">
                Medical Superintendent &bull; Hospital-Wide Operations Center
              </h2>
              <span className="text-[11px] font-mono font-bold bg-[#137333]/30 text-[#81C995] border border-[#137333] px-2 py-0.5 rounded-xs">
                EXECUTIVE OVERSIGHT ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#9AA0A6] mt-0.5">
              Live hospital capacity, critical deterioration trajectory surveillance, and surge dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2C3136] hover:bg-[#3C4043] text-white text-xs font-mono rounded-xs border border-[#4E5256] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SYNC ({lastRefreshedTime})</span>
          </button>

          {currentUser.permissions.canBroadcastHospitalAlerts && (
            <button
              type="button"
              onClick={() => setIsBroadcastingAlert((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D93025] hover:bg-[#C5221F] text-white text-xs font-mono font-bold rounded-xs shadow-xs transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>BROADCAST HOSPITAL ADVISORY</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcast Alert Bar (If Triggered) */}
      {activeBroadcastBanner && (
        <div className="bg-[#FCE8E6] border-l-4 border-[#D93025] p-3.5 rounded-r-xs flex items-center justify-between gap-3 text-xs text-[#C5221F] animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#D93025] animate-bounce shrink-0" />
            <div>
              <strong className="font-bold uppercase font-mono mr-2">HOSPITAL-WIDE DIRECTIVE:</strong>
              <span>{activeBroadcastBanner}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveBroadcastBanner(null)}
            className="text-[#C5221F] hover:underline font-mono text-[11px] shrink-0 cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Broadcast Composer Modal / Form */}
      {isBroadcastingAlert && (
        <form
          onSubmit={handleBroadcastSubmit}
          className="bg-[#FFF9F9] border border-[#F5C2C7] p-4 rounded-xs shadow-xs space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#C5221F]">
              <Radio className="w-4 h-4 text-[#D93025]" />
              <span>Issue Hospital-Wide Directive / Surge Capacity Alert</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBroadcastingAlert(false)}
              className="text-xs text-[#5F6368] hover:text-[#1A1C1E] font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g. Sepsis Surge Level 2: All step-down wards expedite repeat lactate and vitals frequency..."
            className="w-full text-xs p-2.5 bg-white border border-[#DADCE0] rounded-xs font-sans focus:outline-none focus:border-[#D93025]"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D93025] text-white text-xs font-mono font-bold rounded-xs hover:bg-[#C5221F] flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT ALL WARDS</span>
            </button>
          </div>
        </form>
      )}

      {/* 5-KPI Executive Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Metric 1: Total Hospital Bed Occupancy */}
        <div className="p-3.5 bg-white rounded-xs border border-[#E0E2E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-mono">
            <span>Total Bed Census</span>
            <Bed className="w-4 h-4 text-[#1967D2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#1A1C1E]">
              {metrics.occupiedBeds}/{metrics.totalBeds}
            </span>
            <span className="text-xs font-bold text-[#1967D2] font-mono">
              ({metrics.overallOccupancyPct}%)
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">{metrics.availableBeds} beds available hospital-wide</p>
        </div>

        {/* Metric 2: ICU Capacity */}
        <div className="p-3.5 bg-white rounded-xs border border-[#E0E2E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-mono">
            <span>ICU Critical Beds</span>
            <Flame className="w-4 h-4 text-[#D93025]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#D93025]">
              {metrics.icuOccupancyPct}%
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#FCE8E6] text-[#C5221F] px-1.5 py-0.2 rounded-xs">
              NEAR FULL
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">4 critical ICU beds left across MICU &amp; SICU</p>
        </div>

        {/* Metric 3: Active High Risk Deteriorations */}
        <div className="p-3.5 bg-white rounded-xs border border-[#E0E2E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-mono">
            <span>Active High Risk Alerts</span>
            <ShieldAlert className="w-4 h-4 text-[#C5221F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#C5221F]">
              {metrics.totalCritical} Patients
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">Multi-point deterioration trajectory flagged</p>
        </div>

        {/* Metric 4: Data Capped / Uncertainty Watchlist */}
        <div className="p-3.5 bg-white rounded-xs border border-[#E0E2E6] shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-mono">
            <span>Data Capped Warnings</span>
            <AlertTriangle className="w-4 h-4 text-[#B06000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#B06000]">
              {metrics.totalUncertaintyCapped} Patients
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">Sparse data; repeat telemetry ordered</p>
        </div>

        {/* Metric 5: TEE Computational Governance */}
        <div className="p-3.5 bg-white rounded-xs border border-[#E0E2E6] shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#5F6368] text-xs font-mono">
            <span>Confidential AI TEE</span>
            <CheckCircle2 className="w-4 h-4 text-[#188038]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#188038]">
              100% Attested
            </span>
          </div>
          <p className="text-[11px] text-[#5F6368]">AMD SEV-SNP Enclave In-Use Memory Secure</p>
        </div>
      </div>

      {/* Main Two-Column Layout: Ward Breakdown & Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Ward Status Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden">
            {/* Table Filters & Header */}
            <div className="p-4 border-b border-[#E0E2E6] bg-[#FCFDFD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] font-mono flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1967D2]" />
                  Hospital Ward Matrix &amp; Triage Acuity
                </h3>
                <p className="text-[11px] text-[#5F6368]">
                  Real-time bed census, staff ratio, and active clinical risk load
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'ICU', 'Step-Down', 'Emergency', 'Acute Medical'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-xs border transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#1967D2] text-white border-[#1967D2] font-bold'
                        : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Ward List */}
            <div className="divide-y divide-[#E0E2E6]">
              {filteredWards.map((ward) => {
                const occupancyRate = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
                const isCriticalSurge = occupancyRate >= 90 || ward.criticalPatientsCount >= 5;

                return (
                  <div
                    key={ward.id}
                    className="p-4 hover:bg-[#F8FAFD] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#1A1C1E] font-mono">{ward.name}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${
                            ward.category === 'ICU'
                              ? 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]'
                              : ward.category === 'Emergency'
                              ? 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]'
                              : 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]'
                          }`}
                        >
                          {ward.category.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-[#5F6368]">
                          Code: <strong>{ward.code}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-[#5F6368] flex-wrap">
                        <span>
                          Lead Intensivist/Consultant: <strong className="text-[#1A1C1E]">{ward.attendingConsultant}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>
                          Nurse Ratio: <strong className="text-[#1A1C1E]">{ward.nurseToPatientRatio}</strong>
                        </span>
                      </div>

                      {ward.recentAlert && (
                        <p className="text-[11px] text-[#C5221F] bg-[#FFF8F8] p-2 rounded-xs border border-[#FCE8E6] font-mono">
                          &bull; {ward.recentAlert}
                        </p>
                      )}
                    </div>

                    {/* Occupancy Progress & Acuity Column */}
                    <div className="w-full md:w-56 shrink-0 space-y-2 border-t md:border-t-0 pt-2 md:pt-0 border-[#F1F3F4]">
                      <div className="flex justify-between items-baseline text-xs font-mono">
                        <span className="text-[#5F6368]">Occupancy:</span>
                        <span className="font-bold text-[#1A1C1E]">
                          {ward.occupiedBeds}/{ward.totalBeds} ({occupancyRate}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#E0E2E6] h-2 rounded-xs overflow-hidden">
                        <div
                          className={`h-full rounded-xs transition-all ${
                            occupancyRate >= 90
                              ? 'bg-[#D93025]'
                              : occupancyRate >= 75
                              ? 'bg-[#E67E22]'
                              : 'bg-[#188038]'
                          }`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#5F6368]">
                        <span className="text-[#C5221F] font-bold">
                          {ward.criticalPatientsCount} Critical RRT Alerts
                        </span>
                        <span className="text-[#B06000]">
                          {ward.dataCappedUncertaintyCount} Sparse Capped
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Hospital Emergency Incident Feed */}
        <div className="space-y-4">
          <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-[#E0E2E6] bg-[#FCFDFD] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#D93025] animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E] font-mono">
                  Hospital Incident Log &bull; RRT Alerts
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#5F6368] bg-[#F1F3F4] px-1.5 py-0.5 rounded-xs">
                {incidents.length} RECENT
              </span>
            </div>

            <div className="p-3 divide-y divide-[#F1F3F4] space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-[#1A1C1E]">{inc.patientName}</span>
                    <span className="text-[#80868B]">{inc.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs border ${
                        inc.severity === 'critical_rrt'
                          ? 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]'
                          : inc.severity === 'high_drift'
                          ? 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]'
                          : 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]'
                      }`}
                    >
                      {inc.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-[#5F6368]">
                      Ward: <strong>{inc.wardCode}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-[#3C4043] leading-relaxed">{inc.headline}</p>

                  <div className="text-[10px] text-[#5F6368] bg-[#F8F9FA] p-2 rounded-xs border border-[#E0E2E6] font-mono">
                    <strong className="text-[#1A1C1E]">Action: </strong>
                    {inc.actionTaken}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Superintendent Governance Principles Card */}
          <div className="bg-[#F8FAFD] p-4 rounded-xs border border-[#ADCCF9] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[#1967D2] font-bold font-mono">
              <ShieldAlert className="w-4 h-4" />
              <span>Superintendent Governance Standard</span>
            </div>
            <p className="text-[11px] text-[#3C4043] leading-relaxed">
              In accordance with hospital clinical safety mandates, all patients identified with acute deterioration trajectories across &ge;2 longitudinal time points require attending consultant evaluation within 60 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
