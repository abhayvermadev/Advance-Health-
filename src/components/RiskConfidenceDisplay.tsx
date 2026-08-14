import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Lock,
  Flame,
  Info,
  Layers,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import { FullAssessmentResult, RiskLevel, ConfidenceLevel } from '../types/clinical';

interface RiskConfidenceDisplayProps {
  assessment: FullAssessmentResult;
  isLimitedMode: boolean;
}

export const RiskConfidenceDisplay: React.FC<RiskConfidenceDisplayProps> = ({
  assessment,
  isLimitedMode,
}) => {
  const { stage1Completeness, stage3Risk, stage5Recommendation } = assessment;

  // Risk styling helpers
  const getRiskDetails = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          textColor: 'text-[#D93025]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'CRITICAL',
          sub: 'Immediate Intervention',
        };
      case 'high':
        return {
          textColor: 'text-[#D93025]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'HIGH',
          sub: 'Elevating Rapidly',
        };
      case 'moderate':
        return {
          textColor: 'text-[#E67E22]',
          badgeBg: 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]',
          barColor: 'bg-[#F2994A]',
          label: 'MODERATE',
          sub: 'Subacute Drift',
        };
      case 'low':
      default:
        return {
          textColor: 'text-[#188038]',
          badgeBg: 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
          barColor: 'bg-[#34A853]',
          label: 'LOW',
          sub: 'Stable Trajectory',
        };
    }
  };

  // Confidence styling helpers
  const getConfidenceDetails = (level: ConfidenceLevel, capped: boolean) => {
    switch (level) {
      case 'high':
        return {
          textColor: 'text-[#1967D2]',
          badgeBg: 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]',
          barColor: 'bg-[#1967D2]',
          label: 'HIGH',
          sub: 'Multi-Point Verified',
        };
      case 'moderate':
        return {
          textColor: 'text-[#E67E22]',
          badgeBg: 'bg-[#FFF4E5] text-[#A65E00] border-[#FFD399]',
          barColor: 'bg-[#F2994A]',
          label: 'MODERATE',
          sub: capped ? 'Capped (Missing Labs)' : 'Partial Coverage',
        };
      case 'low':
      default:
        return {
          textColor: 'text-[#C5221F]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'LOW',
          sub: capped ? 'Capped (Single Point)' : 'Sparse Telemetry',
        };
    }
  };

  const riskInfo = getRiskDetails(stage3Risk.riskLevel);
  const confInfo = getConfidenceDetails(
    stage3Risk.confidenceLevel,
    stage3Risk.confidenceCapApplied
  );

  return (
    <div className="space-y-4">
      {/* 1. EMERGENCY ALERT BANNER OR FALSE-ALARM MITIGATION BANNER */}
      {stage5Recommendation.isEmergencyAlert ? (
        <div className="bg-[#D93025] text-white p-4 border border-[#B3261E] rounded-xs shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-xs font-mono">
                EMERGENCY ALERT &bull; RAPID ESCALATION
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-white/90">
              Window: {stage5Recommendation.followUpWindow}
            </span>
          </div>
          <h3 className="text-base font-bold tracking-tight text-white mt-1">
            {stage5Recommendation.headline}
          </h3>
          <div className="mt-2 text-xs bg-black/20 p-2 rounded-xs border border-white/20 text-white/95 font-mono">
            <span className="font-bold">Safety Rule Met: </span>
            {stage5Recommendation.emergencyRuleEvaluated}
          </div>
        </div>
      ) : (stage3Risk.riskLevel === 'high' || stage3Risk.riskLevel === 'critical') &&
        stage3Risk.confidenceLevel === 'low' ? (
        <div className="bg-[#FFF4E5] border border-[#FFD399] p-4 rounded-xs text-[#855B1B] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#E67E22]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A65E00]">
              FALSE-ALARM MITIGATION ACTIVE &bull; SIREN SUPPRESSED
            </span>
          </div>
          <h3 className="text-sm font-bold text-[#5F3B08] tracking-tight">
            High-Risk Outlier Detected on Low Confidence Data
          </h3>
          <p className="text-xs text-[#855B1B] mt-1 leading-relaxed">
            {stage5Recommendation.emergencyRuleEvaluated}
          </p>
          <div className="mt-2 text-xs bg-white/80 border border-[#FFD399] p-2 rounded-xs text-[#6B470D]">
            <strong className="text-[#4D3108]">Protocol Action: </strong>
            Order immediate repeat readings &amp; targeted labs rather than triggering an emergency siren.
          </div>
        </div>
      ) : (
        <div className="bg-[#F8F9FA] border border-[#E0E2E6] px-4 py-2.5 rounded-xs text-xs flex items-center justify-between text-[#1A1C1E]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#188038]" />
            <span className="text-xs font-medium text-[#3C4043]">
              Safety Invariant: Sustained trajectory across &ge;2 readings required for emergency alerts.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#80868B] uppercase">
            Protocol: Calibrated
          </span>
        </div>
      )}

      {/* 2. PRIMARY DUAL DISPLAY: PREDICTED RISK & INDEPENDENT CONFIDENCE (THEME DATA GRID CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CARD A: PREDICTED DETERIORATION RISK */}
        <div className="bg-white p-5 border border-[#E0E2E6] shadow-xs flex flex-col justify-between relative overflow-hidden rounded-xs">
          <div className="absolute top-0 right-0 p-2 opacity-10 font-bold text-6xl select-none pointer-events-none text-[#1A1C1E]">
            RISK
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#6D7278] uppercase tracking-wider block">
                Predicted Deterioration Risk
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border uppercase ${riskInfo.badgeBg}`}
              >
                {riskInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className={`text-5xl font-bold tracking-tight ${riskInfo.textColor}`}>
                {stage3Risk.riskScore}
              </span>
              <span className="text-xs font-mono font-bold uppercase text-[#6D7278]">
                / 100 Risk Index ({riskInfo.sub})
              </span>
            </div>

            {/* Technical Thin Progress Bar */}
            <div className="w-full bg-[#F1F3F4] h-1.5 mt-4">
              <div
                className={`h-full transition-all duration-700 ${riskInfo.barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, stage3Risk.riskScore))}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[#80868B] uppercase tracking-wider mt-1.5">
              <span>0 (Stable)</span>
              <span>30 (Low)</span>
              <span>60 (Moderate)</span>
              <span>80+ (Critical)</span>
            </div>
          </div>

          {stage3Risk.deteriorationSyndromeSuspected && (
            <div className="mt-3 pt-2.5 border-t border-[#F1F3F4] text-xs text-[#3C4043]">
              <span className="font-bold text-[#1A1C1E]">Pattern: </span>
              <span className="font-mono text-xs">{stage3Risk.deteriorationSyndromeSuspected}</span>
            </div>
          )}
        </div>

        {/* CARD B: MECHANICAL ASSESSMENT CONFIDENCE */}
        <div className="bg-white p-5 border border-[#E0E2E6] shadow-xs flex flex-col justify-between relative overflow-hidden rounded-xs">
          <div className="absolute top-0 right-0 p-2 opacity-10 font-bold text-6xl select-none pointer-events-none text-[#1A1C1E]">
            CONF
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-[#6D7278] uppercase tracking-wider block">
                Assessment Confidence Level
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border uppercase ${confInfo.badgeBg}`}
              >
                {confInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span className={`text-5xl font-bold tracking-tight ${confInfo.textColor}`}>
                {stage3Risk.confidenceScore}%
              </span>
              <span className="text-xs font-mono font-bold uppercase text-[#6D7278]">
                {confInfo.sub}
              </span>
            </div>

            {/* Technical Thin Progress Bar */}
            <div className="w-full bg-[#F1F3F4] h-1.5 mt-4">
              <div
                className={`h-full transition-all duration-700 ${confInfo.barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, stage3Risk.confidenceScore))}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[#80868B] uppercase tracking-wider mt-1.5">
              <span>0% (Sparse)</span>
              <span>40% (Capped)</span>
              <span>70% (Verified)</span>
              <span>100%</span>
            </div>
          </div>

          {stage1Completeness.confidenceCappedReason ? (
            <div className="mt-3 pt-2.5 border-t border-[#F1F3F4] text-xs text-[#A65E00] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
              <span className="truncate font-medium">
                <strong>Mechanical Cap: </strong>
                {stage1Completeness.confidenceCappedReason}
              </span>
            </div>
          ) : (
            <div className="mt-3 pt-2.5 border-t border-[#F1F3F4] text-xs text-[#5F6368]">
              <span className="font-bold text-[#1A1C1E]">Basis: </span>
              Multi-point longitudinal trajectory &amp; full vital sign coverage.
            </div>
          )}
        </div>
      </div>

      {/* 3. DATA COMPLETENESS PROFILE METER CARD */}
      <div className="bg-white border border-[#E0E2E6] p-4 shadow-xs rounded-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#F1F3F4] pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D7278]">
            Data Completeness Profile &bull; Stage 1 Verification
          </span>
          <span className="text-xs font-mono font-bold text-[#1A1C1E]">
            {stage1Completeness.recordedParametersCount} / {stage1Completeness.totalParametersTracked} Parameters Recorded ({stage1Completeness.overallCoveragePercent}%)
          </span>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 h-2.5 bg-[#F1F3F4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#34A853] transition-all duration-500"
              style={{ width: `${stage1Completeness.overallCoveragePercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-mono font-bold text-[#1A1C1E]">
            {stage1Completeness.overallCoveragePercent}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2 bg-[#F8F9FA] border border-[#E0E2E6] rounded-xs text-center">
            <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Vital Coverage</span>
            <span className="text-xs font-mono font-bold text-[#1A1C1E]">
              {stage1Completeness.vitalCoveragePercent}%
            </span>
          </div>

          <div className="p-2 bg-[#F8F9FA] border border-[#E0E2E6] rounded-xs text-center">
            <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Lab Biomarkers</span>
            <span className="text-xs font-mono font-bold text-[#1A1C1E]">
              {stage1Completeness.labCoveragePercent}%
            </span>
          </div>

          <div className="p-2 bg-[#F8F9FA] border border-[#E0E2E6] rounded-xs text-center">
            <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Temporal Depth</span>
            <span className="text-xs font-mono font-bold text-[#1A1C1E]">
              {stage1Completeness.temporalDepthScore} / 45 pts
            </span>
          </div>

          <div className="p-2 bg-[#F8F9FA] border border-[#E0E2E6] rounded-xs text-center">
            <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Confidence Cap</span>
            <span
              className={`text-xs font-mono font-bold ${
                stage1Completeness.confidenceCappedReason ? 'text-[#C5221F]' : 'text-[#188038]'
              }`}
            >
              {stage1Completeness.confidenceCappedReason ? 'Active' : 'Uncapped'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
