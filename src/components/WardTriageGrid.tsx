import React, { useState } from 'react';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presetScenarios';
import { PatientRecord, FullAssessmentResult, UserProfile } from '../types/clinical';
import { generateDeterministicAssessment } from '../utils/clinicalAssessmentEngine';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Heart,
  TrendingDown,
  TrendingUp,
  User,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Zap,
  Bed,
} from 'lucide-react';

interface WardTriageGridProps {
  onSelectPatient: (scenario: PresetScenario) => void;
  activeScenarioId: string;
  currentUser: UserProfile;
  onOpenSbar?: () => void;
}

export const WardTriageGrid: React.FC<WardTriageGridProps> = ({
  onSelectPatient,
  activeScenarioId,
  currentUser,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'capped' | 'stable'>('all');

  // Compute live assessments for all preset patients
  const patientCards = PRESET_SCENARIOS.map((scenario) => {
    const assessment = generateDeterministicAssessment(scenario.record);
    const hrParam = scenario.record.parameters.find((p) => p.id === 'heart_rate');
    const bpParam = scenario.record.parameters.find((p) => p.id === 'blood_pressure');
    const spo2Param = scenario.record.parameters.find((p) => p.id === 'spo2');
    const tempParam = scenario.record.parameters.find((p) => p.id === 'temperature');

    const latestHr = hrParam?.readings.slice(-1)[0]?.value || '—';
    const latestBp = bpParam?.readings.slice(-1)[0]?.value || '—';
    const latestSpo2 = spo2Param?.readings.slice(-1)[0]?.value || '—';
    const latestTemp = tempParam?.readings.slice(-1)[0]?.value || '—';

    return {
      scenario,
      assessment,
      latestHr,
      latestBp,
      latestSpo2,
      latestTemp,
      isEmergency: assessment.stage5Recommendation.isEmergencyAlert,
      isCapped: assessment.stage3Risk.confidenceCapApplied,
    };
  });

  const filteredPatients = patientCards.filter((p) => {
    if (filter === 'critical') return p.assessment.stage3Risk.riskLevel === 'critical';
    if (filter === 'high') return p.assessment.stage3Risk.riskLevel === 'high';
    if (filter === 'capped') return p.isCapped;
    if (filter === 'stable') return p.assessment.stage3Risk.riskLevel === 'low';
    return true;
  });

  const criticalCount = patientCards.filter((p) => p.assessment.stage3Risk.riskLevel === 'critical').length;
  const highCount = patientCards.filter((p) => p.assessment.stage3Risk.riskLevel === 'high').length;
  const cappedCount = patientCards.filter((p) => p.isCapped).length;
  const stableCount = patientCards.filter((p) => p.assessment.stage3Risk.riskLevel === 'low').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200" id="ward-triage-view">
      {/* Ward Telemetry KPI Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#DADCE0] rounded-xs p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#5F6368] font-mono">Active ICU/Ward Census</span>
            <Bed className="w-4 h-4 text-[#1967D2]" />
          </div>
          <div className="text-xl font-bold text-[#1A1C1E] mt-1 font-mono">{patientCards.length} Monitored Beds</div>
          <div className="text-[10px] text-[#5F6368] mt-1">Continuous Telemetry Streams</div>
        </div>

        <div className="bg-white border border-[#FAD2CF] bg-[#FDF7F7] rounded-xs p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#D93025] font-mono">Critical RRT Alerts</span>
            <ShieldAlert className="w-4 h-4 text-[#D93025]" />
          </div>
          <div className="text-xl font-bold text-[#D93025] mt-1 font-mono">{criticalCount} Confirmed RRT</div>
          <div className="text-[10px] text-[#A50E0E] mt-1">Multi-Point Sustained Trajectory</div>
        </div>

        <div className="bg-white border border-[#FEEFC3] bg-[#FEFDF0] rounded-xs p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#B06000] font-mono">False Alarms Suppressed</span>
            <Sparkles className="w-4 h-4 text-[#E37400]" />
          </div>
          <div className="text-xl font-bold text-[#B06000] mt-1 font-mono">{cappedCount} Capped Spikes</div>
          <div className="text-[10px] text-[#804000] mt-1">Single Outlier Confidence Gated</div>
        </div>

        <div className="bg-white border border-[#CEEAD6] bg-[#F6FBF7] rounded-xs p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#137333] font-mono">Reassuring / Stable</span>
            <CheckCircle2 className="w-4 h-4 text-[#188038]" />
          </div>
          <div className="text-xl font-bold text-[#137333] mt-1 font-mono">{stableCount} Routine Care</div>
          <div className="text-[10px] text-[#137333] mt-1">Safe Outpatient/Step-down</div>
        </div>
      </div>

      {/* Filter Tabs & View Controls */}
      <div className="bg-white border border-[#DADCE0] rounded-xs p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5F6368]" />
          <span className="text-xs font-bold uppercase text-[#1A1C1E] tracking-tight">Triage Filter:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#1967D2] text-white shadow-xs'
                  : 'bg-[#F1F3F4] text-[#3C4043] hover:bg-[#E8EAED]'
              }`}
            >
              All Beds ({patientCards.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`text-xs px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'critical'
                  ? 'bg-[#D93025] text-white shadow-xs'
                  : 'bg-[#FCE8E6] text-[#D93025] hover:bg-[#FAD2CF]'
              }`}
            >
              Critical RRT ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('capped')}
              className={`text-xs px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'capped'
                  ? 'bg-[#E37400] text-white shadow-xs'
                  : 'bg-[#FEF7E0] text-[#B06000] hover:bg-[#FEEFC3]'
              }`}
            >
              Data Capped ({cappedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('stable')}
              className={`text-xs px-2.5 py-1 rounded-xs font-medium transition-colors cursor-pointer ${
                filter === 'stable'
                  ? 'bg-[#188038] text-white shadow-xs'
                  : 'bg-[#E6F4EA] text-[#137333] hover:bg-[#CEEAD6]'
              }`}
            >
              Stable ({stableCount})
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#5F6368] flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#188038] animate-pulse"></span>
          <span>Live Surveillance Feed (Active Clinician: {currentUser.name.split(',')[0]})</span>
        </div>
      </div>

      {/* Patient Triage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(({ scenario, assessment, latestHr, latestBp, latestSpo2, latestTemp, isEmergency, isCapped }) => {
          const isActive = scenario.id === activeScenarioId;
          const isCritical = assessment.stage3Risk.riskLevel === 'critical';
          const isHigh = assessment.stage3Risk.riskLevel === 'high';
          const isLow = assessment.stage3Risk.riskLevel === 'low';

          let borderAccent = 'border-[#DADCE0] hover:border-[#1967D2]';
          let headerBg = 'bg-[#F8F9FA]';
          let badgeBg = 'bg-[#E8F0FE] text-[#1967D2] border-[#D2E3FC]';

          if (isEmergency) {
            borderAccent = 'border-[#D93025] ring-1 ring-[#D93025]/30 shadow-md';
            headerBg = 'bg-[#FCE8E6]';
            badgeBg = 'bg-[#D93025] text-white border-[#D93025]';
          } else if (isCapped) {
            borderAccent = 'border-[#F29900] shadow-xs';
            headerBg = 'bg-[#FEF7E0]';
            badgeBg = 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]';
          } else if (isLow) {
            borderAccent = 'border-[#CEEAD6]';
            headerBg = 'bg-[#E6F4EA]/40';
            badgeBg = 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]';
          }

          return (
            <div
              key={scenario.id}
              className={`bg-white rounded-xs border ${borderAccent} shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                isActive ? 'ring-2 ring-[#1967D2]' : ''
              }`}
            >
              <div>
                {/* Card Top */}
                <div className={`p-3.5 border-b border-[#DADCE0] flex items-start justify-between ${headerBg}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1A1C1E]">
                        {scenario.record.patient.id}
                      </span>
                      <span className="text-[11px] font-bold text-[#1967D2]">
                        {scenario.record.patient.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5F6368] mt-0.5">
                      {scenario.record.patient.age}yo {scenario.record.patient.sex.toUpperCase()} • {scenario.category}
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${badgeBg}`}>
                    {isEmergency ? 'RRT ALERT' : `${assessment.stage3Risk.riskScore}% RISK`}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-3.5 space-y-3 text-xs">
                  {/* Deterioration Syndrome */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5F6368] block">Clinical Trajectory:</span>
                    <p className="text-[11px] font-medium text-[#1A1C1E] line-clamp-1 mt-0.5">
                      {assessment.stage3Risk.deteriorationSyndromeSuspected || scenario.name}
                    </p>
                  </div>

                  {/* Vitals Snapshot */}
                  <div className="grid grid-cols-4 gap-1 bg-[#F8F9FA] border border-[#DADCE0] p-2 rounded-xs text-center font-mono">
                    <div>
                      <span className="text-[9px] text-[#5F6368] block">HR</span>
                      <span className={`text-[11px] font-bold ${Number(latestHr) > 100 ? 'text-[#D93025]' : 'text-[#1A1C1E]'}`}>
                        {latestHr}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#5F6368] block">BP</span>
                      <span className="text-[11px] font-bold text-[#1A1C1E] truncate">
                        {latestBp}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#5F6368] block">SpO2</span>
                      <span className={`text-[11px] font-bold ${Number(latestSpo2) < 92 ? 'text-[#D93025]' : 'text-[#1A1C1E]'}`}>
                        {latestSpo2}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#5F6368] block">Temp</span>
                      <span className={`text-[11px] font-bold ${Number(latestTemp) > 101 ? 'text-[#D93025]' : 'text-[#1A1C1E]'}`}>
                        {latestTemp}°
                      </span>
                    </div>
                  </div>

                  {/* Confidence Metric & Cap Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#5F6368]">Prediction Confidence:</span>
                      <span className={`font-bold ${isCapped ? 'text-[#E37400]' : 'text-[#188038]'}`}>
                        {assessment.stage3Risk.confidenceScore}% ({assessment.stage3Risk.confidenceLevel.toUpperCase()})
                        {isCapped && ' [CAPPED]'}
                      </span>
                    </div>
                    <div className="w-full bg-[#E8EAED] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isCapped
                            ? 'bg-[#E37400]'
                            : assessment.stage3Risk.confidenceScore > 70
                            ? 'bg-[#188038]'
                            : 'bg-[#1967D2]'
                        }`}
                        style={{ width: `${assessment.stage3Risk.confidenceScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Top Anomaly Summary */}
                  <p className="text-[11px] text-[#5F6368] line-clamp-2 leading-relaxed">
                    {assessment.stage4Explainability.summary}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 bg-[#F8F9FA] border-t border-[#DADCE0] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#5F6368]">
                  {scenario.record.parameters.filter((p) => p.readings.length > 0).length} streams active
                </span>

                <button
                  type="button"
                  onClick={() => onSelectPatient(scenario)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1967D2] text-white shadow-xs'
                      : 'bg-white hover:bg-[#1967D2] hover:text-white text-[#1967D2] border border-[#ADCCF9]'
                  }`}
                >
                  <span>{isActive ? 'Deep Dive Active' : 'Launch Deep Dive'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
